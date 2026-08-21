import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getCurrentUser } from "../../services/authService";
import { getTeachers } from "../../services/teacherService";
import { getStudents } from "../../services/studentService";
import { getAttendance } from "../../services/attendanceService";
import { getNotices } from "../../services/noticeService";
import { getMaterials } from "../../services/materialService";
import { getFileUrl } from "../../services/api";

function TeacherDashboard() {
    const user = getCurrentUser() || {};

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        profile: null,
        totalStudents: 0,
        todayAttendanceCount: 0,
        latestNotice: null,
        latestMaterial: null,
    });

    const loadDashboardData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [teachers, students, attendance, notices, materials] = await Promise.all([
                getTeachers().catch(() => []),
                getStudents().catch(() => []),
                getAttendance().catch(() => []),
                getNotices().catch(() => []),
                getMaterials().catch(() => []),
            ]);

            // Teacher profile
            const profile = (teachers || []).find(t =>
                (user.referenceId && t.teacherId === user.referenceId) ||
                (user.email && t.email?.toLowerCase() === user.email.toLowerCase())
            );

            // Today's attendance
            const today = new Date().toISOString().split("T")[0];
            const todayRecords = (attendance || []).filter(r => {
                if (!r.attendanceDate) return false;
                return String(r.attendanceDate).split("T")[0] === today;
            });

            // Helper to extract timestamp for accurate chronological sorting
            const getTimestamp = (item, dateField) => {
                if (!item) return 0;
                const d = item[dateField] || item.createdAt || item.updatedAt || item.date || item.uploadDate;
                if (d) {
                    const time = new Date(d).getTime();
                    if (!isNaN(time) && time > 0) return time;
                }
                if (item._id && typeof item._id === "string" && /^[0-9a-fA-F]{24}$/.test(item._id)) {
                    const time = parseInt(item._id.substring(0, 8), 16) * 1000;
                    if (!isNaN(time) && time > 0) return time;
                }
                return 0;
            };

            // Latest active notice (sorted newest first)
            const activeNotices = (notices || []).filter(n => n.status !== "Inactive");
            const sortedNotices = [...activeNotices].sort((a, b) => (b.timestamp || getTimestamp(b, "date")) - (a.timestamp || getTimestamp(a, "date")));
            const latestNotice = sortedNotices.length > 0 ? sortedNotices[0] : null;

            // Latest active material (sorted newest first)
            const activeMaterials = (materials || []).filter(m => m.status !== "Inactive");
            const sortedMaterials = [...activeMaterials].sort((a, b) => getTimestamp(b, "uploadDate") - getTimestamp(a, "uploadDate"));
            const latestMaterial = sortedMaterials.length > 0 ? sortedMaterials[0] : null;

            setDashboardData({
                profile,
                totalStudents: (students || []).length,
                todayAttendanceCount: todayRecords.length,
                latestNotice,
                latestMaterial,
            });
        } catch (err) {
            console.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
        }
    }, [user.referenceId, user.email]);

    useEffect(() => {
        loadDashboardData();

        // Refresh data when user returns to dashboard tab/window
        const handleRefresh = () => {
            if (document.visibilityState === "visible") {
                loadDashboardData();
            }
        };

        window.addEventListener("focus", handleRefresh);
        document.addEventListener("visibilitychange", handleRefresh);

        return () => {
            window.removeEventListener("focus", handleRefresh);
            document.removeEventListener("visibilitychange", handleRefresh);
        };
    }, [loadDashboardData]);

    const { profile, totalStudents, todayAttendanceCount, latestNotice, latestMaterial } = dashboardData;
    const photoUrl = profile?.profilePhoto || profile?.photo || user.profilePhoto || user.photo;
    const resolvedPhoto = photoUrl ? getFileUrl(photoUrl) : null;

    return (
        <TeacherLayout>
            <PageHeader title="Teacher Dashboard" subtitle="Overview of your classes and activities" />

            {loading ? <Loader text="Loading dashboard..." /> : (
                <div className="row mt-4">

                    {/* Profile Summary Card */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <div className="card shadow-sm border-0 h-100 position-relative">
                            <div className="card-body text-center p-4">
                                {resolvedPhoto ? (
                                    <img
                                        src={resolvedPhoto}
                                        alt="Teacher"
                                        className="rounded-circle object-fit-cover shadow-sm mb-3 border border-2 border-primary border-opacity-25"
                                        style={{ width: "64px", height: "64px" }}
                                    />
                                ) : (
                                    <div
                                        className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: "64px", height: "64px", fontSize: "24px" }}
                                    >
                                        {user.firstName ? user.firstName[0].toUpperCase() : "T"}
                                    </div>
                                )}
                                <h5 className="fw-bold mb-1">
                                    {profile ? `${profile.firstName} ${profile.lastName}` : (user.fullName || user.email || "Teacher")}
                                </h5>
                                <p className="text-muted small mb-1">{profile?.subject || "Subject N/A"}</p>
                                <p className="text-muted small mb-2">{user.referenceId || "—"}</p>
                                <span className={`badge ${profile?.status === "Active" || user.status === "Active" ? "bg-success" : "bg-warning"}`}>
                                    {profile?.status || user.status || "Active"}
                                </span>
                            </div>
                            <Link to="/teacher/profile" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Total Students */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <div className="card shadow-sm border-0 h-100 text-center p-4 bg-primary-subtle text-primary position-relative">
                            <i className="bi bi-people-fill fs-1 mb-2"></i>
                            <h3 className="fw-bold mb-1">{totalStudents}</h3>
                            <p className="small mb-0">Total Students</p>
                            <Link to="/teacher/my-students" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Today's Attendance */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <div className="card shadow-sm border-0 h-100 text-center p-4 bg-success-subtle text-success position-relative">
                            <i className="bi bi-calendar-check-fill fs-1 mb-2"></i>
                            <h3 className="fw-bold mb-1">{todayAttendanceCount}</h3>
                            <p className="small mb-0">Attendance Marked Today</p>
                            <Link to="/teacher/attendance" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Latest Notice */}
                    <div className="col-12 col-md-6 mb-4">
                        <div className="card shadow-sm border-0 h-100 p-4 position-relative">
                            <h6 className="text-muted small fw-bold text-uppercase mb-3">
                                <i className="bi bi-megaphone me-2"></i>Latest Notice
                            </h6>
                            {latestNotice ? (
                                <div>
                                    <h5 className="fw-bold text-primary mb-1 text-truncate">{latestNotice.title}</h5>
                                    <p className="small text-muted mb-1">{latestNotice.dateFormatted || latestNotice.date || "Recent"}</p>
                                    <p className="mb-0 text-truncate">{latestNotice.description}</p>
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No notices available.</p>
                            )}
                            <Link to="/teacher/notices" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Latest Study Material */}
                    <div className="col-12 col-md-6 mb-4">
                        <div className="card shadow-sm border-0 h-100 p-4 position-relative">
                            <h6 className="text-muted small fw-bold text-uppercase mb-3">
                                <i className="bi bi-file-earmark-text me-2"></i>Latest Material
                            </h6>
                            {latestMaterial ? (
                                <div>
                                    <h5 className="fw-bold text-warning mb-1 text-truncate">{latestMaterial.title}</h5>
                                    <p className="small text-muted mb-1">
                                        {latestMaterial.subject} &bull; {latestMaterial.uploadDateFormatted || latestMaterial.uploadDate || "Recent"}
                                    </p>
                                    <p className="mb-0 text-truncate">{latestMaterial.description}</p>
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No materials available.</p>
                            )}
                            <Link to="/teacher/materials" className="stretched-link"></Link>
                        </div>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}

export default TeacherDashboard;
