import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo/logo.jpeg";
import { getCurrentUser } from "../../services/authService";
import { getFileUrl } from "../../services/api";

function Sidebar({ isOpen, toggleSidebar }) {
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
            {/* Mobile Backdrop */}
            <div
                className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
                onClick={toggleSidebar}
            ></div>

            {/* Sidebar Drawer */}
            <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
                {/* Header / Brand */}
                <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-secondary border-opacity-25" style={{ height: "var(--navbar-height)" }}>
                    <Link to="/dashboard" className="d-flex align-items-center gap-3 text-white text-decoration-none">
                        <img
                            src={logo}
                            alt="EduNest Logo"
                            width="38"
                            height="38"
                            className="rounded-3 shadow-sm"
                        />
                        <div>
                            <h5 className="m-0 fw-bold fs-5 text-white" style={{ letterSpacing: "-0.02em" }}>
                                EduNest
                            </h5>
                            <span className="text-secondary small fw-medium" style={{ fontSize: "0.725rem", color: "#94A3B8" }}>
                                Management System
                            </span>
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        className="btn btn-sm text-secondary d-lg-none p-1 border-0"
                        onClick={toggleSidebar}
                        aria-label="Close Sidebar"
                    >
                        <i className="bi bi-x-lg fs-5"></i>
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="px-3 py-4 overflow-y-auto flex-grow-1">
                    <div className="text-uppercase text-secondary px-3 mb-2 fw-semibold" style={{ fontSize: "0.68rem", letterSpacing: "0.08em", color: "#64748B" }}>
                        Main Menu
                    </div>

                    <ul className="nav flex-column gap-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <li className="nav-item" key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => isOpen && toggleSidebar()}
                                        className={`nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-medium transition-all ${
                                            active
                                                ? "bg-primary text-white shadow-sm"
                                                : "text-secondary hover-text-white hover-bg-dark"
                                        }`}
                                        style={{
                                            color: active ? "#FFFFFF" : "#94A3B8",
                                            backgroundColor: active ? "var(--primary)" : "transparent",
                                            fontSize: "0.9rem"
                                        }}
                                    >
                                        <i className={`bi ${item.icon} fs-5 ${active ? "text-white" : "text-secondary"}`}></i>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Sidebar Footer User Info */}
                <div className="p-3 border-top border-secondary border-opacity-25 bg-dark bg-opacity-50">
                    <Link to="/profile" className="d-flex align-items-center gap-3 text-decoration-none text-white">
                        {resolvedPhoto && !imgError ? (
                            <img
                                src={resolvedPhoto}
                                alt={user.fullName || "Administrator"}
                                className="rounded-circle object-fit-cover shadow-sm border border-secondary border-opacity-50"
                                style={{ width: "36px", height: "36px" }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="bg-primary bg-opacity-25 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px" }}>
                                {user.firstName ? user.firstName[0].toUpperCase() : "A"}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <div className="text-white small fw-semibold text-truncate">{user.fullName || "Administrator"}</div>
                            <div className="text-secondary small text-truncate" style={{ fontSize: "0.75rem", color: "#64748B" }}>{user.email || "admin@edunest.com"}</div>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
