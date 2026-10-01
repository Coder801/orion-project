"use client";

import type { VariantProps } from "class-variance-authority";
import { FileBadgeIcon, InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { GlowSpot } from "@/components/effects/aurora-background";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { LandingSection, LicenseState } from "@/config/landing";
import { useEnterTimeline } from "@/features/landing/motion";
import { SectionFrame } from "@/features/landing/section-frame";

type LicenseProps = Extract<LandingSection, { type: "license" }>;
type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const STATE_BADGE: Record<LicenseState, BadgeVariant> = {
    active: "success",
    inProgress: "warning",
    planned: "secondary",
};

export function License({ items }: LicenseProps) {
    const t = useTranslations("landing.license");
    const scope = useRef<HTMLElement>(null);

    useEnterTimeline(scope, (tl) => {
        tl.from(
            "[data-license-icon]",
            {
                rotate: -90,
                scale: 0.4,
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(2)",
            },
            0.3,
        );
    });

    return (
        <SectionFrame
            id="license"
            ref={scope}
            background={
                <GlowSpot
                    color="primary"
                    className="top-1/3 -left-40 opacity-60"
                />
            }
        >
            <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
                <div className="lg:sticky lg:top-36 lg:self-start">
                    <Badge
                        data-reveal
                        variant="glow"
                        className="tracking-widest uppercase"
                    >
                        {t("eyebrow")}
                    </Badge>
                    <h2
                        data-reveal
                        className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                    >
                        {t("title")}
                    </h2>
                    <p
                        data-reveal
                        className="mt-5 text-lg text-muted-foreground"
                    >
                        {t("subtitle")}
                    </p>
                    <p
                        data-reveal
                        className="mt-8 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-muted-foreground"
                    >
                        <InfoIcon
                            className="mt-0.5 size-4 shrink-0 text-warning"
                            aria-hidden
                        />
                        {t("disclaimer")}
                    </p>
                </div>

                <ol className="space-y-6">
                    {items.map(({ key, state }, index) => (
                        <li key={key} data-reveal>
                            <article className="relative flex min-h-72 flex-col overflow-hidden rounded-3xl border p-8 shadow-2xl glass-strong lg:p-10">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/15 blur-3xl"
                                />
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        data-license-icon
                                        className="grid size-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary"
                                    >
                                        <FileBadgeIcon
                                            className="size-5.5"
                                            aria-hidden
                                        />
                                    </span>
                                    <Badge variant={STATE_BADGE[state]}>
                                        <span
                                            aria-hidden
                                            className="size-1.5 rounded-full bg-current"
                                        />
                                        {t(`states.${state}`)}
                                    </Badge>
                                </div>
                                <span className="mt-auto pt-5 font-mono text-xs text-muted-foreground">
                                    {String(index + 1).padStart(2, "0")} /{" "}
                                    {String(items.length).padStart(2, "0")}
                                </span>
                                <h3 className="mt-2 font-heading text-2xl font-semibold lg:text-3xl">
                                    {t(`items.${key}.title`)}
                                </h3>
                                <p className="mt-2 text-muted-foreground">
                                    {t(`items.${key}.text`)}
                                </p>
                            </article>
                        </li>
                    ))}
                </ol>
            </div>
        </SectionFrame>
    );
}
