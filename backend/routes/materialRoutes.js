import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

import { getMaterials, getMaterialById, addMaterial, deleteMaterial, downloadMaterial } from "../controllers/materialController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ─── Resolve __dirname in ESM ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Uploads directory ───────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "materials");
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Allowed file types ──────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip"]);
const ALLOWED_MIMES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
]);

// ─── Multer disk storage ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = path.basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .substring(0, 50);
        const unique = crypto.randomBytes(4).toString("hex");
        cb(null, `material-${unique}-${safeName}${ext}`);
    }
});

// ─── File filter ─────────────────────────────────────────────────────────────
function fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Unsupported file type: ${ext}`));
    }
    if (!ALLOWED_MIMES.has(file.mimetype) && file.mimetype !== "application/octet-stream") {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Unsupported MIME type: ${file.mimetype}`));
    }
    cb(null, true);
}

// ─── Multer instance ─────────────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
    }
});

// ─── Multer error handler wrapper ────────────────────────────────────────────
function handleMulterUpload(req, res, next) {
    const contentType = req.headers["content-type"] || "";
    if (contentType.toLowerCase().includes("multipart/form-data")) {
        upload.single("file")(req, res, function (err) {
            if (!err) return next();

            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ success: false, message: "File size exceeds the 20 MB limit." });
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({ success: false, message: err.field || "Unsupported file type." });
                }
                return res.status(400).json({ success: false, message: err.message || "File upload error." });
            }
            return res.status(400).json({ success: false, message: err.message || "File upload error." });
        });
    } else {
        next();
    }
}

// ─── Router ──────────────────────────────────────────────────────────────────
const router = Router();

router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getMaterials));
router.post("/", authenticate(["admin", "teacher"]), handleMulterUpload, asyncHandler(addMaterial));
router.get("/:id/download", authenticate(["admin", "teacher", "student"]), asyncHandler(downloadMaterial));
router.get("/:id", authenticate(["admin", "teacher", "student"]), asyncHandler(getMaterialById));
router.delete("/:id", authenticate(["admin", "teacher"]), asyncHandler(deleteMaterial));

export default router;
