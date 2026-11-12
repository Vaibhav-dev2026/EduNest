import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getAttendance, deleteAttendance } from "../../services/attendanceService";
import { subscribeToEvents } from "../../services/socketService";

function AttendanceList() {
    const [search, setSearch] = useState("");
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadAttendance();

        const unsubscribe = subscribeToEvents([
            "attendance:created", "attendance:updated", "attendance:deleted"
        ], () => {
            loadAttendance(true);
        });

        return () => unsubscribe();
    }, []);

    async function loadAttendance(silent = false) {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await getAttendance();
            setAttendance(data);
        } catch (err) {
            console.log(err);
            if (!silent) setError("Failed to load attendance records.");
        } finally {
            if (!silent) setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this attendance record?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteAttendance(id);
                setSuccess("Attendance record deleted successfully.");
                await loadAttendance();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete record.");
                setLoading(false);
            }
        }
    }

    const filteredAttendance = attendance.filter((item) => {
        const studentStr = String(item.studentName || item.student || "");
        const batchStr = String(item.batchName || item.batch || "");
        const idStr = String(item.attendanceId || "");
        const dateStr = String(item.attendanceDate || item.date || "");
        const q = search.toLowerCase();
        return studentStr.toLowerCase().includes(q) ||
               batchStr.toLowerCase().includes(q) ||
               idStr.toLowerCase().includes(q) ||
               dateStr.toLowerCase().includes(q);
    });

    function formatDate(dateStr) {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    }

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Student Attendance"
                    subtitle="Track and mark daily student attendance records"
                />

                <Link
                    to="/attendance/mark"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-calendar-check me-1"></i> Mark Attendance
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by student or batch..."
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
                        <Loader text="Loading attendance registers..." />
                    ) : filteredAttendance.length === 0 ? (
                        <EmptyState
                            title="No Attendance Records"
                            message={search ? `No records matching "${search}"` : "Click 'Mark Attendance' to take today's roll call."}
                            icon="bi-calendar2-check"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Att. ID</th>
                                    <th>Student</th>
                                    <th>Batch</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendance.map((item, index) => (
                                    <tr key={item._id || index}>
                                        <td className="fw-semibold text-muted">{index + 1}</td>
                                        <td>
                                            <small className="badge badge-soft-secondary fw-medium">
                                                {item.attendanceId || "—"}
                                            </small>
                                        </td>
                                        <td className="fw-semibold text-dark">
                                            {item.studentName || item.student || "—"}
                                        </td>
                                        <td>
                                            <span className="badge badge-soft-info">
                                                {item.batchName || item.batch || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-muted fw-medium">
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {formatDate(item.attendanceDate || item.date)}
                                            </small>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    item.status === "Present"
                                                        ? "badge-soft-success"
                                                        : item.status === "Absent"
                                                        ? "badge-soft-danger"
                                                        : "badge-soft-warning"
                                                }`}
                                            >
                                                <i className={`bi ${item.status === "Present" ? "bi-check-lg" : item.status === "Absent" ? "bi-x-lg" : "bi-clock-history"} me-1`}></i>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-muted">{item.remarks || "—"}</small>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-inline-flex gap-1">
                                                <Link
                                                    to={`/attendance/edit/${item._id}`}
                                                    className="btn btn-sm btn-outline-warning"
                                                    title="Edit Attendance"
                                                >
                                                    <i className="bi bi-pencil-square"></i> Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(item._id)}
                                                    title="Delete Record"
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

export default AttendanceList;