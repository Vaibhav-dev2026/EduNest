import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { isValidObjectId, formatDateDDMMYYYY, resolveReference, nextSequentialId } from "../utils/helpers.js";

async function enrichBatch(db, batch, cache = {}) {
    const out = { ...batch };

    // ── Course name ───────────────────────────────────────────────────────────
    let courseName = (out.courseName || out.course || "").trim();
    if ((!courseName || courseName === "Not Available") && out.courseId) {
        const key = `course_${out.courseId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "courses", out.courseId, "courseId");
        const c = cache[key];
        if (c) courseName = c.courseName || c.name;
    }
    out.courseName = courseName && courseName !== "Not Available" ? courseName : "Not Available";
    out.course = out.courseName;

    // ── Teacher name ──────────────────────────────────────────────────────────
    // Strategy: prefer teacherId lookup, then fall back to stored teacher name
    let teacherName = "";
    let teacherId = (out.teacherId || "").trim();

    if (teacherId) {
        // Resolve by teacherId
        const key = `teacher_${teacherId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "teachers", teacherId, "teacherId");
        const t = cache[key];
        if (t) teacherName = `${t.firstName || ""} ${t.lastName || ""}`.trim();
    }

    if (!teacherName) {
        // Fall back: use stored teacher/teacherName field if it's a real name (not sentinel)
        const storedName = (out.teacher || out.teacherName || "").trim();
        if (storedName && storedName !== "Not Available") {
            teacherName = storedName;
        }
    }

    out.teacherName = teacherName || "Not Available";
    out.teacher = out.teacherName;

    out.startDateFormatted = formatDateDDMMYYYY(out.startDate);
    out.endDateFormatted = formatDateDDMMYYYY(out.endDate);

    out.timing = (out.timing || "").trim() || "Not Available";
    out.room = (out.room || "").trim() || "Not Available";
    out.status = (out.status || "").trim() || "Not Available";

    return out;
}

export async function getBatches(req, res) {
    const db = getDB();
    const batches = await db.collection("batches").find({}).toArray();
    const cache = {};
    const enriched = [];
    for (const batch of batches) enriched.push(await enrichBatch(db, batch, cache));
    res.status(200).json(enriched);
}

export async function getBatchById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Batch Id" });
    const db = getDB();
    const batch = await db.collection("batches").findOne({ _id: new ObjectId(id) });
    if (!batch) return res.status(404).json({ success: false, message: "Batch Not Found" });
    res.status(200).json(await enrichBatch(db, batch));
}

/**
 * Resolves teacher info for a batch document before saving.
 * Accepts either:
 *   - batch.teacherId  (e.g. "TCH001") → looks up name
 *   - batch.teacher    (e.g. "Rahul Sharma") → tries to find matching teacherId
 * Always writes both batch.teacherId and batch.teacherName.
 */
async function resolveTeacherForBatch(db, batch) {
    const teacherIdInput = (batch.teacherId || "").trim();
    const teacherNameInput = (batch.teacher || batch.teacherName || "").trim();

    // Case 1: teacherId provided — resolve name from DB
    if (teacherIdInput) {
        const t = await resolveReference(db, "teachers", teacherIdInput, "teacherId");
        if (t) {
            batch.teacherId = t.teacherId || teacherIdInput;
            batch.teacherName = `${t.firstName || ""} ${t.lastName || ""}`.trim();
            batch.teacher = batch.teacherName;
        }
        return;
    }

    // Case 2: teacher name provided — try to find matching teacherId
    if (teacherNameInput && teacherNameInput !== "Not Available") {
        const t = await db.collection("teachers").findOne({
            $or: [
                { teacherId: teacherNameInput },
                { firstName: teacherNameInput.split(" ")[0], lastName: teacherNameInput.split(" ").slice(1).join(" ") || undefined }
            ]
        });
        if (t) {
            batch.teacherId = t.teacherId;
            batch.teacherName = `${t.firstName || ""} ${t.lastName || ""}`.trim();
            batch.teacher = batch.teacherName;
        } else {
            // Store name as-is (no matching teacher record found, but name is valid)
            batch.teacherName = teacherNameInput;
            batch.teacher = teacherNameInput;
        }
        return;
    }

    // Case 3: nothing useful — clear stale sentinel values
    if (!teacherIdInput && !teacherNameInput) {
        batch.teacherName = "";
        batch.teacher = "";
    }
}

export async function addBatch(req, res) {
    const db = getDB();
    const batch = { ...(req.body || {}) };

    if (!batch.batchName || String(batch.batchName).trim() === "") {
        return res.status(400).json({ success: false, message: "Batch Name is required." });
    }

    // ── Resolve teacher: accept teacherId or teacher name ─────────────────────
    await resolveTeacherForBatch(db, batch);

    const generatedId = await nextSequentialId(db, "batches", "batchCode", "BAT");
    batch.batchCode = generatedId;
    batch.batchId = generatedId;
    batch.createdAt = new Date().toISOString();
    batch.updatedAt = new Date().toISOString();

    const result = await db.collection("batches").insertOne(batch);
    res.status(201).json({ success: true, message: "Batch Added Successfully", insertedId: result.insertedId, batchCode: generatedId });
}

export async function updateBatch(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Batch Id" });
    const db = getDB();
    const batch = { ...req.body };
    delete batch._id;
    delete batch.batchCode;
    delete batch.batchId;

    // ── Resolve teacher on update too ─────────────────────────────────────────
    await resolveTeacherForBatch(db, batch);

    batch.updatedAt = new Date().toISOString();

    const result = await db.collection("batches").updateOne({ _id: new ObjectId(id) }, { $set: batch });
    if (result.matchedCount === 0) return res.status(404).json({ success: false, message: "Batch Not Found" });
    res.status(200).json({ success: true, message: "Batch Updated Successfully" });
}

export async function deleteBatch(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Batch Id" });
    const db = getDB();
    const result = await db.collection("batches").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Batch Not Found" });
    res.status(200).json({ success: true, message: "Batch Deleted Successfully" });
}
