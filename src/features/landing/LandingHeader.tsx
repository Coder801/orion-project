"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/Sheet";
import { LANDING_NAV } from "@/config/landing";
import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LandingHeader() {
    const t = useTranslations("landing.nav");
    const tl = useTranslations("layout");
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 12);
        }
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-8 z-50 transition-all duration-300",
                scrolled ? "py-2.5" : "py-4",
            )}
        >
            <div className="container-wide">
                <div className="relative isolate flex h-14 items-center justify-between gap-4 rounded-2xl px-4 lg:px-5">
                    {/* Glass layer kept separate: backdrop-filter on the container
                        would form a backdrop root and break blur inside popups. */}
                    <div
                        aria-hidden
                        className={cn(
                            "absolute inset-0 -z-10 rounded-2xl transition-all duration-300",
                            scrolled
                                ? "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] glass-strong"
                                : "glass",
                        )}
                    />
                    <Logo />

                    <nav
                        className="hidden items-center lg:flex"
                        aria-label={t("label")}
                    >
                        {LANDING_NAV.map((section) => (
                            <a
                                key={section}
                                href={`#${section}`}
                                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {t(section)}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1.5">
                        <LanguageSwitcher className="hidden sm:inline-flex" />
                        <ThemeToggle />
                        <Button
                            asChild
                            variant="ghost"
                            className="hidden md:inline-flex"
                        >
                            <Link href={ROUTES.signIn}>{t("login")}</Link>
                        </Button>
                        <Button
                            asChild
                            variant="gradient"
                            className="hidden sm:inline-flex"
                        >
                            <Link href={ROUTES.signUp}>{t("openAccount")}</Link>
                        </Button>

                        <Sheet
                            open={mobileMenuOpen}
                            onOpenChange={setMobileMenuOpen}
                        >
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    aria-label={tl("openMenu")}
                                >
                                    <MenuIcon className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="top-8 h-auto w-full max-w-sm overflow-y-auto bg-popover/90 backdrop-blur-xl"
                            >
                                <SheetHeader className="pb-0">
                                    <SheetTitle>
                                        <Logo />
                                    </SheetTitle>
                                </SheetHeader>
                                <nav
                                    className="flex flex-col px-6 pb-6"
                                    aria-label={t("label")}
                                >
                                    {LANDING_NAV.map((section) => (
                                        <a
                                            key={section}
                                            href={`#${section}`}
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="flex border-b py-4 text-sm font-medium transition-colors last-of-type:border-b-0 hover:text-primary"
                                        >
                                            {t(section)}
                                        </a>
                                    ))}
                                    <LanguageSwitcher className="mt-6 self-start" />
                                    <div className="mt-6 flex flex-col gap-2.5">
                                        <Button asChild variant="outline">
                                            <Link href={ROUTES.signIn}>
                                                {t("login")}
                                            </Link>
                                        </Button>
                                        <Button asChild variant="gradient">
                                            <Link href={ROUTES.signUp}>
                                                {t("openAccount")}
                                            </Link>
                                        </Button>
                                    </div>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
