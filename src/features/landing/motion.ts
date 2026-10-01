"use client";

import { useCallback, useRef, type RefObject } from "react";

import { useSectionEnter } from "@/components/full-page-scroll";
import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";

type Timeline = ReturnType<typeof gsap.timeline>;

/**
 * Entrance animation for a full-page section: `[data-reveal]` elements fade
 * up, plus whatever `build` adds. The timeline is created paused (content
 * starts hidden) and plays once, when the section first becomes active.
 * Reduced-motion users get static content.
 */
export function useEnterTimeline(
    scope: RefObject<HTMLElement | null>,
    build?: (tl: Timeline, root: HTMLElement) => void,
) {
    const timeline = useRef<Timeline | null>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_QUERIES.motion, () => {
                const root = scope.current;
                if (!root) return;
                const tl = gsap.timeline({
                    paused: true,
                    defaults: { ease: "power3.out" },
                });
                const reveals = gsap.utils.toArray<Element>(
                    "[data-reveal]",
                    root,
                );
                if (reveals.length)
                    tl.from(
                        reveals,
                        { autoAlpha: 0, y: 48, duration: 0.8, stagger: 0.08 },
                        0.2,
                    );
                build?.(tl, root);
                timeline.current = tl;
                return () => {
                    timeline.current = null;
                };
            });
        },
        { scope },
    );

    useSectionEnter(
        scope,
        useCallback(() => {
            timeline.current?.play();
        }, []),
    );
}

// Fades a full-section background in and out so its clipped edges don't show
// as hard lines between sections.
export const SECTION_FADE_MASK =
    "mask-[linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]";
