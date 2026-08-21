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

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// Upload directories
// ============================================================

const uploadsDir = path.join(__dirname, "uploads");
const materialsDir = path.join(uploadsDir, "materials");
const profilesDir = path.join(uploadsDir, "profiles");

for (const dir of [uploadsDir, materialsDir, profilesDir]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// ============================================================
// App
// ============================================================

const app = express();

// Render provides PORT in production.
// Local fallback remains 5000.
const PORT = Number(process.env.PORT) || 5000;

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://edunest-xi.vercel.app",
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow non-browser/server requests and local tools
            if (!origin) {
                return callback(null, true);
            }

            // Allow configured origins
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Do not crash the server for an unknown origin.
            // Let the request continue without CORS approval.
            return callback(null, false);
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "x-access-token",
            "x-auth-token",
        ],
        credentials: true,
    })
);

// ============================================================
// Body parsers
// ============================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================
// Static uploaded files
// ============================================================

app.use(
    "/uploads",
    express.static(uploadsDir, {
        fallthrough: true,
        index: false,
    })
);

// ============================================================
// Health / root route
// ============================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EduNest Backend Running Successfully",
        environment: process.env.NODE_ENV || "development",
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EduNest API is healthy",
    });
});

// ============================================================
// Authentication routes
//
// IMPORTANT:
// authRoutes.js must contain the actual login route.
// Example:
// router.post("/login", login);
//
// Because this router is mounted at "/":
// POST /login
// ============================================================

app.use("/", authRoutes);

// ============================================================
// Profile routes
// ============================================================

app.use("/profile", profileRoutes);
app.use("/api/profile", profileRoutes);

app.use("/teacher/profile", profileRoutes);
app.use("/student/profile", profileRoutes);
app.use("/admin/profile", profileRoutes);

app.use("/api/teacher/profile", profileRoutes);
app.use("/api/student/profile", profileRoutes);
app.use("/api/admin/profile", profileRoutes);

// ============================================================
// Main entity routes
// ============================================================

app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/courses", courseRoutes);
app.use("/batches", batchRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/fees", feeRoutes);
app.use("/materials", materialRoutes);
app.use("/notices", noticeRoutes);

// ============================================================
// /api aliases
// ============================================================

app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/notices", noticeRoutes);

// ============================================================
// 404 + Error handling
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start server
// ============================================================

async function start() {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(
                `🚀 EduNest Backend Running on 0.0.0.0:${PORT}`
            );
            console.log(
                `📁 Uploads: http://0.0.0.0:${PORT}/uploads`
            );
        });
    } catch (error) {
        console.error("❌ Failed to start EduNest backend:", error);
        process.exit(1);
    }
}

start();
