import apiRequest from "./api";

/**
 * Fetch all notifications for the authenticated user
 */
export async function getNotifications() {
    return await apiRequest("/notifications");
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(id) {
    return await apiRequest(`/notifications/${id}/read`, "PATCH");
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllAsRead() {
    return await apiRequest("/notifications/read-all", "PATCH");
}
