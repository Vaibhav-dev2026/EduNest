import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { isValidObjectId, nextSequentialId } from "../utils/helpers.js";
import { emitEvent } from "../services/socketService.js";

export async function getAttendance(req, res) {
    const db = getDB();
    const records = await db.collection("attendance").find({}).sort({ createdAt: -1 }).toArray();

    const needsMapping = records.some(r => !r.studentName || !r.batchName);
    if (needsMapping) {
        const [students, batches, teachers] = await Promise.all([
            db.collection("students").find({}, { projection: { studentId: 1, firstName: 1, lastName: 1 } }).toArray(),
            db.collection("batches").find({}, { projection: { batchId: 1, batchName: 1, _id: 1 } }).toArray(),
            db.collection("teachers").find({}, { projection: { teacherId: 1, firstName: 1, lastName: 1 } }).toArray()
        ]);

        const studentMap = {};
        students.forEach(s => { if (s.studentId) studentMap[s.studentId] = `${s.firstName || ""} ${s.lastName || ""}`.trim(); });

        const batchMap = {};
        batches.forEach(b => {
            if (b.batchId) batchMap[b.batchId] = b.batchName;
            batchMap[String(b._id)] = b.batchName;
        });

        const teacherMap = {};
        teachers.forEach(t => { if (t.teacherId) teacherMap[t.teacherId] = `${t.firstName || ""} ${t.lastName || ""}`.trim(); });

        records.forEach(r => {
            if (!r.studentName && r.studentId) r.studentName = studentMap[r.studentId] || r.student || r.studentId;
            if (!r.batchName && r.batchId) r.batchName = batchMap[r.batchId] || r.batch || r.batchId;
            if (!r.teacherName && r.teacherId) r.teacherName = teacherMap[r.teacherId] || r.teacherId;
            if (!r.studentName) r.studentName = r.student || "Not Available";
            if (!r.batchName) r.batchName = r.batch || "Not Available";
        });
    }

    res.status(200).json(records);
}

export async function getAttendanceById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Attendance Id" });
    const db = getDB();
    const record = await db.collection("attendance").findOne({ _id: new ObjectId(id) });
    if (!record) return res.status(404).json({ success: false, message: "Record Not Found" });
    res.status(200).json(record);
}

export async function addAttendance(req, res) {
    const db = getDB();
    const record = req.body || {};

    if (!record.studentId || !record.attendanceDate || !record.status) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: studentId, attendanceDate, and status are required."
        });
    }

    // Prevent duplicate attendance for the same student on the same date
    const duplicate = await db.collection("attendance").findOne({
        studentId: record.studentId,
        attendanceDate: record.attendanceDate
    });
    if (duplicate) {
        return res.status(409).json({
            success: false,
            message: `Attendance already marked for student ${record.studentId} on ${record.attendanceDate}. Please edit the existing record instead.`
        });
    }

    const attendanceId = await nextSequentialId(db, "attendance", "attendanceId", "ATT");

    const now = new Date().toISOString();
    const newRecord = {
        attendanceId,
        studentId: record.studentId || "",
        studentName: record.studentName || record.student || "",
        batchId: record.batchId || "",
        batchName: record.batchName || record.batch || "",
        teacherId: record.teacherId || "",
        teacherName: record.teacherName || "",
        attendanceDate: record.attendanceDate,
        status: record.status,
        remarks: record.remarks || "",
        createdAt: now,
        updatedAt: now
    };

    const result = await db.collection("attendance").insertOne(newRecord);

    emitEvent("attendance:created", {
        attendanceId,
        studentId: newRecord.studentId,
        studentName: newRecord.studentName,
        batchId: newRecord.batchId,
        status: newRecord.status,
        attendanceDate: newRecord.attendanceDate,
    });

    res.status(201).json({
        success: true,
        message: "Attendance Marked Successfully",
        attendanceId,
        insertedId: result.insertedId
    });
}

export async function updateAttendance(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Attendance Id" });

    const db = getDB();
    const record = { ...req.body };
    delete record._id;
    delete record.attendanceId; // Never update the unique attendanceId

    // If student/date changed, re-check the duplicate constraint against other records
    if (record.studentId && record.attendanceDate) {
        const duplicate = await db.collection("attendance").findOne({
            _id: { $ne: new ObjectId(id) },
            studentId: record.studentId,
            attendanceDate: record.attendanceDate
        });
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: `Attendance already marked for student ${record.studentId} on ${record.attendanceDate}.`
            });
        }
    }

    record.updatedAt = new Date().toISOString();
    const result = await db.collection("attendance").updateOne({ _id: new ObjectId(id) }, { $set: record });
    if (result.matchedCount === 0) return res.status(404).json({ success: false, message: "Record Not Found" });

    emitEvent("attendance:updated", {
        id,
        studentId: record.studentId,
        attendanceDate: record.attendanceDate,
        status: record.status
    });

    res.status(200).json({ success: true, message: "Attendance Updated Successfully" });
}

export async function deleteAttendance(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Attendance Id" });
    const db = getDB();
    const existing = await db.collection("attendance").findOne({ _id: new ObjectId(id) });
    const result = await db.collection("attendance").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Record Not Found" });

    emitEvent("attendance:deleted", {
        id,
        studentId: existing?.studentId
    });

    res.status(200).json({ success: true, message: "Attendance Record Deleted" });
}
