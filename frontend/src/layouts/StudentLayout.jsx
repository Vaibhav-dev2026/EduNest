import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo/logo.jpeg";
import { getCurrentUser } from "../services/authService";
import { getFileUrl } from "../services/api";

function StudentSidebar({ isOpen, toggleSidebar }) {
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
        { path: "/student/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
        { path: "/student/profile", label: "My Profile", icon: "bi-person-fill" },
        { path: "/student/my-attendance", label: "My Attendance", icon: "bi-calendar-check-fill" },
        { path: "/student/my-fees", label: "My Fees", icon: "bi-currency-rupee" },
        { path: "/student/materials", label: "Study Materials", icon: "bi-file-earmark-text-fill" },
        { path: "/student/notices", label: "Notices", icon: "bi-bell-fill" },
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    const photoUrl = user.profilePhoto || user.photo;
    const resolvedPhoto = photoUrl ? getFileUrl(photoUrl) : null;

    return (
        <>
            <div className={`sidebar-backdrop ${isOpen ? "show" : ""}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
                <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-secondary border-opacity-25">
                    <Link to="/student/dashboard" className="d-flex align-items-center gap-3 text-white text-decoration-none">
                        <img src={logo} alt="EduNest" width="40" height="40" className="rounded-3 shadow-sm" />
                        <div>
                            <h5 className="m-0 fw-bold fs-5 text-white">EduNest</h5>
                            <span className="text-secondary small fw-medium">Student Portal</span>
                        </div>
                    </Link>
                    <button className="btn btn-sm text-secondary d-lg-none p-1" onClick={toggleSidebar}>
                        <i className="bi bi-x-lg fs-5"></i>
                    </button>
                </div>
                <div className="px-3 py-4 overflow-y-auto flex-grow-1">
                    <ul className="nav flex-column gap-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <li className="nav-item" key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => isOpen && toggleSidebar()}
                                        className={`nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-medium ${active ? "bg-primary text-white" : "text-secondary hover-text-white hover-bg-dark"}`}
                                    >
                                        <i className={`bi ${item.icon} fs-5 ${active ? "text-white" : "text-secondary"}`}></i>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="p-3 border-top border-secondary border-opacity-25 bg-dark bg-opacity-50">
                    <Link to="/student/profile" className="d-flex align-items-center gap-3 text-decoration-none text-white">
                        {resolvedPhoto && !imgError ? (
                            <img
                                src={resolvedPhoto}
                                alt={user.fullName || "Student"}
                                className="rounded-circle object-fit-cover shadow-sm border border-secondary border-opacity-50"
                                style={{ width: "36px", height: "36px" }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px" }}>
                                {user.firstName ? user.firstName[0].toUpperCase() : "S"}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <div className="text-white small fw-semibold text-truncate">{user.fullName || "Student"}</div>
                            <div className="text-secondary small text-truncate" style={{ fontSize: "0.75rem", color: "#64748B" }}>{user.email}</div>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    );
}

function StudentLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="d-flex flex-column vh-100 bg-light">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="d-flex flex-grow-1 overflow-hidden">
                <StudentSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} />
                <main className="flex-grow-1 p-3 p-lg-4 overflow-y-auto" style={{ marginTop: "70px" }}>
                    <div className="container-fluid p-0 max-w-1200 mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default StudentLayout;
