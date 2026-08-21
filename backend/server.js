import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { connectDB } from "./config/database.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

// ─── Resolve __dirname in ESM ─────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Ensure uploads directories exist ─────────────────────────────────────────
const materialsDir = path.join(__dirname, "uploads", "materials");
const profilesDir = path.join(__dirname, "uploads", "profiles");
if (!fs.existsSync(materialsDir)) fs.mkdirSync(materialsDir, { recursive: true });
if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir, { recursive: true });

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Serve uploaded files statically ──────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "EduNest Backend Running Successfully" });
});

app.use("/", authRoutes);

// Profile routes with all standard aliases
app.use("/profile", profileRoutes);
app.use("/api/profile", profileRoutes);
app.use("/teacher/profile", profileRoutes);
app.use("/student/profile", profileRoutes);
app.use("/admin/profile", profileRoutes);
app.use("/api/teacher/profile", profileRoutes);
app.use("/api/student/profile", profileRoutes);
app.use("/api/admin/profile", profileRoutes);

// Role & Entity routes
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/courses", courseRoutes);
app.use("/batches", batchRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/fees", feeRoutes);
app.use("/materials", materialRoutes);
app.use("/notices", noticeRoutes);

// API prefixed aliases for compatibility
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/notices", noticeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server Running : http://localhost:${PORT}`);
        console.log(`📁 Uploads served at : http://localhost:${PORT}/uploads`);
    });
}

start();
