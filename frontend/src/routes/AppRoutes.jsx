import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleRoute from "./RoleRoute";

/* =========================== AUTH =========================== */
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";

/* =========================== ADMIN =========================== */
import Dashboard from "../pages/Dashboard/Dashboard";
import AdminProfile from "../pages/Dashboard/AdminProfile";
import StudentList from "../pages/Students/StudentList";
import AddStudent from "../pages/Students/AddStudent";
import EditStudent from "../pages/Students/EditStudent";
import ViewStudent from "../pages/Students/ViewStudent";
import TeacherList from "../pages/Teachers/TeacherList";
import AddTeacher from "../pages/Teachers/AddTeacher";
import EditTeacher from "../pages/Teachers/EditTeacher";
import ViewTeacher from "../pages/Teachers/ViewTeacher";
import CourseList from "../pages/Courses/CourseList";
import AddCourse from "../pages/Courses/AddCourse";
import EditCourse from "../pages/Courses/EditCourse";
import ViewCourse from "../pages/Courses/ViewCourse";
import BatchList from "../pages/Batches/BatchList";
import AddBatch from "../pages/Batches/AddBatch";
import EditBatch from "../pages/Batches/EditBatch";
import ViewBatch from "../pages/Batches/ViewBatch";
import AttendanceList from "../pages/Attendance/AttendanceList";
import MarkAttendance from "../pages/Attendance/MarkAttendance";
import EditAttendance from "../pages/Attendance/EditAttendance";
import FeeList from "../pages/Fees/FeeList";
import AddFee from "../pages/Fees/AddFee";
import EditFee from "../pages/Fees/EditFee";
import MaterialList from "../pages/StudyMaterials/MaterialList";
import UploadMaterial from "../pages/StudyMaterials/UploadMaterial";
import NoticeList from "../pages/Notices/NoticeList";
import AddNotice from "../pages/Notices/AddNotice";
import EditNotice from "../pages/Notices/EditNotice";

/* =========================== TEACHER =========================== */
import TeacherDashboard from "../pages/TeacherPanel/TeacherDashboard";
import MyStudents from "../pages/TeacherPanel/MyStudents";
import TeacherAttendance from "../pages/TeacherPanel/TeacherAttendance";
import TeacherMaterials from "../pages/TeacherPanel/TeacherMaterials";
import TeacherNotices from "../pages/TeacherPanel/TeacherNotices";
import TeacherProfile from "../pages/TeacherPanel/TeacherProfile";

/* =========================== STUDENT =========================== */
import StudentDashboard from "../pages/StudentPanel/StudentDashboard";
import MyAttendance from "../pages/StudentPanel/MyAttendance";
import MyFees from "../pages/StudentPanel/MyFees";
import StudentMaterials from "../pages/StudentPanel/StudentMaterials";
import StudentNotices from "../pages/StudentPanel/StudentNotices";
import StudentProfile from "../pages/StudentPanel/StudentProfile";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* AUTH ROUTES */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ADMIN ROUTES */}
                <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<AdminProfile />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    <Route path="/my-profile" element={<AdminProfile />} />
                    
                    <Route path="/students" element={<StudentList />} />
                    <Route path="/students/add" element={<AddStudent />} />
                    <Route path="/students/edit/:id" element={<EditStudent />} />
                    <Route path="/students/view/:id" element={<ViewStudent />} />

                    <Route path="/teachers" element={<TeacherList />} />
                    <Route path="/teachers/add" element={<AddTeacher />} />
                    <Route path="/teachers/edit/:id" element={<EditTeacher />} />
                    <Route path="/teachers/view/:id" element={<ViewTeacher />} />

                    <Route path="/courses" element={<CourseList />} />
                    <Route path="/courses/add" element={<AddCourse />} />
                    <Route path="/courses/edit/:id" element={<EditCourse />} />
                    <Route path="/courses/view/:id" element={<ViewCourse />} />

                    <Route path="/batches" element={<BatchList />} />
                    <Route path="/batches/add" element={<AddBatch />} />
                    <Route path="/batches/edit/:id" element={<EditBatch />} />
                    <Route path="/batches/view/:id" element={<ViewBatch />} />

                    <Route path="/attendance" element={<AttendanceList />} />
                    <Route path="/attendance/mark" element={<MarkAttendance />} />
                    <Route path="/attendance/edit/:id" element={<EditAttendance />} />

                    <Route path="/fees" element={<FeeList />} />
                    <Route path="/fees/add" element={<AddFee />} />
                    <Route path="/fees/edit/:id" element={<EditFee />} />

                    <Route path="/materials" element={<MaterialList />} />
                    <Route path="/materials/upload" element={<UploadMaterial />} />

                    <Route path="/notices" element={<NoticeList />} />
                    <Route path="/notices/add" element={<AddNotice />} />
                    <Route path="/notices/edit/:id" element={<EditNotice />} />
                </Route>

                {/* TEACHER ROUTES */}
                <Route path="/teacher" element={<RoleRoute allowedRoles={["teacher"]} />}>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="profile" element={<TeacherProfile />} />
                    <Route path="my-profile" element={<TeacherProfile />} />
                    <Route path="my-students" element={<MyStudents />} />
                    <Route path="attendance" element={<TeacherAttendance />} />
                    <Route path="materials" element={<TeacherMaterials />} />
                    <Route path="notices" element={<TeacherNotices />} />
                </Route>

                {/* STUDENT ROUTES */}
                <Route path="/student" element={<RoleRoute allowedRoles={["student"]} />}>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="my-profile" element={<StudentProfile />} />
                    <Route path="my-attendance" element={<MyAttendance />} />
                    <Route path="my-fees" element={<MyFees />} />
                    <Route path="materials" element={<StudentMaterials />} />
                    <Route path="notices" element={<StudentNotices />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<h2 className="text-center mt-5">404 | Page Not Found</h2>} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;