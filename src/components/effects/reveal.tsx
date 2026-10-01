"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppReady } from "@/components/app-ready";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: 32 },
    down: { x: 0, y: -32 },
    left: { x: 32, y: 0 },
    right: { x: -32, y: 0 },
    none: { x: 0, y: 0 },
};

export function Reveal({
    children,
    className,
    direction = "up",
    delay = 0,
    duration = 0.7,
    once = true,
    blur = true,
}: {
    children: React.ReactNode;
    className?: string;
    direction?: Direction;
    delay?: number;
    duration?: number;
    once?: boolean;
    blur?: boolean;
}) {
    const reduced = useReducedMotion();
    const ready = useAppReady();
    const { x, y } = offsets[direction];

    return (
        <motion.div
            className={className}
            initial={
                reduced
                    ? { opacity: 0 }
                    : {
                          opacity: 0,
                          x,
                          y,
                          filter: blur ? "blur(8px)" : undefined,
                      }
            }
            whileInView={
                ready
                    ? reduced
                        ? { opacity: 1 }
                        : {
                              opacity: 1,
                              x: 0,
                              y: 0,
                              filter: blur ? "blur(0px)" : undefined,
                          }
                    : undefined
            }
            viewport={{ once, margin: "-80px" }}
            transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            {children}
        </motion.div>
    );
}

export function RevealStagger({
    children,
    className,
    stagger = 0.08,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    stagger?: number;
    delay?: number;
}) {
    const ready = useAppReady();

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView={ready ? "visible" : undefined}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ staggerChildren: stagger, delayChildren: delay }}
        >
            {children}
        </motion.div>
    );
}

const staggerItem: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
    },
};

export function StaggerItem({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div className={cn(className)} variants={staggerItem}>
            {children}
        </motion.div>
    );
}
