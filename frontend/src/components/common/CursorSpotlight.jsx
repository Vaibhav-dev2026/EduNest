import React, { useEffect, useRef } from "react";

/**
 * Interactive Circular Cursor Spotlight System
 * Ultra-smooth RAF-driven cursor tracker with spotlight glow,
 * hover element expansion, click ripple, and automatic mobile/touch deactivation.
 */
function CursorSpotlight() {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const spotlightRef = useRef(null);
    const rippleRef = useRef(null);

    useEffect(() => {
        // Guard against touch devices or users who prefer reduced motion
        const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (isTouch || prefersReducedMotion) {
            return;
        }

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        let isHovered = false;
        let isVisible = false;
        let rafId = null;

        const dot = dotRef.current;
        const ring = ringRef.current;
        const spotlight = spotlightRef.current;
        const ripple = rippleRef.current;

        if (!dot || !ring || !spotlight) return;

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isVisible) {
                isVisible = true;
                dot.style.opacity = "1";
                ring.style.opacity = "1";
                spotlight.style.opacity = "1";
            }

            // Direct transform for the dot for instant feedback
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            spotlight.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

            // Check if hovering over clickable / interactive elements
            const target = e.target;
            if (target) {
                const interactive = target.closest("button, a, input, select, textarea, .card, .btn, .nav-link, [role='button']");
                if (interactive && !isHovered) {
                    isHovered = true;
                    ring.classList.add("cursor-ring--expanded");
                    dot.classList.add("cursor-dot--hovered");
                } else if (!interactive && isHovered) {
                    isHovered = false;
                    ring.classList.remove("cursor-ring--expanded");
                    dot.classList.remove("cursor-dot--hovered");
                }
            }
        };

        const onMouseLeave = () => {
            isVisible = false;
            dot.style.opacity = "0";
            ring.style.opacity = "0";
            spotlight.style.opacity = "0";
        };

        const onMouseEnter = () => {
            isVisible = true;
            dot.style.opacity = "1";
            ring.style.opacity = "1";
            spotlight.style.opacity = "1";
        };

        const onMouseDown = (e) => {
            ring.classList.add("cursor-ring--click");
            if (ripple) {
                ripple.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(0)`;
                ripple.classList.remove("cursor-ripple--active");
                // Trigger reflow for clean restart
                void ripple.offsetWidth;
                ripple.classList.add("cursor-ripple--active");
            }
        };

        const onMouseUp = () => {
            ring.classList.remove("cursor-ring--click");
        };

        // Smooth Lerp loop for the outer trailing ring
        const render = () => {
            // Lerp ring towards mouse position: ringX += (target - ringX) * factor
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;

            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        document.addEventListener("mouseleave", onMouseLeave);
        document.addEventListener("mouseenter", onMouseEnter);
        window.addEventListener("mousedown", onMouseDown, { passive: true });
        window.addEventListener("mouseup", onMouseUp, { passive: true });

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseleave", onMouseLeave);
            document.removeEventListener("mouseenter", onMouseEnter);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, []);

    return (
        <div className="cursor-spotlight-container" aria-hidden="true">
            {/* Soft Ambient Radial Spotlight */}
            <div ref={spotlightRef} className="cursor-spotlight" />
            {/* Smooth Trailing Translucent Glass Ring */}
            <div ref={ringRef} className="cursor-ring" />
            {/* Center High-Precision Dot */}
            <div ref={dotRef} className="cursor-dot" />
            {/* Subtle Click Feedback Ripple */}
            <div ref={rippleRef} className="cursor-ripple" />
        </div>
    );
}

export default CursorSpotlight;
