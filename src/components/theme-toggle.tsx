"use client";

import { useTranslations } from "next-intl";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResolvedTheme } from "@/lib/hooks/useResolvedTheme";

export function ThemeToggle() {
    const t = useTranslations("layout");
    const { theme, setTheme } = useResolvedTheme();
    // Dark is the default theme, so assume it until the real one is known.
    const isDark = theme !== "light";

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? t("switchToLight") : t("switchToDark")}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            <SunIcon className="hidden size-4.5 dark:block" />
            <MoonIcon className="size-4.5 dark:hidden" />
        </Button>
    );
}
