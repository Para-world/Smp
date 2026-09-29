import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hash, compare } from "../utils/crypto.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { authLimiter } from "../utils/middleware.js";

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────────────

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["student", "faculty", "admin", "parent", "dean", "registrar"]).default("student"),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  deviceId: z.string().min(1),
});

// ─── POST /api/auth/signup ───────────────────────────────────────────────────

router.post("/signup", authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = signupSchema.parse(req.body);

    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "User with this email already exists" });
      return;
    }

    const passwordHash = await hash(body.password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email,
        name: body.name,
        passwordHash,
        role: body.role,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      });

    const token = await signToken({ userId: newUser.id, role: newUser.role });

    res.status(201).json({
      user: newUser,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/signin ──────────────────────────────────────────────────

import { parseDevice, generateSecureCode, loginRateLimiter } from "../utils/device.js";
import { trustedDevices, deviceLoginRequests } from "../db/schema.js";
import { and, gt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendOTP } from "../utils/mailer.js";

router.post("/signin", loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = signinSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const valid = await compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

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
    console.error("Signin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/auth/session ───────────────────────────────────────────────────

router.get("/session", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || !user.isActive) {
      res.status(401).json({ error: "User not found or deactivated" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
