"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { brandHex } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function LogoMark({ className }: { className?: string }) {
    const gradientId = useId();

    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
            className={cn("size-8", className)}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor={brandHex.primary} />
                    <stop offset="55%" stopColor={brandHex.secondary} />
                    <stop offset="100%" stopColor={brandHex.accent} />
                </linearGradient>
            </defs>
            <rect
                x="1.5"
                y="1.5"
                width="29"
                height="29"
                rx="9"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
            />
            <circle cx="10" cy="20.5" r="2.4" fill={`url(#${gradientId})`} />
            <circle cx="16" cy="16" r="2.4" fill={`url(#${gradientId})`} />
            <circle cx="22" cy="11.5" r="2.4" fill={brandHex.accent} />
        </svg>
    );
}

export function Logo({
    href = "/",
    className,
    textClassName,
}: {
    href?: string;
    className?: string;
    textClassName?: string;
}) {
    const t = useTranslations("layout");
    const pathname = usePathname();

    return (
        <Link
            href={href}
            onClick={(e) => {
                // Already there — scroll to top instead of a no-op navigation.
                if (pathname === href) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }}
            className={cn("flex shrink-0 items-center gap-2.5", className)}
            aria-label={t("logoLabel")}
        >
            <LogoMark />
            <span
                className={cn(
                    "font-heading text-lg font-bold tracking-tight",
                    textClassName,
                )}
            >
                {siteConfig.name}
                <span className="text-gradient"> Bank</span>
            </span>
        </Link>
    );
}
