import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import { getStudentById } from "../../services/studentService";

function ViewStudent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStudent() {
            setLoading(true);
            try {
                const data = await getStudentById(id);
                setStudent(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadStudent();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <Loader text="Fetching student profile..." />
            </AdminLayout>
        );
    }

    if (!student) {
        return (
            <AdminLayout>
                <div className="alert alert-danger my-4">
                    Student profile record not found.
                </div>
                <Button className="btn btn-secondary" onClick={() => navigate("/students")}>
                    Back to Students
                </Button>
            </AdminLayout>
        );
    }

    const initials = `${student.firstName?.[0] || 'S'}${student.lastName?.[0] || ''}`;

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <PageHeader
                    title="Student Profile"
                    subtitle={`Viewing record for ${student.firstName} ${student.lastName}`}
                />
                <Button className="btn btn-outline-secondary" onClick={() => navigate("/students")}>
                    <i className="bi bi-arrow-left me-1"></i> Back to Directory
                </Button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row g-4 align-items-start">
                        
                        {/* Profile Avatar Column */}
                        <div className="col-12 col-md-4 col-lg-3 text-center border-end border-light">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-1 mb-3 shadow-sm" style={{ width: "120px", height: "120px" }}>
                                {initials}
                            </div>
                            <h5 className="fw-bold text-dark mb-1">
                                {student.firstName} {student.lastName}
                            </h5>
                            <span className="badge bg-light text-secondary font-monospace px-3 py-1.5 border mb-3">
                                {student.studentId || `STU-${student._id?.slice(-6)}`}
                            </span>
                            <div>
                                <span className={`badge ${student.status === "Inactive" ? "badge-soft-danger" : "badge-soft-success"}`}>
                                    <i className={`bi ${student.status === "Inactive" ? "bi-x-circle-fill" : "bi-check-circle-fill"} me-1`}></i>
                                    {student.status || "Active Student"}
                                </span>
                            </div>

                            <div className="d-grid gap-2 mt-4">
                                <Link to={`/students/edit/${student._id}`} className="btn btn-warning">
                                    <i className="bi bi-pencil-square me-1"></i> Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Details Table Column */}
                        <div className="col-12 col-md-8 col-lg-9">
                            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                <i className="bi bi-info-circle-fill text-primary me-2"></i> Personal & Enrollment Information
                            </h6>

                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle mb-0">
                                    <tbody>
                                        <tr>
                                            <th width="30%" className="text-muted fw-semibold">First Name</th>
                                            <td className="fw-semibold text-dark">{student.firstName}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Last Name</th>
                                            <td className="fw-semibold text-dark">{student.lastName}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Gender</th>
                                            <td>{student.gender || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Date Of Birth</th>
                                            <td>{student.dob || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Mobile Number</th>
                                            <td>
                                                <i className="bi bi-telephone text-muted me-1"></i>
                                                {student.mobile || "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Email Address</th>
                                            <td>
                                                <i className="bi bi-envelope text-muted me-1"></i>
                                                {student.email || "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Address</th>
                                            <td>{student.address || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Enrolled Course</th>
                                            <td>
                                                <span className="badge badge-soft-info">
                                                    {student.courseId || student.course || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Assigned Batch</th>
                                            <td>{student.batchId || student.batch || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Joining Date</th>
                                            <td>{student.joiningDate || "—"}</td>
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

export default ViewStudent;