import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Dashboard panel in the theme's style. `flush` drops the body padding so a
 * table can run edge to edge under a divider.
 */
export function Panel({
    title,
    description,
    actions,
    toolbar,
    flush = false,
    className,
    children,
}: {
    title?: ReactNode;
    description?: string;
    actions?: ReactNode;
    /** Full-width controls above the body, e.g. filters. */
    toolbar?: ReactNode;
    flush?: boolean;
    className?: string;
    children?: ReactNode;
}) {
    const hasHeader = Boolean(title || actions || toolbar);

    return (
        <section className={cn("rounded-2xl border bg-card", className)}>
            {hasHeader && (
                <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0 lg:p-6 lg:pb-0">
                    {(title || description) && (
                        <div className="min-w-0">
                            {title && (
                                <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                    {actions && (
                        <div className="flex items-center gap-2">{actions}</div>
                    )}
                    {toolbar && <div className="w-full">{toolbar}</div>}
                </div>
            )}
            {children ? (
                <div
                    className={cn(
                        flush
                            ? // The divider separates the header; without one the
                              // section's own border already frames the table.
                              hasHeader && "mt-4 border-t"
                            : cn("p-5 lg:p-6", hasHeader && "pt-4 lg:pt-5"),
                    )}
                >
                    {children}
                </div>
            ) : (
                hasHeader && <div aria-hidden className="h-5 lg:h-6" />
            )}
        </section>
    );
}
