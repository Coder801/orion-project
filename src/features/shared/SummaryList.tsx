import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Two-column label/value summary (fees, quotes, review details). */
export function SummaryList({
    items,
    className,
}: {
    items: [label: string, value: ReactNode, emphasis?: boolean][];
    className?: string;
}) {
    return (
        <dl
            className={cn(
                "grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border bg-muted/40 p-4 text-sm",
                className,
            )}
        >
            {items.map(([label, value, emphasis]) => (
                <div key={label} className="contents">
                    <dt
                        className={cn(
                            "text-muted-foreground",
                            emphasis && "font-medium text-foreground",
                        )}
                    >
                        {label}
                    </dt>
                    <dd
                        className={cn(
                            "text-right break-all tabular-nums",
                            emphasis && "font-semibold",
                        )}
                    >
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
