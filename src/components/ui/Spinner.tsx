import { LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** With `label` the spinner is announced as a live status region. */
function Spinner({ className, label }: { className?: string; label?: string }) {
    const icon = (
        <LoaderCircleIcon
            aria-hidden
            className={cn("size-5 animate-spin text-primary", className)}
        />
    );
    if (!label) return icon;

    return (
        <span role="status" className="inline-flex">
            {icon}
            <span className="sr-only">{label}</span>
        </span>
    );
}

export { Spinner };
