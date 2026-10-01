import type { Metadata } from "next";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PageHeader } from "@/components/layout/PageHeader";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { routing } from "@/i18n/routing";
import { UiKitShowcase } from "./UiKitShowcase";

export async function generateMetadata({
    params,
}: PageProps<"/[locale]/ui-kit">): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale: hasLocale(routing.locales, locale)
            ? locale
            : routing.defaultLocale,
        namespace: "uiKit",
    });
    return { title: t("title"), robots: { index: false } };
}

export default function UiKitPage() {
    const t = useTranslations("uiKit");

    return (
        <div className="min-h-screen">
            <header className="sticky top-8 z-30 border-b bg-background/70 backdrop-blur-xl">
                <div className="container-wide flex h-16 items-center gap-3">
                    <Logo />
                    <div className="ml-auto flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main id="main" className="container-wide py-10">
                <PageHeader title={t("title")} description={t("description")} />
                <UiKitShowcase />
            </main>
        </div>
    );
}
