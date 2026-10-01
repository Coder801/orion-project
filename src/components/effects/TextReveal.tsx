"use client";

import { Fragment, useRef } from "react";
import {
    motion,
    useInView,
    useReducedMotion,
    type Variants,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { useAppReady } from "@/components/AppReady";
import { useScrollMotion } from "@/lib/hooks/useScrollMotion";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const wordVariant: Variants = {
    hidden: { y: "115%" },
    visible: { y: 0, transition: { duration: 0.6, ease: EASE } },
};

// useInView + animate (not whileInView): the reveal must wait for the app-ready
// gate, and whileInView can miss elements already in view when the gate flips.
export function TextReveal({
    children,
    className,
    stagger = 0.05,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    stagger?: number;
    delay?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();
    const ready = useAppReady();
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const scrollMotion = useScrollMotion();
    const show = ready && inView;

    if (!scrollMotion)
        return (
            <span ref={ref} className={cn("block", className)}>
                {children}
            </span>
        );

    if (reduced) {
        return (
            <motion.span
                ref={ref}
                className={cn("block", className)}
                initial={{ opacity: 0 }}
                animate={{ opacity: show ? 1 : 0 }}
                transition={{ duration: 0.5, delay }}
            >
                {children}
            </motion.span>
        );
    }

    if (typeof children === "string") {
        const words = children.split(" ");
        return (
            <motion.span
                ref={ref}
                className={cn("block", className)}
                initial="hidden"
                animate={show ? "visible" : "hidden"}
                transition={{ staggerChildren: stagger, delayChildren: delay }}
                aria-label={children}
            >
                {words.map((word, i) => (
                    // The space sits between the clipped word boxes: inside an
                    // inline-block a trailing space collapses and words run together.
                    <Fragment key={`${word}-${i}`}>
                        <span
                            aria-hidden
                            className="inline-flex overflow-hidden pb-[0.12em] align-bottom"
                        >
                            <motion.span
                                className="inline-block will-change-transform"
                                variants={wordVariant}
                            >
                                {word}
                            </motion.span>
                        </span>
                        {i < words.length - 1 ? " " : null}
                    </Fragment>
                ))}
            </motion.span>
        );
    }

    return (
        <span
            ref={ref}
            className={cn(
                "mb-[-0.14em] block overflow-hidden pb-[0.14em]",
                className,
            )}
        >
            <motion.span
                className="block will-change-transform"
                initial={{ y: "115%" }}
                animate={{ y: show ? 0 : "115%" }}
                transition={{ duration: 0.7, delay, ease: EASE }}
            >
                {children}
            </motion.span>
        </span>
    );
}
