"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export function SpotlightCard({
    children,
    className,
    spotlightColor = "rgba(91, 91, 247, 0.14)",
    as: Comp = "div",
}: {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
    as?: React.ElementType;
}) {
    const ref = useRef<HTMLElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const opacity = useMotionValue(0);
    const background = useMotionTemplate`radial-gradient(480px circle at ${x}px ${y}px, ${spotlightColor}, transparent 65%)`;

    function onMouseMove(e: React.MouseEvent<HTMLElement>) {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
    }

    return (
        <Comp
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseEnter={() => opacity.set(1)}
            onMouseLeave={() => opacity.set(0)}
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-card transition-colors duration-300 hover:border-primary/30",
                className,
            )}
        >
            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{ opacity, background }}
            />
            {children}
        </Comp>
    );
}
