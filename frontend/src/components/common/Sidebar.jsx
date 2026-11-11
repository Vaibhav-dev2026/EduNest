import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo/logo.jpeg";
import { getCurrentUser } from "../../services/authService";
import { getFileUrl } from "../../services/api";
import { useSidebar } from "../../context/SidebarContext";

function Sidebar() {
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
            if (e.key === "Escape" && isMobileOpen) {
                closeMobile();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobileOpen, closeMobile]);

    const menuItems = [
        { path: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
        { path: "/profile", label: "My Profile", icon: "bi-person-badge-fill" },
        { path: "/students", label: "Students", icon: "bi-people-fill" },
        { path: "/teachers", label: "Teachers", icon: "bi-mortarboard-fill" },
        { path: "/courses", label: "Courses", icon: "bi-book-fill" },
        { path: "/batches", label: "Batches", icon: "bi-collection-fill" },
        { path: "/attendance", label: "Attendance", icon: "bi-calendar-check-fill" },
        { path: "/fees", label: "Fees Collection", icon: "bi-currency-rupee" },
        { path: "/materials", label: "Study Materials", icon: "bi-file-earmark-text-fill" },
        { path: "/notices", label: "Notice Board", icon: "bi-bell-fill" },
    ];

    const isActive = (path) => {
        if (path === "/dashboard") return location.pathname === "/dashboard";
        return location.pathname.startsWith(path);
    };

    const photoUrl = user.profilePhoto || user.photo;
    const resolvedPhoto = photoUrl ? getFileUrl(photoUrl) : null;

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            <div
                className={`sidebar-backdrop ${isMobileOpen ? "show" : ""}`}
                onClick={closeMobile}
                aria-hidden="true"
            ></div>

            {/* Sidebar Drawer / Mini Rail */}
            <aside
                className={`sidebar-container ${isMobileOpen ? "open" : ""} ${isCollapsed ? "sidebar--collapsed" : ""}`}
                aria-label="Admin Navigation"
            >
                {/* Header / Brand */}
                <div
                    className="d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25"
                    style={{ height: "var(--navbar-height)", padding: isCollapsed ? "0 10px" : "0 14px", overflow: "hidden" }}
                >
                    <Link
                        to="/dashboard"
                        className="d-flex align-items-center gap-2 text-white text-decoration-none overflow-hidden"
                        title="EduNest Home"
                    >
                        {/* Logo Icon — always visible */}
                        <img
                            src={logo}
                            alt="EduNest Logo"
                            className="rounded-2 shadow-sm flex-shrink-0 sidebar-logo-img"
                            style={{
                                width: isCollapsed ? "34px" : "38px",
                                height: isCollapsed ? "34px" : "38px",
                                objectFit: "cover",
                                transition: "width 0.28s ease, height 0.28s ease"
                            }}
                        />
                        {/* Brand text — hidden when collapsed */}
                        <div className="sidebar-brand-text text-nowrap overflow-hidden">
                            <div className="fw-bold lh-1" style={{ fontSize: "1rem", letterSpacing: "-0.02em" }}>
                                <span style={{ color: "#FFFFFF" }}>Edu</span>
                                <span style={{ color: "#F97316" }}>Nest</span>
                            </div>
                            <div className="sidebar-link-label" style={{ fontSize: "0.68rem", color: "#94A3B8", letterSpacing: "0.03em", marginTop: "2px" }}>
                                Management System
                            </div>
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        className="btn btn-sm text-secondary d-lg-none p-1 border-0"
                        onClick={closeMobile}
                        aria-label="Close Sidebar"
                    >
                        <i className="bi bi-x-lg fs-5"></i>
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="px-2 py-3 overflow-y-auto flex-grow-1">
                    {!isCollapsed && (
                        <div className="text-uppercase px-3 mb-2 fw-semibold sidebar-brand-text" style={{ fontSize: "0.68rem", letterSpacing: "0.08em", color: "#64748B" }}>
                            Main Menu
                        </div>
                    )}

                    <ul className="nav flex-column gap-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <li className="nav-item" key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={closeMobile}
                                        title={item.label}
                                        className={`nav-link d-flex align-items-center gap-3 rounded-3 fw-medium sidebar-nav-link ${
                                            isCollapsed ? "justify-content-center" : ""
                                        } ${active ? "active" : ""}`}
                                        style={{
                                            padding: isCollapsed ? "10px 8px" : "9px 14px",
                                            color: active ? "#FFFFFF" : "#94A3B8",
                                            backgroundColor: active ? "var(--primary)" : "transparent",
                                            fontSize: "0.9rem",
                                            position: "relative"
                                        }}
                                    >
                                        <i className={`bi ${item.icon} fs-5 flex-shrink-0 ${active ? "text-white" : ""}`}></i>
                                        <span className="sidebar-link-label text-nowrap">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Sidebar Footer User Info */}
                <div className="border-top border-secondary border-opacity-25" style={{ padding: isCollapsed ? "10px 8px" : "10px 14px", background: "rgba(0,0,0,0.3)" }}>
                    <Link
                        to="/profile"
                        className={`d-flex align-items-center gap-2 text-decoration-none text-white ${isCollapsed ? "justify-content-center" : ""}`}
                        title={user.fullName || "Admin Profile"}
                        onClick={closeMobile}
                    >
                        {resolvedPhoto && !imgError ? (
                            <img
                                src={resolvedPhoto}
                                alt={user.fullName || "Administrator"}
                                className="rounded-circle object-fit-cover shadow-sm border border-secondary border-opacity-50 flex-shrink-0"
                                style={{ width: "34px", height: "34px", minWidth: "34px" }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="bg-primary bg-opacity-25 text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: "34px", height: "34px", minWidth: "34px", fontSize: "0.85rem" }}>
                                {user.firstName ? user.firstName[0].toUpperCase() : "A"}
                            </div>
                        )}
                        <div className="overflow-hidden sidebar-brand-text">
                            <div className="text-white small fw-semibold text-truncate lh-1">{user.fullName || "Administrator"}</div>
                            <div className="small text-truncate" style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "2px" }}>{user.email || "admin@edunest.com"}</div>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* ============================================================
                Desktop Collapse Toggle — floating chevron button on sidebar edge
                Visible only on lg+ screens. Positioned via CSS.
            ============================================================ */}
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

export default Sidebar;
