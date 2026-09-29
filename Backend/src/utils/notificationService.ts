/**
 * ─── CENTRALIZED NOTIFICATION SERVICE ────────────────────────────────────────
 *
 * Event-driven notification service. All notification logic flows through here.
 *
 * Usage:
 *   import { notify } from "../utils/notificationService.js";
 *
 *   await notify.assignmentCreated({
 *     recipientIds: ["user-uuid-1", "user-uuid-2"],
 *     title: "New Assignment: Homework 5",
 *     message: "A new assignment has been posted for CS101.",
 *     entityId: "assignment-uuid",
 *     priority: "NORMAL",
 *     emailSubject: "New Assignment: Homework 5",
 *     emailHtml: "<h2>New Assignment</h2><p>...</p>",
 *     recipientEmails: ["student1@example.com", "student2@example.com"],
 *   });
 *
 * This avoids duplicating notification + email logic inside every route handler.
 */

import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { sendNotificationEmail } from "./mailer.js";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationType =
  | "ASSIGNMENT_CREATED" | "ASSIGNMENT_DUE_SOON" | "ASSIGNMENT_GRADED"
  | "EXAM_CREATED" | "EXAM_UPDATED" | "EXAM_CANCELLED" | "EXAM_POSTPONED"
  | "TIMETABLE_UPDATED" | "CLASS_CANCELLED" | "ROOM_CHANGED"
  | "RESULT_PUBLISHED" | "ATTENDANCE_WARNING" | "ANNOUNCEMENT_PUBLISHED"
  | "SYSTEM";

type Priority = "NORMAL" | "IMPORTANT" | "URGENT";

interface NotifyOptions {
  recipientIds: string[];
  title: string;
  message: string;
  entityType: string;
  entityId?: string;
  priority?: Priority;
  // Optional email fields — if provided, emails are sent asynchronously
  emailSubject?: string;
  emailHtml?: string;
  recipientEmails?: string[];
}

// ─── Core Dispatch ───────────────────────────────────────────────────────────

async function dispatchNotification(
  type: NotificationType,
  options: NotifyOptions
): Promise<void> {
  const {
    recipientIds,
    title,
    message,
    entityType,
    entityId,
    priority = "NORMAL",
    emailSubject,
    emailHtml,
    recipientEmails,
  } = options;

  // 1. Insert in-app notifications (batch insert)
  if (recipientIds.length > 0) {
    const values = recipientIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      entityType,
      entityId: entityId || null,
      priority,
    }));

    try {
      await db.insert(notifications).values(values);
    } catch (err) {
      console.error(`[NotificationService] Failed to insert in-app notifications for ${type}:`, err);
    }
  }

  // 2. Send emails asynchronously (fire-and-forget, never blocks the caller)
  if (emailSubject && emailHtml && recipientEmails && recipientEmails.length > 0) {
    setImmediate(async () => {
      for (const email of recipientEmails) {
        try {
          await sendNotificationEmail(email, emailSubject, emailHtml);
        } catch (err) {
          console.error(`[NotificationService] Email failed for ${email}:`, err);
        }
      }
    });
  }
}

// ─── Named Event Methods ─────────────────────────────────────────────────────

export type CreateNotifyOptions = Omit<NotifyOptions, "entityType">;

export const notify = {
  /** Assignment has been created / published */
  assignmentCreated: (opts: CreateNotifyOptions) =>
    dispatchNotification("ASSIGNMENT_CREATED", { ...opts, entityType: "assignment" }),

  /** Assignment is due soon */
  assignmentDueSoon: (opts: CreateNotifyOptions) =>
    dispatchNotification("ASSIGNMENT_DUE_SOON", { ...opts, entityType: "assignment" }),

  /** Assignment has been graded */
  assignmentGraded: (opts: CreateNotifyOptions) =>
    dispatchNotification("ASSIGNMENT_GRADED", { ...opts, entityType: "assignment" }),

  /** Exam created */
  examCreated: (opts: CreateNotifyOptions) =>
    dispatchNotification("EXAM_CREATED", { ...opts, entityType: "exam" }),

  /** Exam updated (date, venue, etc.) */
  examUpdated: (opts: CreateNotifyOptions) =>
    dispatchNotification("EXAM_UPDATED", { ...opts, entityType: "exam" }),

  /** Exam cancelled */
  examCancelled: (opts: CreateNotifyOptions) =>
    dispatchNotification("EXAM_CANCELLED", { ...opts, entityType: "exam" }),

  /** Exam postponed */
  examPostponed: (opts: CreateNotifyOptions) =>
    dispatchNotification("EXAM_POSTPONED", { ...opts, entityType: "exam" }),

  /** Timetable updated */
  timetableUpdated: (opts: CreateNotifyOptions) =>
    dispatchNotification("TIMETABLE_UPDATED", { ...opts, entityType: "timetable" }),

  /** Class cancelled */
  classCancelled: (opts: CreateNotifyOptions) =>
    dispatchNotification("CLASS_CANCELLED", { ...opts, entityType: "timetable" }),

  /** Room changed */
  roomChanged: (opts: CreateNotifyOptions) =>
    dispatchNotification("ROOM_CHANGED", { ...opts, entityType: "timetable" }),

  /** Result published */
  resultPublished: (opts: CreateNotifyOptions) =>
    dispatchNotification("RESULT_PUBLISHED", { ...opts, entityType: "result" }),

  /** Attendance warning */
  attendanceWarning: (opts: CreateNotifyOptions) =>
    dispatchNotification("ATTENDANCE_WARNING", { ...opts, entityType: "attendance" }),

  /** Announcement published */
  announcementPublished: (opts: CreateNotifyOptions) =>
    dispatchNotification("ANNOUNCEMENT_PUBLISHED", { ...opts, entityType: "announcement" }),

  /** Generic system notification */
  system: (opts: CreateNotifyOptions) =>
    dispatchNotification("SYSTEM", { ...opts, entityType: "system" }),
};
