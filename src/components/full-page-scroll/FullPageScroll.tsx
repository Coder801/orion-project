"use client";

import { useRef, type ComponentProps } from "react";

import {
    useFullPageScroll,
    type FullPageScrollOptions,
} from "./use-full-page-scroll";

type FullPageScrollProps = ComponentProps<"div"> & FullPageScrollOptions;

/**
 * Wrap full-height sections to page through them one gesture at a time:
 *
 * <FullPageScroll>
 *     <section className="h-svh">…</section>
 *     <section className="h-svh">…</section>
 * </FullPageScroll>
 */
export function FullPageScroll({
    sectionSelector,
    duration,
    ease,
    wheelThreshold,
    gestureGap,
    touchThreshold,
    syncHash,
    onSectionChange,
    children,
    ...props
}: FullPageScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    useFullPageScroll(ref, {
        sectionSelector,
        duration,
        ease,
        wheelThreshold,
        gestureGap,
        touchThreshold,
        syncHash,
        onSectionChange,
    });

    return (
        <div ref={ref} {...props}>
            {children}
        </div>
    );
}
