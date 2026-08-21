import React, { useEffect, useState } from "react";
import logo from "../../assets/logo/logo.jpeg";
import { Link } from "react-router-dom";
import { logout, getCurrentUser } from "../../services/authService";
import { getFileUrl } from "../../services/api";
import { getProfile } from "../../services/profileService";

function Navbar({ toggleSidebar }) {
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

        // Fetch fresh profile on mount to sync any photo/name changes
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
        <header className="navbar navbar-expand bg-white border-bottom border-secondary border-opacity-10 fixed-top px-3 px-lg-4" style={{ height: "70px", zIndex: 1030 }}>
            <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
                
                {/* Left Side: Mobile Toggle & Brand/Breadcrumb */}
                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn btn-light d-lg-none p-2 border-0"
                        onClick={toggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <i className="bi bi-list fs-4 text-dark"></i>
                    </button>

                    <div className="d-flex align-items-center gap-2">
                        <img
                            src={logo}
                            alt="EduNest"
                            width="36"
                            height="36"
                            className="rounded-2 d-lg-none"
                        />
                        <div>
                            <span className="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1 rounded-pill" style={{ fontSize: "0.75rem" }}>
                                <i className="bi bi-shield-check me-1"></i> {capitalize(user.role) || "Admin"} Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Quick Action, Notifications, User */}
                <div className="d-flex align-items-center gap-2 gap-sm-3">
                    
                    {/* Notification Bell */}
                    <button className="btn btn-light rounded-circle position-relative p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                        <i className="bi bi-bell text-secondary fs-5"></i>
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">New alerts</span>
                        </span>
                    </button>

                    {/* Quick Profile Link */}
                    <div className="vr my-2 mx-1 opacity-25"></div>

                    <Link to={profileLink} className="d-flex align-items-center gap-2.5 text-decoration-none text-dark hover-opacity">
                        {resolvedPhoto && !imgError ? (
                            <img
                                src={resolvedPhoto}
                                alt={user.fullName || "User Avatar"}
                                className="rounded-circle object-fit-cover shadow-sm border border-2 border-primary border-opacity-25"
                                style={{ width: "38px", height: "38px" }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "38px", height: "38px", fontSize: "0.9rem", textTransform: 'uppercase' }}>
                                {user.firstName ? user.firstName[0] : (user.role ? user.role[0] : "U")}
                            </div>
                        )}
                        <div className="d-none d-md-block text-start">
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: "0.875rem" }}>{user.fullName || capitalize(user.role) || "User"}</div>
                            <small className="text-muted" style={{ fontSize: "0.725rem" }}>{capitalize(user.role) || "Role"}</small>
                        </div>
                    </Link>

                    <button className="btn btn-outline-danger btn-sm ms-1 ms-sm-2 px-2.5" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        <span className="d-none d-sm-inline ms-1">Logout</span>
                    </button>

                </div>

            </div>
        </header>
    );
}

export default Navbar;