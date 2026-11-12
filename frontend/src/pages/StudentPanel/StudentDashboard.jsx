import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ScrollReveal from "../../components/common/ScrollReveal";
import { getCurrentUser } from "../../services/authService";
import { getAttendance } from "../../services/attendanceService";
import { getFees } from "../../services/feeService";
import { getMaterials } from "../../services/materialService";
import { getNotices } from "../../services/noticeService";
import { getStudents } from "../../services/studentService";
import { getFileUrl } from "../../services/api";
import { subscribeToEvents } from "../../services/socketService";

function StudentDashboard() {
    const user = getCurrentUser() || {};
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        attendancePct: 0,
        dueFees: 0,
        latestNotice: null,
        latestMaterial: null,
        profile: null
    });

    const loadDashboardData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [attendanceData, feesData, materialsData, noticesData, studentsData] = await Promise.all([
                getAttendance().catch(() => []),
                getFees().catch(() => []),
                getMaterials().catch(() => []),
                getNotices().catch(() => []),
                getStudents().catch(() => [])
            ]);

            const studentRef = user.referenceId || "";
            const userEmail = (user.email || "").toLowerCase();

            // Attendance calculation for current student
            const myAttendance = (attendanceData || []).filter(r => 
                (studentRef && r.studentId === studentRef) ||
                (fullName && r.studentName && r.studentName.toLowerCase() === fullName.toLowerCase()) ||
                (fullName && r.student && r.student.toLowerCase() === fullName.toLowerCase())
            );
            const totalClasses = myAttendance.length;
            const present = myAttendance.filter(r => r.status === "Present").length;
            const attendancePct = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

            // Fees calculation for current student
            const myFees = (feesData || []).filter(r => 
                (studentRef && r.studentId === studentRef) ||
                (fullName && r.studentName && r.studentName.toLowerCase() === fullName.toLowerCase()) ||
                (fullName && r.student && r.student.toLowerCase() === fullName.toLowerCase())
            );
            const dueFees = myFees.reduce((sum, f) => sum + Math.max(0, Number(f.dueFee) || 0), 0);

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

            // Latest active material (sorted newest first)
            const activeMaterials = (materialsData || []).filter(m => m.status !== 'Inactive');
            const sortedMaterials = [...activeMaterials].sort((a, b) => getTimestamp(b, "uploadDate") - getTimestamp(a, "uploadDate"));
            const latestMaterial = sortedMaterials.length > 0 ? sortedMaterials[0] : null;

            // Latest active notice for students (sorted newest first)
            const activeNotices = (noticesData || []).filter(n => {
                if (n.status === 'Inactive') return false;
                const audience = (n.audience || "").trim().toLowerCase();
                // Hide teacher-only notices
                if (audience === "all teachers" || audience === "teachers") return false;
                return true;
            });
            const sortedNotices = [...activeNotices].sort((a, b) => (b.timestamp || getTimestamp(b, "date")) - (a.timestamp || getTimestamp(a, "date")));
            const latestNotice = sortedNotices.length > 0 ? sortedNotices[0] : null;

            // Profile
            const profile = (studentsData || []).find(s => 
                (studentRef && s.studentId === studentRef) || 
                (userEmail && s.email && s.email.toLowerCase() === userEmail) ||
                (fullName && s.firstName && s.lastName && `${s.firstName} ${s.lastName}`.trim().toLowerCase() === fullName.toLowerCase())
            );

            setDashboardData({
                attendancePct,
                dueFees,
                latestNotice,
                latestMaterial,
                profile
            });
        } catch (error) {
            console.error("Dashboard data load error:", error);
        } finally {
            setLoading(false);
        }
    }, [user.referenceId, user.email, fullName]);

    useEffect(() => {
        loadDashboardData();

        // Real-time synchronization
        const unsubscribe = subscribeToEvents([
            "attendance:created", "attendance:updated", "attendance:deleted",
            "fees:created", "fees:updated", "fees:deleted",
            "notice:created", "notice:updated", "notice:deleted",
            "material:created", "material:deleted",
            "student:updated", "profile:updated"
        ], () => {
            loadDashboardData();
        });

        // Refresh data when user returns to the dashboard tab/window
        const handleRefresh = () => {
            if (document.visibilityState === "visible") {
                loadDashboardData();
            }
        };

        window.addEventListener("focus", handleRefresh);
        document.addEventListener("visibilitychange", handleRefresh);

        return () => {
            unsubscribe();
            window.removeEventListener("focus", handleRefresh);
            document.removeEventListener("visibilitychange", handleRefresh);
        };
    }, [loadDashboardData]);

    const { profile } = dashboardData;
    const photoUrl = profile?.profilePhoto || profile?.photo || user.profilePhoto || user.photo;
    const resolvedPhoto = photoUrl ? getFileUrl(photoUrl) : null;

    return (
        <StudentLayout>
            <ScrollReveal direction="down" delay={50}>
                <PageHeader title="Student Dashboard" subtitle="Overview of your academic progress" />
            </ScrollReveal>
            
            {loading ? <Loader text="Loading dashboard..." /> : (
                <div className="row mt-4">
                    {/* Profile Summary */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <ScrollReveal direction="up" delay={100} className="h-100">
                            <div className="card shadow-sm border-0 h-100 position-relative glass-card">
                                <div className="card-body text-center p-4">
                                    {resolvedPhoto ? (
                                        <img
                                            src={resolvedPhoto}
                                            alt="Student"
                                            className="rounded-circle object-fit-cover shadow-sm mb-3 border border-2 border-primary border-opacity-25"
                                            style={{ width: "68px", height: "68px" }}
                                        />
                                    ) : (
                                        <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{width: "68px", height: "68px", fontSize: "26px"}}>
                                            {user.firstName ? user.firstName[0].toUpperCase() : "S"}
                                        </div>
                                    )}
                                    <h5 className="fw-bold mb-1 text-capitalize text-dark">{dashboardData.profile ? `${dashboardData.profile.firstName} ${dashboardData.profile.lastName}` : fullName}</h5>
                                    <p className="text-muted small mb-2">
                                        {dashboardData.profile?.courseName || dashboardData.profile?.course || "Course N/A"} | {dashboardData.profile?.batchName || dashboardData.profile?.batch || "Batch N/A"}
                                    </p>
                                    <span className={`badge ${dashboardData.profile?.status === 'Active' || user.status === 'Active' ? 'badge-soft-success' : 'badge-soft-warning'}`}>
                                        {dashboardData.profile?.status || user.status || "Active"}
                                    </span>
                                </div>
                                <Link to="/student/profile" className="stretched-link"></Link>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Attendance Stat */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <ScrollReveal direction="up" delay={150} className="h-100">
                            <div className="card shadow-sm border-0 h-100 text-center p-4 bg-success-subtle text-success position-relative glass-card">
                                <div className="stat-icon-wrapper icon-green mx-auto mb-3">
                                    <i className="bi bi-calendar-check-fill"></i>
                                </div>
                                <h3 className="fw-bold mb-1">{dashboardData.attendancePct}%</h3>
                                <p className="small mb-0 text-muted fw-semibold">Overall Attendance</p>
                                <Link to="/student/my-attendance" className="stretched-link"></Link>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Fees Stat */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <ScrollReveal direction="up" delay={200} className="h-100">
                            <div className="card shadow-sm border-0 h-100 text-center p-4 bg-warning-subtle text-warning position-relative glass-card">
                                <div className="stat-icon-wrapper icon-amber mx-auto mb-3">
                                    <i className="bi bi-currency-rupee"></i>
                                </div>
                                <h3 className="fw-bold mb-1">₹{Number(dashboardData.dueFees).toLocaleString('en-IN')}</h3>
                                <p className="small mb-0 text-muted fw-semibold">Pending Fees Due</p>
                                <Link to="/student/my-fees" className="stretched-link"></Link>
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
                                    <Link to="/student/notices" className="btn btn-sm btn-outline-primary">
                                        View All
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    {dashboardData.latestNotice ? (
                                        <div>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <h6 className="fw-bold text-primary mb-0">{dashboardData.latestNotice.title}</h6>
                                                <span className={`badge ${dashboardData.latestNotice.priority === 'High' ? 'badge-soft-danger' : dashboardData.latestNotice.priority === 'Medium' ? 'badge-soft-warning' : 'badge-soft-info'}`}>
                                                    {dashboardData.latestNotice.priority}
                                                </span>
                                            </div>
                                            <p className="text-muted small mb-2">{dashboardData.latestNotice.description}</p>
                                            <small className="text-secondary">
                                                <i className="bi bi-clock me-1"></i>
                                                {dashboardData.latestNotice.dateFormatted || dashboardData.latestNotice.date || "Recently"}
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
                                    <Link to="/student/materials" className="btn btn-sm btn-outline-primary">
                                        View All
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    {dashboardData.latestMaterial ? (
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">{dashboardData.latestMaterial.title}</h6>
                                            <p className="text-muted small mb-2">{dashboardData.latestMaterial.description || dashboardData.latestMaterial.subject || "No description available"}</p>
                                            <small className="text-secondary">
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {dashboardData.latestMaterial.uploadDate || "Recently uploaded"}
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
        </StudentLayout>
    );
}

export default StudentDashboard;
