import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Route imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import departmentRoutes from "./routes/departments.js";
import deviceRoutes from "./routes/device.js";
import studentRoutes from "./routes/student.js";
import adminRoutes from "./routes/admin.js";
import facultyRoutes from "./routes/faculty.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));

// Serve uploaded files (avatars etc.)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── Health Check ────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "EduSphere API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/auth/device", deviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🎓 EduSphere API Server`);
  console.log(`  ├─ Local:    http://localhost:${PORT}`);
  console.log(`  ├─ Health:   http://localhost:${PORT}/api/health`);
  console.log(`  ├─ Database: Neon PostgreSQL (pooled)`);
  console.log(`  └─ Status:   Ready\n`);
});
