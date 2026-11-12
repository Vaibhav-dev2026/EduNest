import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import SearchBox from "../../components/common/SearchBox";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getStudents, deleteStudent } from "../../services/studentService";
import { subscribeToEvents } from "../../services/socketService";

function StudentList() {
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadStudents();

        const unsubscribe = subscribeToEvents([
            "student:created", "student:updated", "student:deleted"
        ], () => {
            loadStudents(true);
        });

        return () => unsubscribe();
    }, []);

    async function loadStudents(silent = false) {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (err) {
            console.log(err);
            if (!silent) setError("Failed to load students list.");
        } finally {
            if (!silent) setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this student record?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteStudent(id);
                setSuccess("Student record deleted successfully.");
                await loadStudents();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete student.");
                setLoading(false);
            }
        }
    }

    const filteredStudents = students.filter(student =>
        (`${student.firstName || ''} ${student.lastName || ''}`)
            .toLowerCase()
            .includes(search.toLowerCase())
        ||
        (student.studentId && student.studentId
            .toLowerCase()
            .includes(search.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Students Directory"
                    subtitle="Manage student admissions, profiles and course enrollments"
                />

                <Link
                    to="/students/add"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-person-plus-fill me-1"></i> Add Student
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by student name or ID..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <div>{error}</div>
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                            <i className="bi bi-check-circle-fill"></i>
                            <div>{success}</div>
                        </div>
                    )}

                    {loading ? (
                        <Loader text="Loading students directory..." />
                    ) : filteredStudents.length === 0 ? (
                        <EmptyState
                            title="No Students Found"
                            message={search ? `No student records matching "${search}"` : "Click 'Add Student' to add the first student."}
                            icon="bi-people"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student ID</th>
                                    <th>Full Name</th>
                                    <th>Course</th>
                                    <th>Batch</th>
                                    <th>Mobile</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr key={student._id || index}>
                                        <td className="fw-semibold text-muted">{index + 1}</td>
                                        <td>
                                            <span className="badge bg-light text-dark font-monospace px-2 py-1 border">
                                                {student.studentId || student._id?.slice(-6) || `STU-${index+1}`}
                                            </span>
                                        </td>
                                        <td className="fw-semibold text-dark">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        <td>{student.courseId || student.course || "—"}</td>
                                        <td>{student.batchId || student.batch || "—"}</td>
                                        <td>{student.mobile || "—"}</td>
                                        <td>
                                            <span className={`badge ${student.status === "Inactive" ? "badge-soft-danger" : "badge-soft-success"}`}>
                                                <i className={`bi ${student.status === "Inactive" ? "bi-x-circle-fill" : "bi-check-circle-fill"} me-1`}></i>
                                                {student.status || "Active"}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-inline-flex gap-1">
                                                <Link
                                                    to={`/students/view/${student._id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View Profile"
                                                >
                                                    <i className="bi bi-eye-fill"></i> View
                                                </Link>
                                                <Link
                                                    to={`/students/edit/${student._id}`}
                                                    className="btn btn-sm btn-outline-warning"
                                                    title="Edit Student"
                                                >
                                                    <i className="bi bi-pencil-square"></i> Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(student._id)}
                                                    title="Delete Student"
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

export default StudentList;