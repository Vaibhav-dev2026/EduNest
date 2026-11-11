import React, { useEffect, useState } from "react";
import logo from "../../assets/logo/logo.jpeg";
import { Link } from "react-router-dom";
import { logout, getCurrentUser } from "../../services/authService";
import { getFileUrl } from "../../services/api";
import { getProfile } from "../../services/profileService";
import { useSidebar } from "../../context/SidebarContext";
import { useNotifications } from "../../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
    const { isCollapsed, toggleCollapse, toggleMobile } = useSidebar();
    const { unreadCount } = useNotifications();
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const [user, setUser] = useState(getCurrentUser() || {});
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        function syncUser() {
            const current = getCurrentUser() || {};
            setUser(current);
            setImgError(false);
        }

        window.addEventListener("edunest_user_updated", syncUser);
        window.addEventListener("storage", syncUser);

        getProfile()
            .then(profile => {
                if (profile) {
                    const current = getCurrentUser() || {};
                    const merged = { ...current, ...profile };
                    sessionStorage.setItem("user", JSON.stringify(merged));
                    localStorage.setItem("user", JSON.stringify(merged));
                    setUser(merged);
                    setImgError(false);
                }
            })
            .catch(() => {});

        return () => {
            window.removeEventListener("edunest_user_updated", syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    const handleLogout = () => {
        logout();
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    const userRole = (user.role || "").toLowerCase();
    const profileLink = userRole === "teacher"
        ? "/teacher/profile"
        : (userRole === "student" ? "/student/profile" : "/profile");

    const photoUrl = user.profilePhoto || user.photo;
    const resolvedPhoto = photoUrl ? getFileUrl(photoUrl) : null;

    return (
        <header
            className="navbar navbar-expand bg-white border-bottom border-secondary border-opacity-10 fixed-top px-3 px-lg-4"
            style={{
                height: "var(--navbar-height)",
                zIndex: 1030,
                left: 0,
                right: 0,
                transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
        >
            <div className="container-fluid p-0 d-flex align-items-center justify-content-between flex-nowrap">

                {/* Left Side: Toggle buttons & Brand */}
                <div className="d-flex align-items-center gap-2 gap-sm-3 flex-shrink-0">
                    {/* Mobile Hamburger Drawer Button */}
                    <button
                        className="btn btn-light d-lg-none p-1.5 p-sm-2 border-0"
                        onClick={toggleMobile}
                        aria-label="Toggle Mobile Sidebar"
                    >
                        <i className="bi bi-list fs-4 text-dark"></i>
                    </button>

                    {/* Desktop Collapsible Toggle Button */}
                    <button
                        className="btn btn-light d-none d-lg-flex align-items-center justify-content-center p-2 rounded-circle border-0 shadow-xs"
                        style={{ width: "36px", height: "36px" }}
                        onClick={toggleCollapse}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <i className={`bi ${isCollapsed ? "bi-layout-sidebar-inset" : "bi-layout-sidebar-inset-reverse"} fs-5 text-secondary`}></i>
                    </button>

                    <div className="d-flex align-items-center gap-2">
                        <img
                            src={logo}
                            alt="EduNest"
                            width="34"
                            height="34"
                            className="rounded-2 d-lg-none shadow-xs"
                        />
                        <div>
                            <span className="badge bg-primary-subtle text-primary fw-semibold px-2 px-sm-2.5 py-1 rounded-pill text-nowrap" style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.775rem)" }}>
                                <i className="bi bi-shield-check me-1"></i> {capitalize(user.role) || "Admin"} Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Notification Bell, Profile, Logout */}
                <div className="d-flex align-items-center gap-2 gap-sm-3 flex-shrink-0 position-relative">

                    {/* Notification Bell with Badge */}
                    <div className="position-relative">
                        <button
                            className={`btn btn-light rounded-circle position-relative p-0 d-flex align-items-center justify-content-center ${isNotifOpen ? "bg-primary-subtle text-primary" : ""}`}
                            style={{ width: "38px", height: "38px" }}
                            onClick={() => setIsNotifOpen(prev => !prev)}
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <i className="bi bi-bell text-secondary fs-5"></i>
                            {unreadCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-xs" style={{ fontSize: "0.65rem", padding: "3px 6px" }}>
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                    <span className="visually-hidden">unread notifications</span>
                                </span>
                            )}
                        </button>

                        {/* Liquid Glass Dropdown Panel */}
                        <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                    </div>

                    {/* Divider */}
                    <div className="vr my-2 mx-0 mx-sm-1 opacity-25 d-none d-sm-block"></div>

                    {/* Quick Profile Link */}
                    <Link to={profileLink} className="d-flex align-items-center gap-2 text-decoration-none text-dark hover-opacity" title="View Profile">
                        {resolvedPhoto && !imgError ? (
                            <img
                                src={resolvedPhoto}
                                alt={user.fullName || "User Avatar"}
                                className="rounded-circle object-fit-cover shadow-sm border border-2 border-primary border-opacity-25"
                                style={{ width: "36px", height: "36px", minWidth: "36px" }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "36px", height: "36px", minWidth: "36px", fontSize: "0.85rem", textTransform: 'uppercase' }}>
                                {user.firstName ? user.firstName[0] : (user.role ? user.role[0] : "U")}
                            </div>
                        )}
                        <div className="d-none d-md-block text-start" style={{ maxWidth: "140px" }}>
                            <div className="fw-bold text-dark text-truncate lh-1" style={{ fontSize: "0.85rem" }}>{user.fullName || capitalize(user.role) || "User"}</div>
                            <small className="text-muted text-truncate d-block" style={{ fontSize: "0.725rem", marginTop: "2px" }}>{capitalize(user.role) || "Role"}</small>
                        </div>
                    </Link>

                    {/* Logout Button */}
                    <button className="btn btn-outline-danger btn-sm px-2 px-sm-2.5 ms-1" onClick={handleLogout} title="Sign Out">
                        <i className="bi bi-box-arrow-right"></i>
                        <span className="d-none d-sm-inline ms-1">Logout</span>
                    </button>

                </div>

            </div>
        </header>
    );
}

export default Navbar;
