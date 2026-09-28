import { db } from "../db/index.js";
import { systemAuditLogs } from "../db/schema.js";

export const logAudit = async (
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null = null,
  oldValue: any = null,
  newValue: any = null,
  ipAddress: string | null = null,
  userAgent: string | null = null
) => {
  try {
    // Sanitize values to ensure no sensitive info is logged
    const sanitizedOldValue = sanitizeData(oldValue);
    const sanitizedNewValue = sanitizeData(newValue);

    await db.insert(systemAuditLogs).values({
      actorId,
      action,
      entity,
      entityId,
      oldValue: sanitizedOldValue,
      newValue: sanitizedNewValue,
      ipAddress: ipAddress?.substring(0, 45) || null,
      userAgent
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};

const sanitizeData = (data: any) => {
  if (!data) return null;
  const clone = typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : { value: data };
  
  const sensitiveKeys = ['password', 'token', 'otp', 'securityCode', 'secret'];
  
  const sanitizeRecursive = (obj: any) => {
    for (const key in obj) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeRecursive(obj[key]);
      }
    }
  };

  if (typeof clone === 'object') {
    sanitizeRecursive(clone);
  }

  return clone;
};
