"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { cn } from "@/lib/utils";

function Progress({
    className,
    value,
    indicatorClassName,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
}) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            value={value}
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-muted",
                className,
            )}
            {...props}
        >
            <ProgressPrimitive.Track className="h-full w-full">
                <ProgressPrimitive.Indicator
                    data-slot="progress-indicator"
                    className={cn(
                        "h-full rounded-full bg-linear-to-r from-primary to-secondary transition-all duration-500",
                        indicatorClassName,
                    )}
                />
            </ProgressPrimitive.Track>
        </ProgressPrimitive.Root>
    );
}

export { Progress };
