"use client";

import { motion } from "framer-motion";
import {
    MessagesCircleIcon,
    ArrowRightIcon,
    ActivityIcon,
    GlobeIcon,
    HeadsetIcon,
    LandmarkIcon,
    ReceiptTextIcon,
    StarsIcon,
    TimerIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { useAppReady } from "@/components/app-ready";
import { AnimatedCounter } from "@/components/effects/animated-counter";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { SectionFrame } from "@/features/landing/section-frame";
import { Link } from "@/i18n/navigation";
import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// Selling points under the CTAs.
const HERO_HIGHLIGHTS = [
    { key: "fastOpening", icon: TimerIcon },
    { key: "transparentFees", icon: ReceiptTextIcon },
    { key: "support", icon: HeadsetIcon },
] as const;

// Decorative stats panel: values count up one after another, 1 s each.
const HERO_STATS = [
    { key: "countries", icon: GlobeIcon, value: 150, suffix: "+" },
    {
        key: "assets",
        icon: LandmarkIcon,
        value: 2.4,
        prefix: "$",
        suffix: "B+",
        decimals: 1,
    },
    {
        key: "uptime",
        icon: ActivityIcon,
        value: 99.97,
        suffix: "%",
        decimals: 2,
    },
] as const;

const STAT_COUNT_DURATION = 1;
// Start once the panel has finished sliding in (delay 0.4 + duration 0.9).
const STAT_COUNT_START = 1.1;

function HeroVisual() {
    const t = useTranslations("landing.hero.stats");
    const ready = useAppReady();

    return (
        <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="relative w-full"
        >
            <div className="absolute -inset-x-8 top-8 h-full rounded-4xl bg-linear-to-r from-primary/25 via-secondary/20 to-accent/15 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl shadow-2xl glass-strong">
                <div className="flex items-center gap-2 border-b px-5 py-3.5">
                    <span className="size-3 rounded-full bg-destructive/70" />
                    <span className="size-3 rounded-full bg-warning/70" />
                    <span className="size-3 rounded-full bg-success/70" />
                    <div className="mx-auto flex h-7 w-full max-w-60 items-center justify-center rounded-lg bg-muted/60">
                        <p className="text-sm font-medium text-muted-foreground">
                            {t("label")}
                        </p>
                    </div>
                </div>

                <div className="space-y-5 p-5">
                    <div className="grid grid-cols-3 gap-3">
                        {HERO_STATS.map((stat, i) => (
                            <div
                                key={stat.key}
                                className="rounded-xl border bg-card/70 p-3.5"
                            >
                                <span className="flex size-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                                    <stat.icon className="size-4" />
                                </span>
                                <AnimatedCounter
                                    value={stat.value}
                                    prefix={"prefix" in stat ? stat.prefix : ""}
                                    suffix={stat.suffix}
                                    decimals={
                                        "decimals" in stat ? stat.decimals : 0
                                    }
                                    duration={STAT_COUNT_DURATION}
                                    delay={
                                        STAT_COUNT_START +
                                        i * STAT_COUNT_DURATION
                                    }
                                    className="mt-4 block font-heading text-2xl font-bold tracking-tight tabular-nums lg:text-3xl"
                                />
                                <p className="mt-1 text-xs font-medium text-muted-foreground">
                                    {t(stat.key)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function Hero() {
    const t = useTranslations("landing.hero");
    const ready = useAppReady();
    const scope = useRef<HTMLElement>(null);

    // Leaving the hero: the copy lifts and fades while the preview straightens
    // from a slight 3D tilt — scrubbed by the transition to the next section.
    // Desktop only: on phones the hero scrolls away statically.
    // Separate wrappers keep GSAP off framer-motion's nodes.
    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_QUERIES.desktop, () => {
                const scrollTrigger = {
                    trigger: scope.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                };
                gsap.to("[data-hero-copy]", {
                    yPercent: -30,
                    scale: 0.92,
                    autoAlpha: 0,
                    ease: "none",
                    scrollTrigger,
                });
                gsap.fromTo(
                    "[data-hero-visual]",
                    { rotateY: -12, rotateX: 6, transformPerspective: 1400 },
                    {
                        rotateY: 0,
                        rotateX: 0,
                        yPercent: -15,
                        ease: "none",
                        scrollTrigger,
                    },
                );
            });
        },
        { scope },
    );

    return (
        <SectionFrame
            id="hero"
            ref={scope}
            background={
                <>
                    <AuroraBackground
                        intensity="strong"
                        className="mask-[linear-gradient(to_bottom,black_75%,transparent)]"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-grid mask-[radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
                    />
                </>
            }
        >
            <div className="container-wide grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
                <div
                    data-hero-copy
                    className="flex flex-col items-center text-center lg:items-start lg:text-left"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={ready ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge
                            variant="glow"
                            className="mb-6 tracking-widest uppercase"
                        >
                            <StarsIcon className="mr-2 size-4 text-accent" />
                            {t("eyebrow")}
                        </Badge>
                    </motion.div>

                    <motion.h1
                        id="hero-title"
                        initial={{ opacity: 0, y: 24 }}
                        animate={ready ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
                    >
                        <span className="text-gradient">{t("title")}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={ready ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-3xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                    >
                        {t("subtitle")}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={ready ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-6 max-w-xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg lg:text-xl"
                    >
                        {t("text")}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={ready ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="mt-9 flex flex-col items-center gap-3.5 sm:flex-row"
                    >
                        <Button
                            asChild
                            size="xl"
                            variant="gradient"
                            className="group"
                        >
                            <Link href={ROUTES.signUp}>
                                {t("primaryCta")}
                                <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild size="xl" variant="glass">
                            <Link href={ROUTES.signIn}>
                                <MessagesCircleIcon className="mr-2 h-4 w-4" />
                                {t("secondaryCta")}
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.ul
                        initial={{ opacity: 0, y: 24 }}
                        animate={ready ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 lg:justify-start"
                    >
                        {HERO_HIGHLIGHTS.map(({ key, icon: Icon }) => (
                            <li
                                key={key}
                                className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground"
                            >
                                <span className="flex size-7 shrink-0 items-center justify-center text-accent">
                                    <Icon aria-hidden className="size-3.5" />
                                </span>
                                {t(`highlights.${key}`)}
                            </li>
                        ))}
                    </motion.ul>
                </div>

                {/* Hidden on small screens so the hero fits one viewport. */}
                <div data-hero-visual className="hidden md:block">
                    <HeroVisual />
                </div>
            </div>
        </SectionFrame>
    );
}
