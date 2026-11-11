import React, { useEffect, useRef } from "react";

/**
 * ScrollReveal Component
 * Lightweight IntersectionObserver wrapper that applies subtle,
 * high-performance translateY and opacity transitions as elements scroll into view.
 * Fully supports prefers-reduced-motion accessibility.
 */
function ScrollReveal({
    children,
    className = "",
    delay = 0,
    direction = "up", // "up", "down", "none"
    threshold = 0.1
}) {
    const domRef = useRef(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        const currentEl = domRef.current;
        if (!currentEl) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    currentEl.classList.add("reveal-visible");
                    observer.unobserve(currentEl);
                }
            },
            {
                threshold,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        observer.observe(currentEl);

        return () => {
            if (currentEl) observer.unobserve(currentEl);
        };
    }, [threshold]);

    const dirClass = direction === "down" ? "reveal-down" : direction === "none" ? "reveal-fade" : "reveal-up";

    return (
        <div
            ref={domRef}
            className={`scroll-reveal ${dirClass} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export default ScrollReveal;
