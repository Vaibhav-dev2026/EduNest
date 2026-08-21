import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getCurrentUser } from "../../services/authService";
import { getAttendance } from "../../services/attendanceService";
import { getFees } from "../../services/feeService";
import { getMaterials } from "../../services/materialService";
import { getNotices } from "../../services/noticeService";
import { getStudents } from "../../services/studentService";
import { getFileUrl } from "../../services/api";

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

            // Latest active notice (sorted newest first)
            const activeNotices = (noticesData || []).filter(n => n.status !== 'Inactive');
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

        // Refresh data when user returns to the dashboard tab/window
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

    const { profile } = dashboardData;
    const photoUrl = profile?.profilePhoto || profile?.photo || user.profilePhoto || user.photo;
    const resolvedPhoto = photoUrl ? getFileUrl(photoUrl) : null;

    return (
        <StudentLayout>
            <PageHeader title="Student Dashboard" subtitle="Overview of your academic progress" />
            
            {loading ? <Loader text="Loading dashboard..." /> : (
                <div className="row mt-4">
                    {/* Profile Summary */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <div className="card shadow-sm border-0 h-100 position-relative">
                            <div className="card-body text-center p-4">
                                {resolvedPhoto ? (
                                    <img
                                        src={resolvedPhoto}
                                        alt="Student"
                                        className="rounded-circle object-fit-cover shadow-sm mb-3 border border-2 border-primary border-opacity-25"
                                        style={{ width: "64px", height: "64px" }}
                                    />
                                ) : (
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "64px", height: "64px", fontSize: "24px"}}>
                                        {user.firstName ? user.firstName[0].toUpperCase() : "S"}
                                    </div>
                                )}
                                <h5 className="fw-bold mb-1 text-capitalize">{dashboardData.profile ? `${dashboardData.profile.firstName} ${dashboardData.profile.lastName}` : fullName}</h5>
                                <p className="text-muted small mb-2">
                                    {dashboardData.profile?.courseName || dashboardData.profile?.course || "Course N/A"} | {dashboardData.profile?.batchName || dashboardData.profile?.batch || "Batch N/A"}
                                </p>
                                <span className={`badge ${dashboardData.profile?.status === 'Active' || user.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                                    {dashboardData.profile?.status || user.status || "Active"}
                                </span>
                            </div>
                            <Link to="/student/profile" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <div className="card shadow-sm border-0 h-100 text-center p-4 bg-primary-subtle text-primary position-relative">
                            <i className="bi bi-calendar-check-fill fs-1 mb-2"></i>
                            <h3 className="fw-bold mb-1">{dashboardData.attendancePct}%</h3>
                            <p className="small mb-0">Attendance</p>
                            <Link to="/student/my-attendance" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Pending Fees */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <div className="card shadow-sm border-0 h-100 text-center p-4 bg-danger-subtle text-danger position-relative">
                            <i className="bi bi-currency-rupee fs-1 mb-2"></i>
                            <h3 className="fw-bold mb-1">₹{dashboardData.dueFees}</h3>
                            <p className="small mb-0">Pending Dues</p>
                            <Link to="/student/my-fees" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Latest Notice */}
                    <div className="col-12 col-md-6 mb-4">
                        <div className="card shadow-sm border-0 h-100 p-4 position-relative hover-shadow">
                            <h6 className="text-muted small fw-bold text-uppercase mb-3">
                                <i className="bi bi-megaphone me-2"></i>Latest Notice
                            </h6>
                            {dashboardData.latestNotice ? (
                                <div>
                                    <h5 className="fw-bold text-primary mb-1 text-truncate">{dashboardData.latestNotice.title}</h5>
                                    <p className="small text-muted mb-2">{dashboardData.latestNotice.dateFormatted || dashboardData.latestNotice.date || "Recent"}</p>
                                    <p className="mb-0 text-truncate">{dashboardData.latestNotice.description}</p>
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No notices available.</p>
                            )}
                            <Link to="/student/notices" className="stretched-link"></Link>
                        </div>
                    </div>

                    {/* Latest Study Material */}
                    <div className="col-12 col-md-6 mb-4">
                        <div className="card shadow-sm border-0 h-100 p-4 position-relative hover-shadow">
                            <h6 className="text-muted small fw-bold text-uppercase mb-3">
                                <i className="bi bi-file-earmark-text me-2"></i>Latest Material
                            </h6>
                            {dashboardData.latestMaterial ? (
                                <div>
                                    <h5 className="fw-bold text-warning mb-1 text-truncate">{dashboardData.latestMaterial.title}</h5>
                                    <p className="small text-muted mb-2">{dashboardData.latestMaterial.subject} • {dashboardData.latestMaterial.uploadDateFormatted || dashboardData.latestMaterial.uploadDate || "Recent"}</p>
                                    <p className="mb-0 text-truncate">{dashboardData.latestMaterial.description}</p>
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No materials available.</p>
                            )}
                            <Link to="/student/materials" className="stretched-link"></Link>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}

export default StudentDashboard;
