import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

function NotificationDropdown({ isOpen, onClose }) {
    const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refresh } = useNotifications();
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="notification-dropdown-panel shadow-xl glass-card animate-fade-in"
            style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "clamp(300px, 90vw, 380px)",
                maxHeight: "480px",
                borderRadius: "var(--radius-lg)",
                zIndex: 1060,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between px-3 py-2.5 border-bottom border-secondary border-opacity-10 bg-white bg-opacity-70">
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-bell-fill text-primary fs-5"></i>
                    <h6 className="m-0 fw-bold text-dark fs-6">Notifications</h6>
                    {unreadCount > 0 && (
                        <span className="badge bg-primary rounded-pill small px-2 py-0.5" style={{ fontSize: "0.7rem" }}>
                            {unreadCount} new
                        </span>
                    )}
                </div>
                <div className="d-flex align-items-center gap-1">
                    <button
                        className="btn btn-sm text-secondary p-1 border-0 hover-opacity"
                        onClick={refresh}
                        title="Refresh"
                    >
                        <i className="bi bi-arrow-clockwise fs-6"></i>
                    </button>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-sm btn-link text-primary text-decoration-none p-1 small fw-semibold"
                            style={{ fontSize: "0.75rem" }}
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notification List Body */}
            <div className="overflow-y-auto flex-grow-1 p-2" style={{ maxHeight: "360px" }}>
                {loading && notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted small">
                        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                        <div>Checking for updates...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-4 text-danger small px-3">
                        <i className="bi bi-exclamation-triangle fs-4 d-block mb-1"></i>
                        {error}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted small px-3">
                        <div className="stat-icon-wrapper icon-purple mx-auto mb-2" style={{ width: "42px", height: "42px" }}>
                            <i className="bi bi-bell-slash"></i>
                        </div>
                        <div className="fw-semibold text-dark">No Notifications</div>
                        <p className="mb-0 text-secondary" style={{ fontSize: "0.78rem" }}>You are completely caught up!</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-1">
                        {notifications.map((n) => {
                            const isUnread = !n.read;
                            const ContentWrapper = n.link ? Link : "div";
                            const linkProps = n.link
                                ? { to: n.link, onClick: () => { markAsRead(n._id || n.notificationId); onClose(); } }
                                : {};

                            return (
                                <ContentWrapper
                                    key={n._id || n.notificationId}
                                    {...linkProps}
                                    className={`p-2.5 rounded-3 text-decoration-none transition-all d-flex align-items-start gap-2.5 ${
                                        isUnread ? "bg-primary-subtle text-dark border-start border-3 border-primary" : "text-secondary hover-bg-light"
                                    }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        if (isUnread) markAsRead(n._id || n.notificationId);
                                    }}
                                >
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5 ${
                                            n.type === "success"
                                                ? "bg-success text-white"
                                                : n.type === "danger"
                                                ? "bg-danger text-white"
                                                : "bg-primary text-white"
                                        }`}
                                        style={{ width: "28px", height: "28px", fontSize: "0.75rem" }}
                                    >
                                        <i className={`bi ${n.type === "success" ? "bi-check-lg" : n.type === "danger" ? "bi-exclamation" : "bi-info-lg"}`}></i>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex align-items-center justify-content-between mb-0.5">
                                            <div className="fw-semibold text-dark small text-truncate" style={{ fontSize: "0.82rem" }}>
                                                {n.title}
                                            </div>
                                            {isUnread && (
                                                <span className="p-1 bg-primary rounded-circle ms-1 flex-shrink-0" style={{ width: "6px", height: "6px" }} />
                                            )}
                                        </div>
                                        <p className="mb-1 text-muted text-truncate-2" style={{ fontSize: "0.76rem", lineHeight: "1.3" }}>
                                            {n.message}
                                        </p>
                                        <small className="text-secondary" style={{ fontSize: "0.68rem" }}>
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(n.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                </ContentWrapper>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-top border-secondary border-opacity-10 bg-light text-center">
                <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                    EduNest Real-Time Notification Center
                </span>
            </div>
        </div>
    );
}

export default NotificationDropdown;
