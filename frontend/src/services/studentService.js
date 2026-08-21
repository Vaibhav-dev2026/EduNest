import apiRequest from "./api";

export async function getStudents() {

    return await apiRequest("/students");

}

export async function getStudentById(id) {

    return await apiRequest(`/students/${id}`);

}

// Fetch the profile of the currently logged-in student.
// Tries referenceId/studentId first, then falls back to email.
export async function getStudentProfile(referenceId, email) {
    const params = new URLSearchParams();
    if (referenceId) params.append("referenceId", referenceId);
    if (email) params.append("email", email);
    return await apiRequest(`/students/profile?${params.toString()}`);
}

export async function addStudent(studentData) {

    return await apiRequest(

        "/students",

        "POST",

        studentData

    );

}

export async function updateStudent(id, studentData) {

    return await apiRequest(

        `/students/${id}`,

        "PUT",

        studentData

    );

}

export async function deleteStudent(id) {

    return await apiRequest(

        `/students/${id}`,

        "DELETE"

    );

}