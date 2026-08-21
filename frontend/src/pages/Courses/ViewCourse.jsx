import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import { getCourseById } from "../../services/courseService";

function ViewCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCourse() {
            setLoading(true);
            try {
                const data = await getCourseById(id);
                setCourse(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadCourse();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <Loader text="Fetching course details..." />
            </AdminLayout>
        );
    }

    if (!course) {
        return (
            <AdminLayout>
                <div className="alert alert-danger my-4">
                    Course record not found.
                </div>
                <Button className="btn btn-secondary" onClick={() => navigate("/courses")}>
                    Back to Courses
                </Button>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <PageHeader
                    title="Course Details"
                    subtitle={`Viewing course specifications for ${course.courseName}`}
                />
                <Button className="btn btn-outline-secondary" onClick={() => navigate("/courses")}>
                    <i className="bi bi-arrow-left me-1"></i> Back to Catalog
                </Button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row g-4 align-items-start">
                        
                        {/* Course Icon Badge */}
                        <div className="col-12 col-md-4 col-lg-3 text-center border-end border-light">
                            <div className="bg-warning bg-opacity-10 text-warning rounded-4 d-inline-flex align-items-center justify-content-center fw-bold fs-1 mb-3 shadow-sm" style={{ width: "120px", height: "120px" }}>
                                <i className="bi bi-journal-code"></i>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">
                                {course.courseName}
                            </h5>
                            <span className="badge bg-light text-secondary font-monospace px-3 py-1.5 border mb-3">
                                {course.courseCode || `CRS-${course._id?.slice(-6)}`}
                            </span>
                            <div>
                                <span className={`badge ${course.status === "Inactive" ? "badge-soft-danger" : "badge-soft-success"}`}>
                                    <i className={`bi ${course.status === "Inactive" ? "bi-x-circle-fill" : "bi-check-circle-fill"} me-1`}></i>
                                    {course.status || "Active Course"}
                                </span>
                            </div>

                            <div className="d-grid gap-2 mt-4">
                                <Link to={`/courses/edit/${course._id}`} className="btn btn-warning">
                                    <i className="bi bi-pencil-square me-1"></i> Edit Course
                                </Link>
                            </div>
                        </div>

                        {/* Details Table */}
                        <div className="col-12 col-md-8 col-lg-9">
                            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                <i className="bi bi-journal-text text-primary me-2"></i> Course Specifications & Curriculum
                            </h6>

                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle mb-0">
                                    <tbody>
                                        <tr>
                                            <th width="30%" className="text-muted fw-semibold">Course Code</th>
                                            <td className="font-monospace fw-bold">{course.courseCode}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Course Name</th>
                                            <td className="fw-semibold text-dark">{course.courseName}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Category</th>
                                            <td>
                                                <span className="badge badge-soft-info">{course.category || "Development"}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Duration</th>
                                            <td>
                                                <i className="bi bi-clock me-1 text-muted"></i>
                                                {course.duration || "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Total Course Fee</th>
                                            <td className="fw-bold text-success fs-5">
                                                {course.feeFormatted && course.feeFormatted !== "Not Available"
                                                    ? course.feeFormatted
                                                    : (course.fees && course.fees !== "Not Available" && !isNaN(Number(course.fees))
                                                        ? `₹${Number(course.fees).toLocaleString("en-IN")}`
                                                        : "Not Available")}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Lead Instructor / Trainer</th>
                                            <td>{course.trainer || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Max Students per Batch</th>
                                            <td>{course.batchSize ? `${course.batchSize} Students` : "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Description</th>
                                            <td>{course.description || "—"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default ViewCourse;
