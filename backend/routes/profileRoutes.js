import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_DIR = path.join(__dirname, "..", "uploads", "profiles");

if (!fs.existsSync(PROFILES_DIR)) {
    fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/octet-stream"
]);

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, PROFILES_DIR);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        const role = req.user ? req.user.role : "user";
        const ref = req.user ? (req.user.referenceId || req.user.userId || "profile") : "profile";
        const unique = crypto.randomBytes(4).toString("hex");
        cb(null, `${role}-${ref}-${unique}${ext}`);
    }
});

function fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Unsupported image type: ${ext}`));
    }
    if (!ALLOWED_MIMES.has(file.mimetype) && file.mimetype !== "application/octet-stream") {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Unsupported image format: ${file.mimetype}`));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

function handleProfilePhotoUpload(req, res, next) {
    const contentType = req.headers["content-type"] || "";
    if (contentType.toLowerCase().includes("multipart/form-data")) {
        upload.single("photo")(req, res, function (err) {
            if (!err) return next();

            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ success: false, message: "Profile photo size exceeds 5 MB limit." });
                }
                return res.status(400).json({ success: false, message: err.message || "Photo upload error." });
            }
            return res.status(400).json({ success: false, message: err.message || "Photo upload error." });
        });
    } else {
        next();
    }
}

const router = Router();

// GET routes
router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getProfile));
router.get("/me", authenticate(["admin", "teacher", "student"]), asyncHandler(getProfile));
router.get("/teacher", authenticate(["admin", "teacher"]), asyncHandler(getProfile));
router.get("/student", authenticate(["admin", "student"]), asyncHandler(getProfile));
router.get("/admin", authenticate(["admin"]), asyncHandler(getProfile));

// PUT & POST routes
router.put("/", authenticate(["admin", "teacher", "student"]), handleProfilePhotoUpload, asyncHandler(updateProfile));
router.post("/", authenticate(["admin", "teacher", "student"]), handleProfilePhotoUpload, asyncHandler(updateProfile));
router.put("/photo", authenticate(["admin", "teacher", "student"]), handleProfilePhotoUpload, asyncHandler(updateProfile));
router.post("/photo", authenticate(["admin", "teacher", "student"]), handleProfilePhotoUpload, asyncHandler(updateProfile));

export default router;
