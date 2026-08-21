import apiRequest from "./api";

export async function getCourses() {

    return await apiRequest(

        "/courses"

    );

}

export async function getCourseById(id) {

    return await apiRequest(

        `/courses/${id}`

    );

}

export async function addCourse(courseData) {

    return await apiRequest(

        "/courses",

        "POST",

        courseData

    );

}

export async function updateCourse(

    id,

    courseData

) {

    return await apiRequest(

        `/courses/${id}`,

        "PUT",

        courseData

    );

}

export async function deleteCourse(id) {

    return await apiRequest(

        `/courses/${id}`,

        "DELETE"

    );

}