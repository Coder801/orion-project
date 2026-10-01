"use client";

import { useEffect, useRef } from "react";
import {
    animate,
    motion,
    useInView,
    useReducedMotion,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";

import { useAppReady } from "@/components/app-ready";

export function AnimatedCounter({
    value,
    suffix = "",
    prefix = "",
    decimals = 0,
    duration,
    delay = 0,
    className,
}: {
    value: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    /** Seconds to count from zero; omitted = spring with a natural settle. */
    duration?: number;
    /** Seconds to wait before counting (only with `duration`). */
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const ready = useAppReady();
    const reducedMotion = useReducedMotion();
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { damping: 32, stiffness: 80 });
    const display = useTransform(
        duration === undefined ? spring : motionValue,
        (v) => `${prefix}${v.toFixed(decimals)}${suffix}`,
    );

    useEffect(() => {
        if (!inView || !ready) return;
        if (duration === undefined) {
            motionValue.set(value);
            return;
        }
        if (reducedMotion) {
            motionValue.jump(value);
            return;
        }
        const controls = animate(motionValue, value, {
            duration,
            delay,
            ease: "easeOut",
        });
        return () => controls.stop();
    }, [inView, ready, value, duration, delay, reducedMotion, motionValue]);

    return (
        <motion.span ref={ref} className={className}>
            {display}
        </motion.span>
    );
}
