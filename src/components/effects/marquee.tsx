"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Seamless marquee: two identical tiles translate by -50%. Each tile repeats
// children past viewport width (else short lists gap); duration scales with count.
export function Marquee({
    children,
    className,
    reverse = false,
    pauseOnHover = true,
    speed = "default",
    durationSeconds,
}: {
    children: React.ReactNode;
    className?: string;
    reverse?: boolean;
    pauseOnHover?: boolean;
    speed?: "slow" | "default" | "fast";
    /** Exact base loop duration in seconds; overrides the `speed` preset. */
    durationSeconds?: number;
}) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const tileRef = useRef<HTMLDivElement>(null);
    const [repeat, setRepeat] = useState(1);

    useEffect(() => {
        const viewport = viewportRef.current;
        const tile = tileRef.current;
        if (!viewport || !tile) return;

        // Measure ONCE after first paint — no ResizeObserver/resize listener.
        // repeat starts at 1, so scrollWidth here is exactly one unit's width.
        const raf = requestAnimationFrame(() => {
            const viewportWidth = viewport.offsetWidth;
            const unitWidth = tile.scrollWidth;
            if (!unitWidth || !viewportWidth) return;
            // One tile must exceed the viewport (+1 copy of headroom).
            const needed = Math.max(
                1,
                Math.ceil(viewportWidth / unitWidth) + 1,
            );
            if (needed !== 1) setRepeat(needed);
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    const presetSeconds = speed === "slow" ? 60 : speed === "fast" ? 24 : 40;
    const baseSeconds = durationSeconds ?? presetSeconds;
    const animationDuration = `${baseSeconds * repeat}s`;

    const renderTile = (measured: boolean) => (
        <div
            ref={measured ? tileRef : undefined}
            aria-hidden={!measured}
            className="flex shrink-0 items-center gap-8 pr-8"
        >
            {Array.from({ length: repeat }).map((_, i) => (
                <Fragment key={i}>{children}</Fragment>
            ))}
        </div>
    );

    return (
        <div
            ref={viewportRef}
            className={cn(
                "group flex w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
                className,
            )}
        >
            <div
                className={cn(
                    "flex w-max shrink-0",
                    reverse ? "animate-marquee-reverse" : "animate-marquee",
                    pauseOnHover && "group-hover:paused",
                )}
                style={{ animationDuration }}
            >
                {renderTile(true)}
                {renderTile(false)}
            </div>
        </div>
    );
}
