"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Magnetic({
    children,
    className,
    strength = 0.35,
}: {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springConfig = { stiffness: 180, damping: 16, mass: 0.6 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    function onMouseMove(e: React.MouseEvent) {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * strength);
        y.set((e.clientY - rect.top - rect.height / 2) * strength);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ x: springX, y: springY }}
        >
            {children}
        </motion.div>
    );
}
