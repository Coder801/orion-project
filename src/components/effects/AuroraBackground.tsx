import { cn } from "@/lib/utils";

// Pure-CSS aurora background; place inside a `relative` parent (fills behind content).
export function AuroraBackground({
    className,
    intensity = "default",
}: {
    className?: string;
    intensity?: "subtle" | "default" | "strong";
}) {
    const opacity =
        intensity === "subtle"
            ? "opacity-40 dark:opacity-30"
            : intensity === "strong"
              ? "opacity-90 dark:opacity-80"
              : "opacity-70 dark:opacity-50";

    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden",
                className,
            )}
        >
            <div
                className={cn(
                    // Desktop-only animation: transforming this huge blur-3xl
                    // layer every frame overwhelms mobile GPUs (freezes).
                    "absolute -top-1/4 left-1/2 h-[80vh] w-[90vw] -translate-x-1/2 rounded-full blur-3xl lg:animate-aurora",
                    opacity,
                )}
                style={{
                    background:
                        "radial-gradient(ellipse 40% 50% at 30% 40%, rgba(91,91,247,0.5), transparent 70%), radial-gradient(ellipse 45% 45% at 70% 30%, rgba(139,92,246,0.42), transparent 70%), radial-gradient(ellipse 35% 40% at 55% 70%, rgba(0,245,212,0.22), transparent 70%), radial-gradient(ellipse 30% 35% at 20% 75%, rgba(255,78,205,0.2), transparent 70%)",
                }}
            />
        </div>
    );
}

export function GlowSpot({
    className,
    color = "primary",
}: {
    className?: string;
    color?: "primary" | "secondary" | "accent" | "pink";
}) {
    const colors: Record<string, string> = {
        primary: "rgba(91,91,247,0.35)",
        secondary: "rgba(139,92,246,0.32)",
        accent: "rgba(0,245,212,0.22)",
        pink: "rgba(255,78,205,0.25)",
    };
    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute size-120 rounded-full blur-3xl",
                className,
            )}
            style={{
                background: `radial-gradient(circle, ${colors[color]}, transparent 70%)`,
            }}
        />
    );
}
