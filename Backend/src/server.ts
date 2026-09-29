import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
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
const isProduction = process.env.NODE_ENV === "production";

// ─── CORS ────────────────────────────────────────────────────────────────────

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
  : ["http://localhost:5173"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Allow dynamically configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all Vercel deployments dynamically (very useful for previews)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ─── Global Rate Limiter ─────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 300 : 5000, // strict in prod, relaxed in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later.", code: "RATE_LIMITED" },
});

app.use("/api", globalLimiter);

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
  res.status(404).json({ success: false, message: "Endpoint not found", code: "NOT_FOUND" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Never leak stack traces, SQL errors, or internal paths in production
  if (!isProduction) {
    console.error("Unhandled error:", err);
  } else {
    console.error("Unhandled error:", err.message);
  }
  res.status(500).json({ success: false, message: "Internal server error", code: "INTERNAL_ERROR" });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🎓 EduSphere API Server`);
  console.log(`  ├─ Local:    http://localhost:${PORT}`);
  console.log(`  ├─ Health:   http://localhost:${PORT}/api/health`);
  console.log(`  ├─ Database: Neon PostgreSQL (pooled)`);
  console.log(`  └─ Status:   Ready\n`);
});
