import React, { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    // Desktop collapsed preference persistence
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem("edunest_sidebar_collapsed") === "true";
        } catch {
            return false;
        }
    });

    // Mobile slide-in drawer state
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem("edunest_sidebar_collapsed", isCollapsed ? "true" : "false");
        } catch (e) {
            console.error("Failed to store sidebar state:", e);
        }
    }, [isCollapsed]);

    // Lock body scrolling when mobile drawer is open to prevent background scroll
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileOpen]);

    const toggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    const toggleMobile = () => {
        setIsMobileOpen(prev => !prev);
    };

    const closeMobile = () => {
        setIsMobileOpen(false);
    };

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                isMobileOpen,
                toggleCollapse,
                toggleMobile,
                closeMobile
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
