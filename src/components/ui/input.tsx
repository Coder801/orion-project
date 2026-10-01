import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "flex h-10 w-full min-w-0 rounded-xl border border-input bg-transparent px-4 py-2 text-sm outline-hidden transition-colors",
                "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
                "focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/20",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
                className,
            )}
            {...props}
        />
    );
}

export { Input };
