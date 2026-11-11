import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo/logo.jpeg";
import { getCurrentUser } from "../services/authService";
import { getFileUrl } from "../services/api";
import { useSidebar } from "../context/SidebarContext";

function TeacherSidebar() {
    const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
    const location = useLocation();
    const [user, setUser] = useState(getCurrentUser() || {});
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        function syncUser() {
            setUser(getCurrentUser() || {});
            setImgError(false);
        }
        window.addEventListener("edunest_user_updated", syncUser);
        window.addEventListener("storage", syncUser);
        return () => {
            window.removeEventListener("edunest_user_updated", syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    // Close mobile drawer on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isMobileOpen) closeMobile();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobileOpen, closeMobile]);

    const menuItems = [
        { path: "/teacher/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
        { path: "/teacher/profile", label: "My Profile", icon: "bi-person-fill" },
        { path: "/teacher/my-students", label: "My Students", icon: "bi-people-fill" },
        { path: "/teacher/attendance", label: "Attendance", icon: "bi-calendar-check-fill" },
        { path: "/teacher/materials", label: "Study Materials", icon: "bi-file-earmark-text-fill" },
        { path: "/teacher/notices", label: "Notices", icon: "bi-bell-fill" },
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    const photoUrl = user.profilePhoto || user.photo;
    const resolvedPhoto = photoUrl ? getFileUrl(photoUrl) : null;

    return (
        <>
            <div className={`sidebar-backdrop ${isMobileOpen ? "show" : ""}`} onClick={closeMobile} aria-hidden="true"></div>
            <aside className={`sidebar-container ${isMobileOpen ? "open" : ""} ${isCollapsed ? "sidebar--collapsed" : ""}`}>
                <div className="d-flex align-items-center justify-content-between px-3 border-bottom border-secondary border-opacity-25" style={{ height: "var(--navbar-height)", overflow: "hidden" }}>
                    <Link to="/teacher/dashboard" className="d-flex align-items-center gap-2.5 text-white text-decoration-none" title="EduNest Home">
                        <img src={logo} alt="EduNest" width="36" height="36" className="rounded-3 shadow-sm flex-shrink-0" />
                        {!isCollapsed && (
                            <div className="text-nowrap sidebar-brand-text animate-fade-in">
                                <h5 className="m-0 fw-bold fs-5 text-white">EduNest</h5>
                                <span className="text-secondary small fw-medium" style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Teacher Portal</span>
                            </div>
                        )}
                    </Link>
                    <button className="btn btn-sm text-secondary d-lg-none p-1 border-0" onClick={closeMobile}>
                        <i className="bi bi-x-lg fs-5"></i>
                    </button>
                </div>
                <div className="px-2 py-3 overflow-y-auto flex-grow-1">
                    <ul className="nav flex-column gap-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <li className="nav-item" key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={closeMobile}
                                        title={isCollapsed ? item.label : ""}
                                        className={`nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-medium ${isCollapsed ? "justify-content-center px-2" : ""} ${active ? "bg-primary text-white shadow-sm" : "text-secondary hover-text-white hover-bg-dark"}`}
                                        style={{
                                            color: active ? "#FFFFFF" : "#94A3B8",
                                            backgroundColor: active ? "var(--primary)" : "transparent",
                                            fontSize: "0.9rem"
                                        }}
                                    >
                                        <i className={`bi ${item.icon} fs-5 flex-shrink-0 ${active ? "text-white" : "text-secondary"}`}></i>
                                        {!isCollapsed && <span className="text-nowrap sidebar-link-label">{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="p-2.5 border-top border-secondary border-opacity-25 bg-dark bg-opacity-50">
                    <Link to="/teacher/profile" className={`d-flex align-items-center gap-2.5 text-decoration-none text-white ${isCollapsed ? "justify-content-center" : ""}`} title={isCollapsed ? (user.fullName || "Teacher Profile") : ""}>
                        {resolvedPhoto && !imgError ? (
                            <img
                                src={resolvedPhoto}
                                alt={user.fullName || "Teacher"}
                                className="rounded-circle object-fit-cover shadow-sm border border-secondary border-opacity-50 flex-shrink-0"
                                style={{ width: "34px", height: "34px" }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: "34px", height: "34px" }}>
                                {user.firstName ? user.firstName[0].toUpperCase() : "T"}
                            </div>
                        )}
                        {!isCollapsed && (
                            <div className="overflow-hidden text-nowrap sidebar-user-info">
                                <div className="text-white small fw-semibold text-truncate">{user.fullName || "Teacher"}</div>
                                <div className="text-secondary small text-truncate" style={{ fontSize: "0.72rem", color: "#64748B" }}>{user.email}</div>
                            </div>
                        )}
                    </Link>
                </div>
            </aside>
        </>
    );
}

function TeacherLayout({ children }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={`admin-layout-wrapper ${isCollapsed ? "layout--collapsed" : ""}`}>
            <Navbar />
            <TeacherSidebar />
            <main className="main-content">
                <div className="main-content-inner animate-fade-in">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}

export default TeacherLayout;
