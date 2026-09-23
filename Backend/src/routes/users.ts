import { Router, Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AuthRequest, requireAuth, requireRole } from "../utils/middleware.js";

const router = Router();

// ─── GET /api/users — List all users (admin only) ───────────────────────────

router.get("/", requireAuth, requireRole("admin", "registrar"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users);

    res.json({ users: allUsers, count: allUsers.length });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/users/:id — Get user profile ───────────────────────────────────

router.get("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Students can only view their own profile
    if (req.user!.role === "student" && req.user!.userId !== id) {
      res.status(403).json({ error: "Cannot view other user profiles" });
      return;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatarUrl: users.avatarUrl,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
