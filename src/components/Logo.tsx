"use client";

import { useTranslations } from "next-intl";

import { LogoMarkArt, LogoWordmark } from "@/components/LogoArt";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Icon-sized planet "O" for compact slots (collapsed sidebar, mobile headers). */
export function LogoMark({ className }: { className?: string }) {
    return <LogoMarkArt className={className} />;
}

export function Logo({
    href = "/",
    className,
}: {
    href?: string;
    className?: string;
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
            className={cn("flex shrink-0 items-center py-1.25", className)}
            aria-label={t("logoLabel")}
        >
            <LogoWordmark className="h-8" />
        </Link>
    );
}
