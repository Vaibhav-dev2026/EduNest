import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getCourses, deleteCourse } from "../../services/courseService";

function CourseList() {
    const [search, setSearch] = useState("");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        setLoading(true);
        setError(null);
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (err) {
            console.log(err);
            setError("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this course?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteCourse(id);
                setSuccess("Course deleted successfully.");
                await loadCourses();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete course.");
                setLoading(false);
            }
        }
    }

    const formatCourseFee = (course) => {
        if (course.feeFormatted && course.feeFormatted !== "Not Available") {
            return course.feeFormatted;
        }
        const val = course.fees !== undefined && course.fees !== null && course.fees !== "Not Available"
            ? course.fees
            : (course.courseFee !== undefined && course.courseFee !== null && course.courseFee !== "Not Available"
                ? course.courseFee
                : (course.fee !== undefined && course.fee !== null && course.fee !== "Not Available"
                    ? course.fee
                    : null));

        if (val === null || val === undefined || String(val).trim() === "") {
            return "Not Available";
        }

        const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(num)) {
            return `₹${num.toLocaleString("en-IN")}`;
        }
        return String(val).startsWith("₹") ? val : `₹${val}`;
    };

    const filteredCourses = courses.filter((course) =>
        (course.courseName && course.courseName.toLowerCase().includes(search.toLowerCase())) ||
        (course.courseCode && course.courseCode.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Courses Catalog"
                    subtitle="Manage institute courses, duration and fee structures"
                />

                <Link
                    to="/courses/add"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-journal-plus me-1"></i> Add Course
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by course name or code..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <div>{error}</div>
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-check-circle-fill"></i>
                            <div>{success}</div>
                        </div>
                    )}

                    {loading ? (
                        <Loader text="Loading course catalog..." />
                    ) : filteredCourses.length === 0 ? (
                        <EmptyState
                            title="No Courses Found"
                            message={search ? `No courses matching "${search}"` : "Click 'Add Course' to offer your first course."}
                            icon="bi-journal-code"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Duration</th>
                                    <th>Course Fee</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course, index) => (
                                    <tr key={course._id || index}>
                                        <td className="fw-semibold text-muted">{index + 1}</td>
                                        <td>
                                            <span className="badge bg-light text-dark font-monospace px-2 py-1 border">
                                                {course.courseCode || `CRS-${index + 1}`}
                                            </span>
                                        </td>
                                        <td className="fw-semibold text-dark">
                                            {course.courseName}
                                        </td>
                                        <td>{course.duration || "—"}</td>
                                        <td className="fw-bold text-success">
                                            {formatCourseFee(course)}
                                        </td>
                                        <td>
                                            <span className={`badge ${course.status === "Inactive" ? "badge-soft-danger" : "badge-soft-success"}`}>
                                                {course.status || "Active"}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-inline-flex gap-1">
                                                <Link
                                                    to={`/courses/view/${course._id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View Course"
                                                >
                                                    <i className="bi bi-eye-fill"></i> View
                                                </Link>
                                                <Link
                                                    to={`/courses/edit/${course._id}`}
                                                    className="btn btn-sm btn-outline-warning"
                                                    title="Edit Course"
                                                >
                                                    <i className="bi bi-pencil-square"></i> Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(course._id)}
                                                    title="Delete Course"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default CourseList;