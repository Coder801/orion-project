import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
    AuroraBackground,
    GlowSpot,
} from "@/components/effects/AuroraBackground";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo, LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GuestOnly } from "@/features/auth/Guards";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
    const t = useTranslations();

    return (
        <div className="grid min-h-[calc(100dvh-2rem)] grid-cols-1 lg:grid-cols-2">
            <aside className="relative hidden overflow-hidden border-r lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
                <AuroraBackground intensity="strong" />
                <div
                    aria-hidden
                    className="absolute inset-0 bg-grid mask-[radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
                />
                <GlowSpot color="primary" className="-top-32 -left-24" />
                <GlowSpot color="accent" className="-right-24 -bottom-40" />

                <div
                    aria-hidden
                    className="pointer-events-none absolute top-[18%] right-[12%] size-24 animate-float rounded-full bg-linear-to-br from-primary/50 to-secondary/40 blur-xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-[26%] left-[8%] size-16 animate-float-slow rounded-full bg-linear-to-br from-accent/40 to-primary/30 blur-lg"
                />

                <div className="relative">
                    <Logo />
                </div>

                <div className="relative max-w-md">
                    <p className="font-heading text-3xl font-bold tracking-tight text-balance xl:text-4xl">
                        <span className="text-gradient">
                            {t("landing.hero.title")}
                        </span>
                    </p>
                    <p className="mt-4 text-muted-foreground">
                        {t("landing.hero.subtitle")}
                    </p>
                </div>

                <p className="relative flex max-w-md items-start gap-3 rounded-2xl p-4 text-xs leading-relaxed text-muted-foreground glass">
                    <ShieldCheckIcon
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                    />
                    {t("landing.footer.disclaimer")}
                </p>
            </aside>

            <div className="relative flex flex-col overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-dots mask-[radial-gradient(ellipse_60%_50%_at_50%_35%,black,transparent)] opacity-60"
                />
                <GlowSpot
                    color="secondary"
                    className="-top-48 right-0 opacity-50"
                />

                <header className="relative flex items-center justify-between gap-3 p-6 lg:p-8">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeftIcon
                            aria-hidden
                            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                        />
                        {t("layout.backToHome")}
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <Link
                            href="/"
                            aria-label={t("layout.logoLabel")}
                            className="ml-1 lg:hidden"
                        >
                            <LogoMark className="size-7" />
                        </Link>
                    </div>
                </header>

                <main
                    id="main"
                    className="relative flex flex-1 items-center justify-center px-6 pt-4 pb-16 lg:px-10"
                >
                    <div className="w-full max-w-md">
                        <GuestOnly>{children}</GuestOnly>
                    </div>
                </main>
            </div>
        </div>
    );
}
