import { cn } from "@/lib/utils";

/** The theme's hairline divider: a primary-tinted line fading out at both ends. */
export function SectionDivider({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none h-px bg-linear-to-r from-transparent via-primary/50 to-transparent",
                className,
            )}
        />
    );
}
