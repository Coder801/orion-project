import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "flex min-h-24 w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm outline-hidden transition-colors",
                "placeholder:text-muted-foreground",
                "focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/20",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
