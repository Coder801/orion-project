"use client";

import { useSyncExternalStore } from "react";

import { MOTION_QUERIES } from "@/lib/gsap";

const subscribe = (onChange: () => void) => {
    const query = window.matchMedia(MOTION_QUERIES.desktop);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
};

/**
 * Whether scroll-driven animations run: desktop width and no reduced-motion
 * preference — the React counterpart of `MOTION_QUERIES.desktop` for
 * framer-motion components. The server assumes `true` so its markup matches
 * desktop; phones switch to static content right after hydration (behind the
 * first-paint loader).
 */
export function useScrollMotion() {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(MOTION_QUERIES.desktop).matches,
        () => true,
    );
}
