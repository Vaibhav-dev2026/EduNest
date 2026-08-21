import apiRequest from "./api";

export async function getNotices() {
    return await apiRequest("/notices");
}

export async function getNoticeById(id) {
    return await apiRequest(`/notices/${id}`);
}

export async function addNotice(data) {
    return await apiRequest("/notices", "POST", data);
}

export async function updateNotice(id, data) {
    return await apiRequest(`/notices/${id}`, "PUT", data);
}

export async function deleteNotice(id) {
    return await apiRequest(`/notices/${id}`, "DELETE");
}
