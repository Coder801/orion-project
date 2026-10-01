"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/i18n/languages";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
    const t = useTranslations("layout");
    const current = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Nothing to switch between while only one language ships.
    if (SUPPORTED_LANGUAGES.length < 2) return null;

    return (
        <div
            role="group"
            aria-label={t("language")}
            aria-busy={isPending}
            className={cn(
                "inline-flex h-9 items-center rounded-full border bg-muted/40 p-1",
                className,
            )}
        >
            {SUPPORTED_LANGUAGES.map((language) => {
                const isActive = language === current;
                const { short, native } = LANGUAGE_LABELS[language];
                return (
                    <button
                        key={language}
                        type="button"
                        lang={language}
                        aria-label={native}
                        aria-pressed={isActive}
                        disabled={isPending}
                        onClick={() =>
                            startTransition(() =>
                                router.replace(pathname, { locale: language }),
                            )
                        }
                        className={cn(
                            "h-full cursor-pointer rounded-full px-2.5 text-xs font-semibold transition-colors disabled:opacity-60",
                            isActive
                                ? "bg-card text-foreground shadow-[0_0_16px_-6px_var(--glow-primary)]"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {short}
                    </button>
                );
            })}
        </div>
    );
}
