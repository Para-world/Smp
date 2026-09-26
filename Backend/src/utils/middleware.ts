import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt.js";
import { Permission, hasPermission } from "./permissions.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  verifyToken(token).then((payload) => {
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = payload;
    next();
  }).catch(() => {
    res.status(401).json({ error: "Authentication failed" });
  });
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!hasPermission(req.user.role, permission)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}
