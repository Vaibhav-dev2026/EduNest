import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
import { getCurrentUser } from "../services/authService";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const user = getCurrentUser();

    const fetchNotifications = useCallback(async (isBackground = false) => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        if (!isBackground) setLoading(true);
        setError(null);

        try {
            const res = await getNotifications();
            if (res && res.success) {
                setNotifications(res.data || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (err) {
            // Silently handle in background to avoid disrupting UX
            if (!isBackground) {
                setError("Unable to load notifications.");
            }
        } finally {
            if (!isBackground) setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email, user?.role]);

    useEffect(() => {
        fetchNotifications();

        // High-efficiency polling (25s interval, pauses when tab is hidden)
        const intervalId = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchNotifications(true);
            }
        }, 25000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications(true);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
        };
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => (n._id === id || n.notificationId === id ? { ...n, read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            await markAsRead(id);
        } catch (err) {
            fetchNotifications(true);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);

            await markAllAsRead();
        } catch (err) {
            fetchNotifications(true);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                error,
                refresh: () => fetchNotifications(false),
                markAsRead: handleMarkAsRead,
                markAllAsRead: handleMarkAllAsRead
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
