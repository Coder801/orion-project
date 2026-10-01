"use client";

import { useTranslations } from "next-intl";
import { ChevronRightIcon, MenuIcon, PanelLeftIcon } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { findActiveNavItem, type NavVariant } from "@/config/navigation";
import { usePathname } from "@/i18n/navigation";

export function AppTopbar({
    variant,
    onToggleSidebar,
    onOpenMobileNav,
}: {
    variant: NavVariant;
    onToggleSidebar: () => void;
    onOpenMobileNav: () => void;
}) {
    const t = useTranslations();
    const pathname = usePathname();
    const active = findActiveNavItem(variant, pathname);

    return (
        <header className="sticky top-8 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur-xl lg:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t("layout.openMenu")}
                onClick={onOpenMobileNav}
            >
                <MenuIcon className="size-5" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
                aria-label={t("layout.toggleSidebar")}
                onClick={onToggleSidebar}
            >
                <PanelLeftIcon className="size-4.5" />
            </Button>

            <div className="flex min-w-0 items-center gap-1.5">
                <span className="hidden text-sm text-muted-foreground sm:block">
                    {t(
                        variant === "admin"
                            ? "layout.adminPanel"
                            : "layout.userArea",
                    )}
                </span>
                {active && (
                    <>
                        <ChevronRightIcon
                            aria-hidden
                            className="hidden size-3.5 text-muted-foreground/60 sm:block"
                        />
                        <span className="truncate font-heading text-[15px] font-semibold tracking-tight">
                            {t(`nav.${active.labelKey}`)}
                        </span>
                    </>
                )}
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                <LanguageSwitcher className="hidden sm:inline-flex" />
                {variant === "app" && <NotificationsMenu />}
                <ThemeToggle />
            </div>
        </header>
    );
}
