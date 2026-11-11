import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { isValidObjectId, nextSequentialId } from "../utils/helpers.js";

/**
 * Creates a persistent notification for a specific recipient or role
 */
export async function createNotification(db, {
    recipientId = null,
    recipientRole = null, // "admin", "teacher", "student", or "all"
    title,
    message,
    type = "info", // "info", "success", "warning", "danger"
    link = "",
    relatedId = null,
}) {
    if (!title || !message) return null;

    try {
        const notificationId = await nextSequentialId(db, "notifications", "notificationId", "NOTIF");
        const doc = {
            notificationId,
            recipientId: recipientId ? String(recipientId) : null,
            recipientRole: recipientRole || "all",
            title: String(title).trim(),
            message: String(message).trim(),
            type,
            link: link || "",
            relatedId: relatedId ? String(relatedId) : null,
            read: false,
            readAt: null,
            createdAt: new Date().toISOString(),
        };

        const result = await db.collection("notifications").insertOne(doc);
        return { ...doc, _id: result.insertedId };
    } catch (err) {
        console.error("Failed to create notification:", err);
        return null;
    }
}

/**
 * GET /notifications
 * Retrieves notifications for the currently authenticated user
 */
export async function getNotifications(req, res) {
    const db = getDB();
    const user = req.user || {};
    const userId = user._id ? String(user._id) : (user.id ? String(user.id) : null);
    const userRefId = user.referenceId ? String(user.referenceId) : null;
    const role = (user.role || "").toLowerCase();

    // Match conditions: directed specifically to user ID, referenceId, role, or "all"
    const orConditions = [{ recipientRole: "all" }];
    if (role) {
        orConditions.push({ recipientRole: role });
    }
    if (userId) {
        orConditions.push({ recipientId: userId });
    }
    if (userRefId) {
        orConditions.push({ recipientId: userRefId });
    }

    const notifications = await db.collection("notifications")
        .find({ $or: orConditions })
        .sort({ createdAt: -1, _id: -1 })
        .limit(30)
        .toArray();

    const unreadCount = notifications.filter(n => !n.read).length;

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications,
    });
}

/**
 * PATCH /notifications/:id/read
 * Marks a single notification as read
 */
export async function markAsRead(req, res) {
    const { id } = req.params;
    const db = getDB();

    const query = isValidObjectId(id)
        ? { _id: new ObjectId(id) }
        : { notificationId: id };

    const result = await db.collection("notifications").updateOne(
        query,
        { $set: { read: true, readAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Marked as read" });
}

/**
 * PATCH /notifications/read-all
 * Marks all notifications for current user/role as read
 */
export async function markAllAsRead(req, res) {
    const db = getDB();
    const user = req.user || {};
    const userId = user._id ? String(user._id) : (user.id ? String(user.id) : null);
    const userRefId = user.referenceId ? String(user.referenceId) : null;
    const role = (user.role || "").toLowerCase();

    const orConditions = [{ recipientRole: "all" }];
    if (role) orConditions.push({ recipientRole: role });
    if (userId) orConditions.push({ recipientId: userId });
    if (userRefId) orConditions.push({ recipientId: userRefId });

    await db.collection("notifications").updateMany(
        { $or: orConditions, read: false },
        { $set: { read: true, readAt: new Date().toISOString() } }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
}
