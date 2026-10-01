"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import { IconTile } from "@/components/effects/icon-tile";
import { SpotlightCard } from "@/components/effects/spotlight-card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { LandingSection } from "@/config/landing";
import { useEnterTimeline } from "@/features/landing/motion";
import { SectionFrame } from "@/features/landing/section-frame";

type SupportProps = Extract<LandingSection, { type: "support" }>;

export function Support({ channels, faq }: SupportProps) {
    const t = useTranslations("landing.support");
    const scope = useRef<HTMLElement>(null);

    // Channels flip in, then the FAQ guide line draws down.
    useEnterTimeline(scope, (tl) => {
        tl.from(
            "[data-channel]",
            {
                rotationX: -70,
                y: 60,
                autoAlpha: 0,
                transformOrigin: "50% 0%",
                duration: 0.9,
                stagger: 0.12,
            },
            0.25,
        ).fromTo(
            "[data-faq-line]",
            { scaleY: 0 },
            { scaleY: 1, duration: 1.2, ease: "power2.inOut" },
            0.5,
        );
    });

    return (
        <SectionFrame id="support" ref={scope}>
            <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
                <div>
                    <h2
                        data-reveal
                        className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
                    >
                        {t("title")}
                    </h2>
                    <p
                        data-reveal
                        className="mt-4 text-lg text-muted-foreground"
                    >
                        {t("subtitle")}
                    </p>

                    <ul className="mt-8 grid gap-3 perspective-[1200px]">
                        {channels.map(({ key, icon }) => (
                            <li key={key} data-channel>
                                <SpotlightCard className="group flex items-center gap-4 p-4">
                                    <IconTile
                                        icon={icon}
                                        className="size-11 rounded-xl border border-accent/30 bg-accent/10"
                                        iconClassName="size-5 text-accent-foreground dark:text-accent"
                                    />
                                    <div className="min-w-0">
                                        <h3 className="font-heading font-semibold">
                                            {t(`channels.${key}.title`)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {t(`channels.${key}.text`)}
                                        </p>
                                    </div>
                                </SpotlightCard>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative pl-8">
                    <span
                        aria-hidden
                        className="absolute top-0 left-0 h-full w-px bg-border"
                    />
                    <span
                        data-faq-line
                        aria-hidden
                        className="absolute top-0 left-0 h-full w-px origin-top bg-linear-to-b from-primary via-secondary to-accent"
                    />
                    <h3
                        data-reveal
                        className="font-heading text-2xl font-bold tracking-tight"
                    >
                        {t("faqTitle")}
                    </h3>
                    <Accordion
                        data-reveal
                        type="single"
                        collapsible
                        className="mt-6 rounded-3xl border px-6 glass-strong lg:px-8"
                    >
                        {faq.map((key) => (
                            <AccordionItem key={key} value={`faq-${key}`}>
                                <AccordionTrigger>
                                    {t(`faq.${key}.question`)}
                                </AccordionTrigger>
                                <AccordionContent className="leading-relaxed">
                                    {t(`faq.${key}.answer`)}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </SectionFrame>
    );
}
