import { InboxIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

function EmptyState({
    title,
    description,
    icon: Icon = InboxIcon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center",
                className,
            )}
        >
            <span className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_-8px_var(--glow-primary)]">
                <Icon className="size-5.5" aria-hidden />
            </span>
            <h3 className="mt-4 font-heading text-sm font-semibold">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export { EmptyState };
