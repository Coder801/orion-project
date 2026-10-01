"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import { AuroraBackground } from "@/components/effects/aurora-background";
import { IconTile } from "@/components/effects/icon-tile";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import type { LandingSection } from "@/config/landing";
import { SECTION_FADE_MASK, useEnterTimeline } from "@/features/landing/motion";
import { SectionFrame } from "@/features/landing/section-frame";

type ServicesProps = Extract<LandingSection, { type: "services" }>;

export function Services({ items }: ServicesProps) {
    const t = useTranslations("landing.services");
    const scope = useRef<HTMLElement>(null);

    // Cards rise into place on arrival.
    useEnterTimeline(scope, (tl) => {
        tl.from(
            "[data-service-card]",
            { autoAlpha: 0, y: 48, duration: 0.8, stagger: 0.08 },
            0.25,
        );
    });

    return (
        <SectionFrame
            id="services"
            ref={scope}
            background={
                <AuroraBackground
                    intensity="subtle"
                    className={SECTION_FADE_MASK}
                />
            }
        >
            <div className="container-wide">
                <div className="flex flex-col items-center text-center">
                    <h2
                        data-reveal
                        className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                    >
                        {t("title")}
                    </h2>
                    <p
                        data-reveal
                        className="mt-4 font-heading text-xl font-semibold text-balance sm:text-2xl lg:text-3xl"
                    >
                        {t("subtitle")}
                    </p>
                    <p
                        data-reveal
                        className="mt-4 max-w-2xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg"
                    >
                        {t("text")}
                    </p>
                </div>

                <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                    {items.map(({ key, icon }, index) => (
                        <li key={key} data-service-card>
                            <SpotlightCard className="group flex h-full flex-col p-7 lg:p-8">
                                <div className="flex items-start justify-between">
                                    <IconTile
                                        icon={icon}
                                        className="size-14 rounded-2xl border border-primary/25 bg-primary/10 shadow-[0_0_32px_-8px_var(--glow-primary)]"
                                        iconClassName="size-6 text-primary"
                                    />
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <h3 className="mt-8 font-heading text-xl font-semibold sm:text-2xl">
                                    {t(`items.${key}.title`)}
                                </h3>
                                <p className="mt-2 leading-relaxed text-muted-foreground">
                                    {t(`items.${key}.text`)}
                                </p>
                            </SpotlightCard>
                        </li>
                    ))}
                </ul>
            </div>
        </SectionFrame>
    );
}
