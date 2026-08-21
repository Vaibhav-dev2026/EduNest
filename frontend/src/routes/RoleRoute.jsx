import { Navigate, Outlet } from "react-router-dom";
import { getToken, getCurrentUser } from "../services/authService";

function RoleRoute({ allowedRoles }) {
    const token = getToken();
    const user = getCurrentUser();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to their respective dashboard
        if (user.role === "admin") return <Navigate to="/dashboard" replace />;
        if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
        if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default RoleRoute;
