import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/effects/reveal";
import { TextReveal } from "@/components/effects/text-reveal";

export function SectionHeading({
    eyebrow,
    eyebrowIcon: EyebrowIcon,
    title,
    description,
    align = "center",
    size = "default",
    as: Heading = "h2",
    className,
}: {
    eyebrow?: string;
    eyebrowIcon?: LucideIcon;
    title: React.ReactNode;
    description?: string;
    align?: "center" | "left";
    /** "hero" matches page-hero h1 scale (text-4xl → lg:text-6xl). */
    size?: "default" | "hero";
    as?: "h1" | "h2";
    className?: string;
}) {
    return (
        <div
            className={cn(
                "mb-12 flex flex-col gap-4 lg:mb-16",
                align === "center"
                    ? "mx-auto max-w-3xl items-center text-center"
                    : "max-w-2xl items-start text-left",
                className,
            )}
        >
            {eyebrow ? (
                <Reveal>
                    <Badge variant="glow" className="tracking-widest uppercase">
                        {EyebrowIcon ? <EyebrowIcon aria-hidden /> : null}
                        {eyebrow}
                    </Badge>
                </Reveal>
            ) : null}
            <Heading
                className={cn(
                    "font-bold tracking-tight text-balance",
                    size === "hero"
                        ? "text-4xl sm:text-5xl lg:text-6xl"
                        : "text-3xl sm:text-4xl lg:text-5xl",
                )}
            >
                <TextReveal>{title}</TextReveal>
            </Heading>
            {description ? (
                <Reveal delay={0.15}>
                    <p className="text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
                        {description}
                    </p>
                </Reveal>
            ) : null}
        </div>
    );
}
