import React, { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getCurrentUser } from "../../services/authService";
import { getAttendance } from "../../services/attendanceService";
import { subscribeToEvents } from "../../services/socketService";

function MyAttendance() {
    const user = getCurrentUser() || {};
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAttendance = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAttendance();
            // Filter attendance for the logged in student (by name, studentName or studentId)
            const myRecords = data.filter(record => {
                const byId = record.studentId === user.referenceId;
                const byName = record.studentName && record.studentName.toLowerCase() === fullName.toLowerCase();
                const byStudent = record.student && record.student.toLowerCase() === fullName.toLowerCase();
                return byId || byName || byStudent;
            });
            setAttendance(myRecords);
        } catch (err) {
            setError("Failed to load attendance data.");
        } finally {
            setLoading(false);
        }
    }, [user.referenceId, fullName]);

    useEffect(() => {
        loadAttendance();

        const unsubscribe = subscribeToEvents([
            "attendance:created", "attendance:updated", "attendance:deleted"
        ], () => {
            loadAttendance();
        });

        return () => unsubscribe();
    }, [loadAttendance]);

    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(r => r.status === "Present").length;
    const absentClasses = attendance.filter(r => r.status === "Absent").length;
    const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    return (
        <StudentLayout>
            <PageHeader title="My Attendance" subtitle="View your attendance records" />
            
            {loading && <Loader text="Loading attendance..." />}
            {error && <div className="alert alert-danger mt-4">{error}</div>}
            
            {!loading && !error && (
                <>
                    <div className="row mt-4">
                        <div className="col-md-3 mb-3">
                            <div className="card shadow-sm border-0 text-center p-3 bg-primary-subtle text-primary">
                                <h3 className="fw-bold mb-1">{totalClasses}</h3>
                                <small>Total Classes</small>
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <div className="card shadow-sm border-0 text-center p-3 bg-success-subtle text-success">
                                <h3 className="fw-bold mb-1">{presentClasses}</h3>
                                <small>Present</small>
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <div className="card shadow-sm border-0 text-center p-3 bg-danger-subtle text-danger">
                                <h3 className="fw-bold mb-1">{absentClasses}</h3>
                                <small>Absent</small>
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <div className="card shadow-sm border-0 text-center p-3 bg-info-subtle text-info">
                                <h3 className="fw-bold mb-1">{percentage}%</h3>
                                <small>Attendance</small>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 mt-2">
                        <div className="card-body p-4">
                            {attendance.length === 0 ? (
                                <EmptyState title="No Attendance Records" icon="bi-calendar-x" />
                            ) : (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Batch</th>
                                            <th>Status</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance.map((record, idx) => (
                                            <tr key={record._id || idx}>
                                                <td>{record.attendanceDate}</td>
                                                <td>{record.batchName || record.batch || "—"}</td>
                                                <td>
                                                    <span className={`badge ${record.status === 'Present' ? 'bg-success' : record.status === 'Absent' ? 'bg-danger' : 'bg-warning'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td>{record.remarks || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </div>
                    </div>
                </>
            )}
        </StudentLayout>
    );
}

export default MyAttendance;
