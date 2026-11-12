import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ScrollReveal from "../../components/common/ScrollReveal";
import { getCurrentUser } from "../../services/authService";
import { getAttendance } from "../../services/attendanceService";
import { getStudents } from "../../services/studentService";
import { getMaterials } from "../../services/materialService";
import { getNotices } from "../../services/noticeService";
import { getTeachers } from "../../services/teacherService";
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

            // Latest active notice for teachers (sorted newest first)
            const activeNotices = (notices || []).filter(n => {
                if (n.status === "Inactive") return false;
                const audience = (n.audience || "").trim().toLowerCase();
                // Show all except student-only notices
                if (audience === "all students" || audience === "students") return false;
                return true;
            });
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
            <ScrollReveal direction="down" delay={50}>
                <PageHeader title="Teacher Dashboard" subtitle="Overview of your classes and activities" />
            </ScrollReveal>

            {loading ? <Loader text="Loading dashboard..." /> : (
                <div className="row mt-4">

                    {/* Profile Summary Card */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <ScrollReveal direction="up" delay={100} className="h-100">
                            <div className="card shadow-sm border-0 h-100 position-relative glass-card">
                                <div className="card-body text-center p-4">
                                    {resolvedPhoto ? (
                                        <img
                                            src={resolvedPhoto}
                                            alt="Teacher"
                                            className="rounded-circle object-fit-cover shadow-sm mb-3 border border-2 border-primary border-opacity-25"
                                            style={{ width: "68px", height: "68px" }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                                            style={{ width: "68px", height: "68px", fontSize: "26px" }}
                                        >
                                            {user.firstName ? user.firstName[0].toUpperCase() : "T"}
                                        </div>
                                    )}
                                    <h5 className="fw-bold mb-1 text-dark">
                                        {profile ? `${profile.firstName} ${profile.lastName}` : (user.fullName || user.email || "Teacher")}
                                    </h5>
                                    <p className="text-muted small mb-1">{profile?.subject || "Subject N/A"}</p>
                                    <p className="text-muted small mb-2">{user.referenceId || "—"}</p>
                                    <span className={`badge ${profile?.status === "Active" || user.status === "Active" ? "badge-soft-success" : "badge-soft-warning"}`}>
                                        {profile?.status || user.status || "Active"}
                                    </span>
                                </div>
                                <Link to="/teacher/profile" className="stretched-link"></Link>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Total Students */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <ScrollReveal direction="up" delay={150} className="h-100">
                            <div className="card shadow-sm border-0 h-100 text-center p-4 bg-primary-subtle text-primary position-relative glass-card">
                                <div className="stat-icon-wrapper icon-purple mx-auto mb-3">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <h3 className="fw-bold mb-1">{totalStudents}</h3>
                                <p className="small mb-0 text-muted fw-semibold">Total Students</p>
                                <Link to="/teacher/my-students" className="stretched-link"></Link>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Today's Attendance */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <ScrollReveal direction="up" delay={200} className="h-100">
                            <div className="card shadow-sm border-0 h-100 text-center p-4 bg-success-subtle text-success position-relative glass-card">
                                <div className="stat-icon-wrapper icon-green mx-auto mb-3">
                                    <i className="bi bi-calendar-check-fill"></i>
                                </div>
                                <h3 className="fw-bold mb-1">{todayAttendanceCount}</h3>
                                <p className="small mb-0 text-muted fw-semibold">Today's Attendance Marked</p>
                                <Link to="/teacher/attendance" className="stretched-link"></Link>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Latest Notice */}
                    <div className="col-12 col-lg-6 mb-4">
                        <ScrollReveal direction="up" delay={250} className="h-100">
                            <div className="card shadow-sm border-0 h-100 glass-card">
                                <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-3">
                                    <h6 className="fw-bold mb-0 text-dark">
                                        <i className="bi bi-bell-fill text-warning me-2"></i>
                                        Latest Notice
                                    </h6>
                                    <Link to="/teacher/notices" className="btn btn-sm btn-outline-primary">
                                        View All
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    {latestNotice ? (
                                        <div>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <h6 className="fw-bold text-primary mb-0">{latestNotice.title}</h6>
                                                <span className={`badge ${latestNotice.priority === 'High' ? 'badge-soft-danger' : latestNotice.priority === 'Medium' ? 'badge-soft-warning' : 'badge-soft-info'}`}>
                                                    {latestNotice.priority}
                                                </span>
                                            </div>
                                            <p className="text-muted small mb-2">{latestNotice.description}</p>
                                            <small className="text-secondary">
                                                <i className="bi bi-clock me-1"></i>
                                                {latestNotice.dateFormatted || latestNotice.date || "Recently"}
                                            </small>
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">No active notices.</p>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Latest Study Material */}
                    <div className="col-12 col-lg-6 mb-4">
                        <ScrollReveal direction="up" delay={300} className="h-100">
                            <div className="card shadow-sm border-0 h-100 glass-card">
                                <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-3">
                                    <h6 className="fw-bold mb-0 text-dark">
                                        <i className="bi bi-file-earmark-text-fill text-info me-2"></i>
                                        Latest Study Material
                                    </h6>
                                    <Link to="/teacher/materials" className="btn btn-sm btn-outline-primary">
                                        View All
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    {latestMaterial ? (
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">{latestMaterial.title}</h6>
                                            <p className="text-muted small mb-2">{latestMaterial.description || latestMaterial.subject || "No description available"}</p>
                                            <small className="text-secondary">
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {latestMaterial.uploadDate || "Recently uploaded"}
                                            </small>
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">No study materials uploaded yet.</p>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                </div>
            )}
        </TeacherLayout>
    );
}

export default TeacherDashboard;
