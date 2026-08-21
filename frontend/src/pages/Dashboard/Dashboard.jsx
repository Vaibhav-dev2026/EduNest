import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";

import DashboardCards from "../../components/dashboard/DashboardCards";
import Statistics from "../../components/dashboard/Statistics";
import RecentActivities from "../../components/dashboard/RecentActivities";
import Loader from "../../components/common/Loader";

import { getStudents } from "../../services/studentService";
import { getTeachers } from "../../services/teacherService";
import { getCourses } from "../../services/courseService";
import { getBatches } from "../../services/batchService";
import { getFees } from "../../services/feeService";
import { getAttendance } from "../../services/attendanceService";
import { getNotices } from "../../services/noticeService";
import { getMaterials } from "../../services/materialService";

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        students: [],
        teachers: [],
        courses: [],
        batches: [],
        fees: [],
        attendance: [],
        notices: [],
        materials: []
    });

    useEffect(() => {
        fetchDashboardData();

        // 15-second polling for automatic live updates
        const intervalId = setInterval(() => {
            fetchDashboardData(true);
        }, 15000);

        return () => clearInterval(intervalId);
    }, []);

    async function fetchDashboardData(isBackground = false) {
        if (!isBackground) setLoading(true);
        setError(null);
        try {
            const [
                students,
                teachers,
                courses,
                batches,
                fees,
                attendance,
                notices,
                materials
            ] = await Promise.all([
                getStudents().catch(() => []),
                getTeachers().catch(() => []),
                getCourses().catch(() => []),
                getBatches().catch(() => []),
                getFees().catch(() => []),
                getAttendance().catch(() => []),
                getNotices().catch(() => []),
                getMaterials().catch(() => [])
            ]);

            setDashboardData({
                students: students || [],
                teachers: teachers || [],
                courses: courses || [],
                batches: batches || [],
                fees: fees || [],
                attendance: attendance || [],
                notices: notices || [],
                materials: materials || []
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Failed to load dashboard data.");
        } finally {
            if (!isBackground) setLoading(false);
        }
    }

    const {
        students,
        teachers,
        courses,
        batches,
        fees,
        attendance,
        notices,
        materials
    } = dashboardData;

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">
                    Dashboard
                </h2>
                <button
                    className="btn btn-sm btn-outline-primary shadow-sm"
                    onClick={() => fetchDashboardData(false)}
                    title="Refresh Dashboard Data"
                >
                    <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
            </div>

            {loading ? (
                <Loader text="Loading live dashboard statistics..." />
            ) : error ? (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <div>{error}</div>
                </div>
            ) : (
                <>
                    <DashboardCards
                        students={students}
                        teachers={teachers}
                        courses={courses}
                        batches={batches}
                        fees={fees}
                    />

                    <div className="row mt-4">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <Statistics
                                students={students}
                                courses={courses}
                            />
                        </div>

                        <div className="col-lg-6">
                            <RecentActivities
                                students={students}
                                fees={fees}
                                attendance={attendance}
                                materials={materials}
                                notices={notices}
                            />
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}

export default Dashboard;