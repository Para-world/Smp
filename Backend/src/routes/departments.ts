import { Router, Response } from "express";
import { db } from "../db/index.js";
import { departments, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest, requireAuth, requireRole } from "../utils/middleware.js";

const router = Router();

// ─── Validation ──────────────────────────────────────────────────────────────

const createDepartmentSchema = z.object({
  name: z.string().min(2).max(255),
  code: z.string().min(2).max(20).toUpperCase(),
  description: z.string().optional(),
  headId: z.string().uuid().optional(),
});

// ─── GET /api/departments — List departments ─────────────────────────────────

router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allDepartments = await db
      .select({
        id: departments.id,
        name: departments.name,
        code: departments.code,
        description: departments.description,
        headId: departments.headId,
        createdAt: departments.createdAt,
      })
      .from(departments);

    res.json({ departments: allDepartments, count: allDepartments.length });
  } catch (error) {
    console.error("List departments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/departments/:id — Get department details ───────────────────────

router.get("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
      .limit(1);

    if (!department) {
      res.status(404).json({ error: "Department not found" });
      return;
    }

    res.json({ department });
  } catch (error) {
    console.error("Get department error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/departments — Create department (admin only) ──────────────────

router.post("/", requireAuth, requireRole("admin", "dean"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = createDepartmentSchema.parse(req.body);

    const [newDept] = await db
      .insert(departments)
      .values(body)
      .returning();

    res.status(201).json({ department: newDept });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Create department error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
