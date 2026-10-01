"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import { SectionHeading } from "@/components/site/section-heading";
import type { PartnerKey, PartnerTone } from "@/config/landing";
import { useEnterTimeline } from "@/features/landing/motion";
import { SectionFrame } from "@/features/landing/section-frame";
import { cn } from "@/lib/utils";
import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";

type PartnerItem = { key: PartnerKey; tone: PartnerTone };

const TONE_CLASSES: Record<PartnerTone, string> = {
    sky: "bg-sky-500/15 text-sky-500 ring-sky-500/30",
    emerald: "bg-emerald-500/15 text-emerald-500 ring-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-500 ring-amber-500/30",
    rose: "bg-rose-500/15 text-rose-500 ring-rose-500/30",
    violet: "bg-violet-500/15 text-violet-500 ring-violet-500/30",
    cyan: "bg-cyan-500/15 text-cyan-500 ring-cyan-500/30",
    orange: "bg-orange-500/15 text-orange-500 ring-orange-500/30",
    indigo: "bg-indigo-500/15 text-indigo-500 ring-indigo-500/30",
    teal: "bg-teal-500/15 text-teal-500 ring-teal-500/30",
    fuchsia: "bg-fuchsia-500/15 text-fuchsia-500 ring-fuchsia-500/30",
    lime: "bg-lime-500/15 text-lime-600 ring-lime-500/30",
    red: "bg-red-500/15 text-red-500 ring-red-500/30",
};

// Rotates the list so each row starts with a different bank.
const rotate = <T,>(list: T[], by: number) => [
    ...list.slice(by % list.length),
    ...list.slice(0, by % list.length),
];

// Each row slides horizontally with the page transition, alternating direction.
const ROWS = [
    { from: 0, to: -25 },
    { from: -25, to: 0 },
    { from: 0, to: -20 },
];

export function Partners({ items }: { items: PartnerItem[] }) {
    const t = useTranslations("landing.partners");
    const scope = useRef<HTMLElement>(null);
    const rowOffset = Math.ceil(items.length / ROWS.length);

    useEnterTimeline(scope, (tl) => {
        tl.from(
            "[data-partner-row]",
            { autoAlpha: 0, duration: 0.9, stagger: 0.12 },
            0.2,
        );
    });

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_QUERIES.motion, () => {
                gsap.utils
                    .toArray<HTMLElement>("[data-partner-row]", scope.current)
                    .forEach((row, i) => {
                        const { from, to } = ROWS[i % ROWS.length];
                        gsap.fromTo(
                            row,
                            { xPercent: from },
                            {
                                xPercent: to,
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
            });
        },
        { scope },
    );

    return (
        <SectionFrame id="partners" ref={scope}>
            <div className="container-wide">
                <SectionHeading
                    eyebrow={t("eyebrow")}
                    title={t("title")}
                    description={t("subtitle")}
                    className="mb-10 lg:mb-14"
                />
            </div>
            <div
                data-partner-rows
                className="space-y-5 overflow-x-clip mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
            >
                {ROWS.map((_, rowIndex) => {
                    const row = rotate(items, rowIndex * rowOffset);
                    return (
                        <ul
                            key={rowIndex}
                            data-partner-row
                            className="flex w-max gap-5"
                        >
                            {[...row, ...row].map(({ key, tone }, i) => {
                                const name = t(`items.${key}.name`);
                                // The second copy only fills the marquee width.
                                const duplicate = i >= row.length;
                                return (
                                    <li
                                        key={`${key}-${i}`}
                                        aria-hidden={duplicate || undefined}
                                        className="flex h-20 w-64 shrink-0 items-center gap-4 rounded-2xl border bg-card/70 px-5 transition-colors hover:border-primary/40"
                                    >
                                        <span
                                            aria-hidden
                                            className={cn(
                                                "flex size-11 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold ring-1",
                                                TONE_CLASSES[tone],
                                            )}
                                        >
                                            {name.charAt(0)}
                                        </span>
                                        <span className="flex min-w-0 flex-col">
                                            <span className="truncate font-heading text-base font-semibold">
                                                {name}
                                            </span>
                                            <span className="truncate text-sm text-muted-foreground">
                                                {t(`items.${key}.country`)}
                                            </span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    );
                })}
            </div>
        </SectionFrame>
    );
}
