"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthCard({
    icon: Icon,
    title,
    description,
    children,
    footer,
}: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            <div className="rounded-3xl border p-8 shadow-2xl glass-strong sm:p-10">
                <div className="mb-8">
                    <div className="mb-5 inline-flex size-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_24px_-6px_var(--glow-primary)]">
                        <Icon className="size-5 text-primary" aria-hidden />
                    </div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {children}
            </div>
            {footer && (
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    {footer}
                </p>
            )}
        </motion.div>
    );
}

export const authLinkClassName = "font-medium text-primary hover:underline";
