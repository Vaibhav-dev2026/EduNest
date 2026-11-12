import { ObjectId } from "mongodb";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getDB } from "../config/database.js";
import { isValidObjectId, formatDateDDMMYYYY, resolveReference, nextSequentialId } from "../utils/helpers.js";
import { emitEvent } from "../services/socketService.js";

// ─── Resolve __dirname in ESM ─────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "materials");

// ─── Helper: safe delete uploaded file from disk ─────────────────────────────
function safeDeleteFile(fileUrl) {
    if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.startsWith("/uploads/materials/")) return;
    try {
        const filename = path.basename(fileUrl);
        if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) return;
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Failed to delete file from disk:", err.message);
    }
}

// ─── Helper: derive file type label from extension ───────────────────────────
function extToType(ext) {
    const map = {
        ".pdf": "PDF",
        ".doc": "DOC",
        ".docx": "DOCX",
        ".ppt": "PPT",
        ".pptx": "PPTX",
        ".zip": "ZIP",
    };
    return map[ext.toLowerCase()] || ext.replace(".", "").toUpperCase() || "Document";
}

// ─── Enrich a raw material document with resolved readable names ──────────────
async function enrichMaterial(db, material, cache = {}) {
    const out = { ...material };

    // 1. Resolve Teacher / Uploaded By
    let uploadedBy = null;
    if (material.uploadedBy !== undefined && material.uploadedBy !== null && String(material.uploadedBy).trim() !== "") {
        const rawUploadedBy = String(material.uploadedBy).trim();
        if (/^TCH\d+$/i.test(rawUploadedBy) || rawUploadedBy.length === 24) {
            const key = `teacher_${rawUploadedBy}`;
            if (!(key in cache)) cache[key] = await resolveReference(db, "teachers", rawUploadedBy, "teacherId");
            const teacher = cache[key];
            if (teacher) {
                uploadedBy = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
            }
        } else {
            uploadedBy = rawUploadedBy;
        }
    }

    if (!uploadedBy && material.teacherId) {
        const key = `teacher_${material.teacherId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "teachers", material.teacherId, "teacherId");
        const teacher = cache[key];
        if (teacher) uploadedBy = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
    }
    if (!uploadedBy && material.teacher) {
        uploadedBy = String(material.teacher).trim();
    }
    out.uploadedBy = uploadedBy && uploadedBy !== "" ? uploadedBy : "Not Available";

    // 2. Resolve Course Name
    let courseName = null;
    if (material.courseName !== undefined && material.courseName !== null && String(material.courseName).trim() !== "" && material.courseName !== "Not Available") {
        courseName = String(material.courseName).trim();
    }
    if (!courseName && material.courseId) {
        const key = `course_${material.courseId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "courses", material.courseId, "courseId");
        const course = cache[key];
        if (course) courseName = course.courseName || course.name || null;
    }
    if (!courseName && material.course) {
        const courseStr = String(material.course).trim();
        if (/^CRS\d+$/i.test(courseStr) || courseStr.length === 24) {
            const key = `course_${courseStr}`;
            if (!(key in cache)) cache[key] = await resolveReference(db, "courses", courseStr, "courseId");
            const course = cache[key];
            if (course) courseName = course.courseName || course.name || null;
        } else {
            courseName = courseStr;
        }
    }
    out.courseName = courseName && courseName !== "" ? courseName : "Not Available";
    out.course = out.courseName;

    // 3. Resolve Batch Name
    let batchName = null;
    if (material.batchName !== undefined && material.batchName !== null && String(material.batchName).trim() !== "" && material.batchName !== "Not Available") {
        batchName = String(material.batchName).trim();
    }
    if (!batchName && material.batchId) {
        const key = `batch_${material.batchId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "batches", material.batchId, "batchId");
        const batch = cache[key];
        if (batch) batchName = batch.batchName || batch.name || null;
    }
    if (!batchName && material.batch) {
        const batchStr = String(material.batch).trim();
        if (/^BAT\d+$/i.test(batchStr) || batchStr.length === 24) {
            const key = `batch_${batchStr}`;
            if (!(key in cache)) cache[key] = await resolveReference(db, "batches", batchStr, "batchId");
            const batch = cache[key];
            if (batch) batchName = batch.batchName || batch.name || null;
        } else {
            batchName = batchStr;
        }
    }
    out.batchName = batchName && batchName !== "" ? batchName : "Not Available";
    out.batch = out.batchName;

    // 4. Other fields
    out.subject = material.subject !== undefined && material.subject !== null && String(material.subject).trim() !== ""
        ? String(material.subject).trim()
        : (out.courseName !== "Not Available" ? out.courseName : "Not Available");

    out.materialType = material.materialType || material.type || "Document";
    out.description = material.description !== undefined && material.description !== null && String(material.description).trim() !== ""
        ? String(material.description).trim()
        : "Not Available";

    out.fileName = material.fileName !== undefined && material.fileName !== null && String(material.fileName).trim() !== ""
        ? String(material.fileName).trim()
        : "Not Available";

    out.fileUrl = material.fileUrl || material.link || "";
    out.uploadDateFormatted = formatDateDDMMYYYY(material.uploadDate || material.createdAt);

    return out;
}

// ─── GET /materials ──────────────────────────────────────────────────────────
export async function getMaterials(req, res) {
    const db = getDB();
    const materials = await db.collection("materials").find({}).sort({ createdAt: -1 }).toArray();
    const cache = {};
    const enriched = [];
    for (const material of materials) enriched.push(await enrichMaterial(db, material, cache));
    res.status(200).json(enriched);
}

// ─── GET /materials/:id ───────────────────────────────────────────────────────
export async function getMaterialById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Material Id" });
    const db = getDB();
    const material = await db.collection("materials").findOne({ _id: new ObjectId(id) });
    if (!material) return res.status(404).json({ success: false, message: "Material Not Found" });
    res.status(200).json(await enrichMaterial(db, material));
}

// ─── POST /materials ──────────────────────────────────────────────────────────
export async function addMaterial(req, res) {
    const db = getDB();

    const body = req.body || {};
    const uploadedFile = req.file || null;

    // ── Safe title extraction & validation ────────────────────────────────────
    const rawTitle = body.title !== undefined ? body.title : (body.materialTitle !== undefined ? body.materialTitle : (body.Title !== undefined ? body.Title : ""));
    const title = typeof rawTitle === "string" ? rawTitle.trim() : String(rawTitle || "").trim();

    if (!title) {
        if (uploadedFile) safeDeleteFile(`/uploads/materials/${uploadedFile.filename}`);
        return res.status(400).json({ success: false, message: "Title is required." });
    }

    // ── Determine uploader identity from auth ──────────────────────────────────
    const requestingUser = req.user;
    const requestingRole = (requestingUser.role || "").toLowerCase();

    let resolvedTeacherId = "";
    let uploadedBy = "";

    if (requestingRole === "teacher") {
        const teacherRef = requestingUser.referenceId || requestingUser.teacherId || "";
        if (teacherRef) {
            const teacher = await resolveReference(db, "teachers", teacherRef, "teacherId");
            if (teacher) {
                resolvedTeacherId = teacher.teacherId || teacherRef;
                uploadedBy = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
            } else {
                resolvedTeacherId = teacherRef;
            }
        }
        if (!uploadedBy) {
            uploadedBy = `${requestingUser.firstName || ""} ${requestingUser.lastName || ""}`.trim()
                || requestingUser.fullName
                || requestingUser.email
                || "Teacher";
        }
    } else if (requestingRole === "admin") {
        const rawTeacher = body.teacherId !== undefined ? body.teacherId : (body.teacher !== undefined ? body.teacher : (body.Teacher !== undefined ? body.Teacher : ""));
        const selectedTeacherId = typeof rawTeacher === "string" ? rawTeacher.trim() : String(rawTeacher || "").trim();

        if (selectedTeacherId) {
            const teacher = await resolveReference(db, "teachers", selectedTeacherId, "teacherId");
            if (teacher) {
                resolvedTeacherId = teacher.teacherId || selectedTeacherId;
                uploadedBy = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
            } else {
                resolvedTeacherId = selectedTeacherId;
                uploadedBy = "Admin";
            }
        } else {
            uploadedBy = "Admin";
        }
    }

    if (!uploadedBy) uploadedBy = "Not Available";

    // ── Resolve course ────────────────────────────────────────────────────────
    const rawCourse = body.courseId !== undefined ? body.courseId : (body.course !== undefined ? body.course : (body.Course !== undefined ? body.Course : ""));
    let resolvedCourseId = typeof rawCourse === "string" ? rawCourse.trim() : String(rawCourse || "").trim();

    const rawCourseName = body.courseName !== undefined ? body.courseName : "";
    let courseName = typeof rawCourseName === "string" ? rawCourseName.trim() : String(rawCourseName || "").trim();

    if (resolvedCourseId) {
        const course = await resolveReference(db, "courses", resolvedCourseId, "courseId");
        if (course) {
            courseName = course.courseName || course.name || courseName;
            resolvedCourseId = course.courseId || course._id.toString();
        }
    }
    if (!courseName && body.course) courseName = String(body.course).trim();
    if (!courseName) courseName = "Not Available";

    // ── Resolve batch ─────────────────────────────────────────────────────────
    const rawBatch = body.batchId !== undefined ? body.batchId : (body.batch !== undefined ? body.batch : (body.Batch !== undefined ? body.Batch : ""));
    let resolvedBatchId = typeof rawBatch === "string" ? rawBatch.trim() : String(rawBatch || "").trim();

    const rawBatchName = body.batchName !== undefined ? body.batchName : "";
    let batchName = typeof rawBatchName === "string" ? rawBatchName.trim() : String(rawBatchName || "").trim();

    if (resolvedBatchId) {
        const batch = await resolveReference(db, "batches", resolvedBatchId, "batchId");
        if (batch) {
            batchName = batch.batchName || batch.name || batchName;
            resolvedBatchId = batch.batchId || batch._id.toString();
        }
    }
    if (!batchName && body.batch) batchName = String(body.batch).trim();
    if (!batchName) batchName = "Not Available";

    // ── File information ──────────────────────────────────────────────────────
    let fileName = "";
    let fileUrl = "";
    let materialType = body.materialType ? String(body.materialType).trim() : "Document";

    if (uploadedFile) {
        fileName = uploadedFile.originalname;
        fileUrl = `/uploads/materials/${uploadedFile.filename}`;
        const ext = path.extname(uploadedFile.originalname).toLowerCase();
        if (!body.materialType || String(body.materialType).trim() === "") {
            materialType = extToType(ext);
        } else {
            materialType = String(body.materialType).trim();
        }
    } else {
        fileName = body.fileName ? String(body.fileName).trim() : "";
        fileUrl = body.fileUrl ? String(body.fileUrl).trim() : "";
    }

    const rawSubject = body.subject !== undefined ? body.subject : (body.Subject !== undefined ? body.Subject : "");
    const subjectInput = typeof rawSubject === "string" ? rawSubject.trim() : String(rawSubject || "").trim();
    const subject = subjectInput || courseName;

    const rawDesc = body.description !== undefined ? body.description : (body.Description !== undefined ? body.Description : "");
    const description = typeof rawDesc === "string" ? rawDesc.trim() : String(rawDesc || "").trim();

    const generatedId = await nextSequentialId(db, "materials", "materialId", "MAT");
    const now = new Date();

    const doc = {
        materialId: generatedId,
        title,
        subject,
        courseId: resolvedCourseId || "",
        courseName,
        batchId: resolvedBatchId || "",
        batchName,
        teacherId: resolvedTeacherId || "",
        uploadedBy,
        materialType,
        fileName,
        fileUrl,
        description,
        uploadDate: body.uploadDate ? new Date(body.uploadDate) : now,
        status: body.status || "Active",
        createdAt: now,
        updatedAt: now
    };

    const result = await db.collection("materials").insertOne(doc);

    emitEvent("material:created", {
        materialId: generatedId,
        title,
        subject,
        courseId: resolvedCourseId || "",
        batchId: resolvedBatchId || "",
        uploadedBy,
    });

    res.status(201).json({
        success: true,
        message: "Material Uploaded Successfully",
        insertedId: result.insertedId,
        materialId: generatedId,
        fileUrl,
    });
}

// ─── GET /materials/:id/download ─────────────────────────────────────────────
export async function downloadMaterial(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Material Id" });

    const db = getDB();
    const material = await db.collection("materials").findOne({ _id: new ObjectId(id) });
    if (!material) return res.status(404).json({ success: false, message: "Material Not Found" });

    const fileUrl = material.fileUrl || "";
    if (!fileUrl || !fileUrl.startsWith("/uploads/materials/")) {
        return res.status(404).json({ success: false, message: "File not available for download. No file was attached to this material." });
    }

    const filename = path.basename(fileUrl);
    // Sanitize filename to prevent path traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ success: false, message: "Invalid file path." });
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: "File not found on server. It may have been deleted or not uploaded properly." });
    }

    // Check file size — reject suspiciously small (corrupt/stub) files
    const stat = fs.statSync(filePath);
    if (stat.size < 100) {
        return res.status(422).json({ success: false, message: "File appears to be corrupt or empty. Please re-upload the material." });
    }

    const originalName = material.fileName || filename;
    const ext = path.extname(filename).toLowerCase();

    const mimeMap = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".zip": "application/zip",
    };
    const mimeType = mimeMap[ext] || "application/octet-stream";

    // Safe filename for Content-Disposition (strip non-ASCII)
    const safeOriginalName = originalName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'");

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${safeOriginalName}"`);
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Length", stat.size);

    const stream = fs.createReadStream(filePath);
    stream.on("error", (streamErr) => {
        console.error("Stream error:", streamErr);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Error streaming file." });
        }
    });
    stream.pipe(res);
}

// ─── DELETE /materials/:id ────────────────────────────────────────────────────
export async function deleteMaterial(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Material Id" });

    const db = getDB();

    const material = await db.collection("materials").findOne({ _id: new ObjectId(id) });
    if (!material) return res.status(404).json({ success: false, message: "Material Not Found" });

    const result = await db.collection("materials").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Material Not Found" });

    if (material.fileUrl && material.fileUrl.startsWith("/uploads/materials/")) {
        safeDeleteFile(material.fileUrl);
    }

    emitEvent("material:deleted", { id });

    res.status(200).json({ success: true, message: "Material Deleted Successfully" });
}
