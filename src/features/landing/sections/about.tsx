"use client";

import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { GlowSpot } from "@/components/effects/aurora-background";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LandingSection } from "@/config/landing";
import { ROUTES } from "@/config/routes";
import { useEnterTimeline } from "@/features/landing/motion";
import { SectionFrame } from "@/features/landing/section-frame";
import { Link } from "@/i18n/navigation";
import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";

type AboutProps = Extract<LandingSection, { type: "about" }>;

export function About({ tabs }: AboutProps) {
    const t = useTranslations("landing.about");
    const scope = useRef<HTMLElement>(null);

    useEnterTimeline(scope);

    // The glow drifts with the page transition into and out of the section.
    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_QUERIES.desktop, () => {
                gsap.fromTo(
                    "[data-about-orb]",
                    { yPercent: 40 },
                    {
                        yPercent: -40,
                        ease: "none",
                        scrollTrigger: {
                            trigger: scope.current,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    },
                );
            });
        },
        { scope },
    );

    return (
        <SectionFrame
            id="about"
            ref={scope}
            background={
                <div
                    data-about-orb
                    aria-hidden
                    className="absolute top-1/4 right-0"
                >
                    <GlowSpot color="secondary" />
                </div>
            }
        >
            <div className="container-wide flex flex-col items-center text-center">
                <h2
                    data-reveal
                    className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                >
                    {t.rich("title", {
                        gradient: (chunks) => (
                            <span className="text-gradient">{chunks}</span>
                        ),
                    })}
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

                <Tabs
                    data-reveal
                    defaultValue={tabs[0]?.key}
                    className="mt-10 w-full max-w-3xl items-center gap-8"
                >
                    <TabsList className="max-w-full overflow-x-auto">
                        {tabs.map(({ key, icon: Icon }) => (
                            <TabsTrigger key={key} value={key}>
                                <Icon aria-hidden className="max-sm:hidden" />
                                {t(`tabs.${key}.label`)}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabs.map(({ key }) => (
                        <TabsContent
                            key={key}
                            value={key}
                            className="flex w-full animate-in flex-col items-center rounded-3xl p-6 glass duration-500 fade-in-0 slide-in-from-bottom-2 sm:p-10"
                        >
                            <h3 className="font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                                {t(`tabs.${key}.title`)}
                            </h3>
                            <p className="mt-4 leading-relaxed text-balance text-muted-foreground sm:text-lg">
                                {t(`tabs.${key}.text`)}
                            </p>
                            <Button
                                asChild
                                size="lg"
                                variant="gradient"
                                className="group mt-8"
                            >
                                <Link href={ROUTES.signUp}>
                                    {t("cta")}
                                    <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </SectionFrame>
    );
}
