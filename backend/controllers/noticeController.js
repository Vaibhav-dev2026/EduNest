import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { isValidObjectId, formatDateDDMMYYYY, nextSequentialId } from "../utils/helpers.js";
import { createNotification } from "./notificationController.js";

function getNoticeTimestamp(n) {
    if (!n) return 0;
    const rawDate = n.createdAt || n.date || n.publishDate || n.noticeDate || n.updatedAt;
    if (rawDate) {
        const t = new Date(rawDate).getTime();
        if (!isNaN(t) && t > 0) return t;
    }
    if (n._id) {
        try {
            const strId = typeof n._id === "string" ? n._id : n._id.toString();
            if (/^[0-9a-fA-F]{24}$/.test(strId)) {
                const t = parseInt(strId.substring(0, 8), 16) * 1000;
                if (!isNaN(t) && t > 0) return t;
            }
        } catch (e) {}
    }
    return 0;
}

function enrichNotice(n) {
    const out = { ...n };
    const rawDate = out.date || out.createdAt || out.publishDate || out.noticeDate || out.updatedAt;
    out.dateFormatted = formatDateDDMMYYYY(rawDate);
    out.date = out.date || out.createdAt || out.publishDate || out.noticeDate || "";
    out.title = (out.title || "").trim() || "Not Available";
    out.description = out.description !== undefined && out.description !== null ? String(out.description).trim() : "";
    out.postedBy = (out.postedBy || out.createdBy || "").trim() || "Admin";
    out.audience = (out.audience || "").trim() || "All";
    out.priority = (out.priority || "").trim() || "Normal";
    out.status = (out.status || "").trim() || "Active";
    out.timestamp = getNoticeTimestamp(out);
    return out;
}

export async function getNotices(req, res) {
    const db = getDB();
    const notices = await db.collection("notices").find({}).toArray();
    const enriched = notices
        .map(enrichNotice)
        .sort((a, b) => b.timestamp - a.timestamp);
    res.status(200).json(enriched);
}

export async function getNoticeById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Notice Id" });
    const db = getDB();
    const notice = await db.collection("notices").findOne({ _id: new ObjectId(id) });
    if (!notice) return res.status(404).json({ success: false, message: "Notice Not Found" });
    res.status(200).json(enrichNotice(notice));
}

export async function addNotice(req, res) {
    const db = getDB();
    const notice = { ...(req.body || {}) };

    if (!notice.title || String(notice.title).trim() === "") {
        return res.status(400).json({ success: false, message: "Title is required." });
    }

    const generatedId = await nextSequentialId(db, "notices", "noticeId", "NOT");
    notice.noticeId = generatedId;
    const now = new Date().toISOString();
    notice.date = notice.date || notice.publishDate || now;
    notice.publishDate = notice.publishDate || notice.date;
    notice.createdAt = now;
    notice.updatedAt = now;
    notice.status = notice.status || "Active";
    notice.audience = (notice.audience || "").trim() || "All";
    if (!notice.postedBy && notice.createdBy) {
        notice.postedBy = notice.createdBy;
    } else if (!notice.postedBy) {
        notice.postedBy = "Admin";
    }

    const result = await db.collection("notices").insertOne(notice);

    // Notify audience safely in background
    const audienceRole = notice.audience?.toLowerCase().includes("teacher")
        ? "teacher"
        : (notice.audience?.toLowerCase().includes("student") ? "student" : "all");

    createNotification(db, {
        recipientRole: audienceRole,
        title: `Notice: ${notice.title}`,
        message: notice.description ? notice.description.slice(0, 100) : "A new notice has been published.",
        type: "info",
        link: audienceRole === "student" ? "/student/notices" : (audienceRole === "teacher" ? "/teacher/notices" : "/notices"),
        relatedId: generatedId
    }).catch(err => console.error("Notification hook error:", err));

    res.status(201).json({ success: true, message: "Notice Added Successfully", insertedId: result.insertedId, noticeId: generatedId });
}

export async function updateNotice(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Notice Id" });
    const db = getDB();
    const notice = { ...req.body };
    delete notice._id;
    delete notice.noticeId;
    delete notice.timestamp;
    delete notice.dateFormatted;
    notice.updatedAt = new Date().toISOString();

    const result = await db.collection("notices").updateOne({ _id: new ObjectId(id) }, { $set: notice });
    if (result.matchedCount === 0) return res.status(404).json({ success: false, message: "Notice Not Found" });
    res.status(200).json({ success: true, message: "Notice Updated Successfully" });
}

export async function deleteNotice(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Notice Id" });
    const db = getDB();
    const result = await db.collection("notices").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Notice Not Found" });
    res.status(200).json({ success: true, message: "Notice Deleted Successfully" });
}
