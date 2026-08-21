import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getTeachers, deleteTeacher } from "../../services/teacherService";

function TeacherList() {
    const [search, setSearch] = useState("");
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadTeachers();
    }, []);

    async function loadTeachers() {
        setLoading(true);
        setError(null);
        try {
            const data = await getTeachers();
            setTeachers(data);
        } catch (err) {
            console.log(err);
            setError("Failed to load teachers list.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this teacher?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteTeacher(id);
                setSuccess("Teacher deleted successfully.");
                await loadTeachers();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete teacher.");
                setLoading(false);
            }
        }
    }

    const filteredTeachers = teachers.filter((teacher) => {
        const fullName = teacher.fullName || teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
        return (fullName && fullName.toLowerCase().includes(search.toLowerCase())) ||
               (teacher.teacherId && teacher.teacherId.toLowerCase().includes(search.toLowerCase()));
    });

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Faculty & Teachers"
                    subtitle="Manage institute instructors, qualifications and assignments"
                />

                <Link
                    to="/teachers/add"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-person-plus-fill me-1"></i> Add Teacher
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by teacher name or ID..."
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
                        <Loader text="Loading faculty members..." />
                    ) : filteredTeachers.length === 0 ? (
                        <EmptyState
                            title="No Teachers Found"
                            message={search ? `No faculty records matching "${search}"` : "Click 'Add Teacher' to add the first instructor."}
                            icon="bi-person-badge"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Teacher ID</th>
                                    <th>Full Name</th>
                                    <th>Specialization</th>
                                    <th>Experience</th>
                                    <th>Contact</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers.map((teacher, index) => (
                                    <tr key={teacher._id || index}>
                                        <td className="fw-semibold text-muted">{index + 1}</td>
                                        <td>
                                            <span className="badge bg-light text-dark font-monospace px-2 py-1 border">
                                                {teacher.teacherId || `TCH-${index + 1}`}
                                            </span>
                                        </td>
                                        <td className="fw-semibold text-dark">
                                            {teacher.fullName || teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'N/A'}
                                        </td>
                                        <td>
                                            <span className="badge badge-soft-info">
                                                {teacher.specialization || teacher.subject || "General"}
                                            </span>
                                        </td>
                                        <td>{teacher.experience ? `${teacher.experience} Years` : "—"}</td>
                                        <td>{teacher.mobile || "—"}</td>
                                        <td className="text-end">
                                            <div className="d-inline-flex gap-1">
                                                <Link
                                                    to={`/teachers/view/${teacher._id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View Profile"
                                                >
                                                    <i className="bi bi-eye-fill"></i> View
                                                </Link>
                                                <Link
                                                    to={`/teachers/edit/${teacher._id}`}
                                                    className="btn btn-sm btn-outline-warning"
                                                    title="Edit Teacher"
                                                >
                                                    <i className="bi bi-pencil-square"></i> Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(teacher._id)}
                                                    title="Delete Teacher"
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

export default TeacherList;