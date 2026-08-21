import apiRequest from "./api";

export async function getAttendance() {
    return await apiRequest("/attendance");
}

export async function getAttendanceById(id) {
    return await apiRequest(`/attendance/${id}`);
}

export async function addAttendance(data) {
    return await apiRequest("/attendance", "POST", data);
}

export async function updateAttendance(id, data) {
    return await apiRequest(`/attendance/${id}`, "PUT", data);
}

export async function deleteAttendance(id) {
    return await apiRequest(`/attendance/${id}`, "DELETE");
}
