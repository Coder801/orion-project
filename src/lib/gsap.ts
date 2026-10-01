"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once; every scroll animation imports gsap from here.
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

/** Media conditions shared by scroll animations (`gsap.matchMedia`). */
export const MOTION_QUERIES = {
    motion: "(prefers-reduced-motion: no-preference)",
    desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
