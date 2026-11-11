import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo/logo.jpeg";
import { getCurrentUser } from "../services/authService";
import { getFileUrl } from "../services/api";
import { useSidebar } from "../context/SidebarContext";

function TeacherSidebar() {
    const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();
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
                {/* Header / Brand */}
                <div
                    className="d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25"
                    style={{ height: "var(--navbar-height)", padding: isCollapsed ? "0 10px" : "0 14px", overflow: "hidden" }}
                >
                    <Link to="/teacher/dashboard" className="d-flex align-items-center gap-2 text-white text-decoration-none overflow-hidden" title="EduNest Home">
                        <img
                            src={logo}
                            alt="EduNest Logo"
                            className="rounded-2 shadow-sm flex-shrink-0"
                            style={{ width: isCollapsed ? "34px" : "38px", height: isCollapsed ? "34px" : "38px", objectFit: "cover", transition: "width 0.28s ease, height 0.28s ease" }}
                        />
                        <div className="sidebar-brand-text text-nowrap overflow-hidden">
                            <div className="fw-bold lh-1" style={{ fontSize: "1rem", letterSpacing: "-0.02em" }}>
                                <span style={{ color: "#FFFFFF" }}>Edu</span>
                                <span style={{ color: "#F97316" }}>Nest</span>
                            </div>
                            <div className="sidebar-link-label" style={{ fontSize: "0.68rem", color: "#94A3B8", letterSpacing: "0.03em", marginTop: "2px" }}>
                                Teacher Portal
                            </div>
                        </div>
                    </Link>
                    <button className="btn btn-sm text-secondary d-lg-none p-1 border-0" onClick={closeMobile}>
                        <i className="bi bi-x-lg fs-5"></i>
                    </button>
                </div>

                {/* Nav */}
                <div className="px-2 py-3 overflow-y-auto flex-grow-1">
                    <ul className="nav flex-column gap-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <li className="nav-item" key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={closeMobile}
                                        title={item.label}
                                        className={`nav-link d-flex align-items-center gap-3 rounded-3 fw-medium sidebar-nav-link ${isCollapsed ? "justify-content-center" : ""} ${active ? "active" : ""}`}
                                        style={{ padding: isCollapsed ? "10px 8px" : "9px 14px", color: active ? "#FFFFFF" : "#94A3B8", backgroundColor: active ? "var(--primary)" : "transparent", fontSize: "0.9rem" }}
                                    >
                                        <i className={`bi ${item.icon} fs-5 flex-shrink-0`}></i>
                                        <span className="sidebar-link-label text-nowrap">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Footer */}
                <div className="border-top border-secondary border-opacity-25" style={{ padding: isCollapsed ? "10px 8px" : "10px 14px", background: "rgba(0,0,0,0.3)" }}>
                    <Link to="/teacher/profile" className={`d-flex align-items-center gap-2 text-decoration-none text-white ${isCollapsed ? "justify-content-center" : ""}`} title={user.fullName || "Teacher Profile"} onClick={closeMobile}>
                        {resolvedPhoto && !imgError ? (
                            <img src={resolvedPhoto} alt={user.fullName || "Teacher"} className="rounded-circle object-fit-cover shadow-sm border border-secondary border-opacity-50 flex-shrink-0" style={{ width: "34px", height: "34px", minWidth: "34px" }} onError={() => setImgError(true)} />
                        ) : (
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: "34px", height: "34px", minWidth: "34px", fontSize: "0.85rem" }}>
                                {user.firstName ? user.firstName[0].toUpperCase() : "T"}
                            </div>
                        )}
                        <div className="overflow-hidden sidebar-brand-text">
                            <div className="text-white small fw-semibold text-truncate lh-1">{user.fullName || "Teacher"}</div>
                            <div className="small text-truncate" style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "2px" }}>{user.email}</div>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Desktop Collapse Toggle Button */}
            <button
                className="sidebar-collapse-btn d-none d-lg-flex"
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                <i className={`bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
            </button>
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

