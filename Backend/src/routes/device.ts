import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { users, deviceLoginRequests, trustedDevices } from "../db/schema.js";
import { eq, and, gt, ne } from "drizzle-orm";
import { z } from "zod";
import { compare } from "../utils/crypto.js";
import { signToken } from "../utils/jwt.js";
import { AuthRequest, requireAuth } from "../utils/middleware.js";
import { verificationRateLimiter } from "../utils/device.js";

const router = Router();

// ─── GET /api/auth/device/request/:requestId (Status Polling) ────────────────

router.get("/request/:requestId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    const [request] = await db
      .select({
        status: deviceLoginRequests.status,
        expiresAt: deviceLoginRequests.expiresAt,
      })
      .from(deviceLoginRequests)
      .where(eq(deviceLoginRequests.requestId, String(requestId)))
      .limit(1);

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    res.json({
      status: request.status,
      expired: new Date() > request.expiresAt,
    });
  } catch (error) {
    console.error("Poll request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/device/verify (Submit Code) ─────────────────────────────

const verifySchema = z.object({
  requestId: z.string().uuid(),
  code: z.string().length(6),
  deviceId: z.string().min(1),
});

router.post("/verify", verificationRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = verifySchema.parse(req.body);

    const [request] = await db
      .select()
      .from(deviceLoginRequests)
      .where(eq(deviceLoginRequests.requestId, String(body.requestId)))
      .limit(1);

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.status !== "APPROVED" && request.status !== "PENDING") {
      res.status(403).json({ error: `Request is ${request.status.toLowerCase()}` });
      return;
    }

    if (new Date() > request.expiresAt) {
      await db.update(deviceLoginRequests).set({ status: "EXPIRED" }).where(eq(deviceLoginRequests.id, request.id));
      res.status(403).json({ error: "Security code expired" });
      return;
    }

    if (request.attemptCount >= 5) {
      await db.update(deviceLoginRequests).set({ status: "REJECTED" }).where(eq(deviceLoginRequests.id, request.id));
      res.status(403).json({ error: "Too many failed attempts. Request blocked." });
      return;
    }

    // Verify the code
    const valid = await compare(body.code, request.codeHash as string);
    if (!valid) {
      await db
        .update(deviceLoginRequests)
        .set({ attemptCount: request.attemptCount + 1 })
        .where(eq(deviceLoginRequests.id, request.id));
      
      res.status(401).json({ error: "Incorrect security code" });
      return;
    }

    // Must be in a state where we can verify
    if (request.status !== "PENDING") {
      res.status(403).json({ error: "Request is no longer valid" });
      return;
    }

    // Code is correct!
    await db
      .update(deviceLoginRequests)
      .set({ status: "USED", usedAt: new Date() })
      .where(eq(deviceLoginRequests.id, request.id));

    // Trust the new device
    await db.insert(trustedDevices).values({
      userId: request.userId,
      deviceId: body.deviceId,
      deviceName: request.deviceName,
      browser: request.browser,
      operatingSystem: request.operatingSystem,
      trusted: true,
    });

    // Get the user to generate token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1);

    const token = await signToken({ userId: user.id, role: user.role });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Verify error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/auth/devices (List Connected Devices) ─────────────────────────

router.get("/devices", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentDeviceId = req.headers["x-device-id"] as string;

    const devices = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.userId, req.user!.userId),
          eq(trustedDevices.trusted, true)
        )
      )
      .orderBy(trustedDevices.lastActiveAt);

    // Map to include an isCurrent flag
    const mapped = devices.map(d => ({
      ...d,
      isCurrent: d.deviceId === currentDeviceId
    }));

    res.json({ devices: mapped });
  } catch (error) {
    console.error("List devices error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/auth/devices/:deviceId (Revoke Device) ─────────────────────

router.delete("/devices/:deviceId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;

    await db
      .update(trustedDevices)
      .set({ trusted: false, revokedAt: new Date() })
      .where(
        and(
          eq(trustedDevices.deviceId, String(deviceId)),
          eq(trustedDevices.userId, String(req.user!.userId))
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("Revoke device error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/devices/logout-all ──────────────────────────────────────

router.post("/devices/logout-all", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentDeviceId = req.headers["x-device-id"] as string;

    await db
      .update(trustedDevices)
      .set({ trusted: false, revokedAt: new Date() })
      .where(
        and(
          eq(trustedDevices.userId, req.user!.userId),
          ne(trustedDevices.deviceId, currentDeviceId) // Don't logout current device
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
