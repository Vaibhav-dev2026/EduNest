import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import { getTeacherById } from "../../services/teacherService";

function ViewTeacher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTeacher() {
            setLoading(true);
            try {
                const data = await getTeacherById(id);
                setTeacher(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadTeacher();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <Loader text="Fetching teacher profile..." />
            </AdminLayout>
        );
    }

    if (!teacher) {
        return (
            <AdminLayout>
                <div className="alert alert-danger my-4">
                    Teacher profile record not found.
                </div>
                <Button className="btn btn-secondary" onClick={() => navigate("/teachers")}>
                    Back to Teachers
                </Button>
            </AdminLayout>
        );
    }

    const name = (teacher.firstName && teacher.lastName && teacher.firstName !== "Not Available")
        ? `${teacher.firstName} ${teacher.lastName}`.trim()
        : (teacher.fullName || teacher.name || teacher.firstName || "Teacher");
    const initials = (name && name !== "Teacher" ? name.split(" ").map(n => n[0]).slice(0, 2).join("") : "T").toUpperCase();

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <PageHeader
                    title="Faculty Profile"
                    subtitle={`Viewing record for ${name}`}
                />
                <Button className="btn btn-outline-secondary" onClick={() => navigate("/teachers")}>
                    <i className="bi bi-arrow-left me-1"></i> Back to Directory
                </Button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row g-4 align-items-start">
                        
                        {/* Avatar Column */}
                        <div className="col-12 col-md-4 col-lg-3 text-center border-end border-light">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-1 mb-3 shadow-sm" style={{ width: "120px", height: "120px" }}>
                                {initials}
                            </div>
                            <h5 className="fw-bold text-dark mb-1">
                                {name}
                            </h5>
                            <span className="badge bg-light text-secondary font-monospace px-3 py-1.5 border mb-3">
                                {teacher.teacherId || `TCH-${teacher._id?.slice(-6)}`}
                            </span>
                            <div>
                                <span className={`badge ${teacher.status === "Inactive" ? "badge-soft-danger" : "badge-soft-success"}`}>
                                    <i className={`bi ${teacher.status === "Inactive" ? "bi-x-circle-fill" : "bi-check-circle-fill"} me-1`}></i>
                                    {teacher.status || "Active Faculty"}
                                </span>
                            </div>

                            <div className="d-grid gap-2 mt-4">
                                <Link to={`/teachers/edit/${teacher._id}`} className="btn btn-warning">
                                    <i className="bi bi-pencil-square me-1"></i> Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="col-12 col-md-8 col-lg-9">
                            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                <i className="bi bi-person-badge-fill text-primary me-2"></i> Professional & Qualification Details
                            </h6>

                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle mb-0">
                                    <tbody>
                                        <tr>
                                            <th width="30%" className="text-muted fw-semibold">Full Name</th>
                                            <td className="fw-semibold text-dark">{name}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Specialization</th>
                                            <td>
                                                <span className="badge badge-soft-info">
                                                    {teacher.specialization || teacher.subject || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Qualification</th>
                                            <td>{teacher.qualification || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Experience</th>
                                            <td>{teacher.experience ? `${teacher.experience} Years` : "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Mobile Number</th>
                                            <td>
                                                <i className="bi bi-telephone text-muted me-1"></i>
                                                {teacher.mobile || "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Email Address</th>
                                            <td>
                                                <i className="bi bi-envelope text-muted me-1"></i>
                                                {teacher.email || "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Joining Date</th>
                                            <td>{teacher.joiningDate || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Salary Amount</th>
                                            <td className="fw-bold text-success">
                                                ₹{teacher.salary || 0}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Address</th>
                                            <td>{teacher.address || "—"}</td>
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

export default ViewTeacher;
