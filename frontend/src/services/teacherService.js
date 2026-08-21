import apiRequest from "./api";

export async function getTeachers() {
    return await apiRequest("/teachers");
}

export async function getTeacherById(id) {
    return await apiRequest(`/teachers/${id}`);
}

// Fetch the profile of the currently logged-in teacher.
// Tries referenceId first, then falls back to email.
export async function getTeacherProfile(referenceId, email) {
    const params = new URLSearchParams();
    if (referenceId) params.append("referenceId", referenceId);
    if (email) params.append("email", email);
    return await apiRequest(`/teachers/profile?${params.toString()}`);
}

export async function addTeacher(teacherData) {
    return await apiRequest("/teachers", "POST", teacherData);
}

export async function updateTeacher(id, teacherData) {
    return await apiRequest(`/teachers/${id}`, "PUT", teacherData);
}

export async function deleteTeacher(id) {
    return await apiRequest(`/teachers/${id}`, "DELETE");
}