import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";

import { AppReadyProvider } from "@/components/AppReady";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { PageLoader } from "@/components/site/PageLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/Sonner";
import { getServerSessionUser } from "@/features/auth/server";
import { routing } from "@/i18n/routing";
import { initialAuthState } from "@/store/authSlice";
import { StoreProvider } from "@/store/StoreProvider";
import "../globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "cyrillic"],
    display: "swap",
});

// No Cyrillic subset: Russian headings fall back to Inter via --font-heading.
const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin", "cyrillic"],
    display: "swap",
});

export async function generateMetadata({
    params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale: hasLocale(routing.locales, locale)
            ? locale
            : routing.defaultLocale,
    });
    return {
        title: {
            default: t("common.appName"),
            template: `%s · ${t("common.appName")}`,
        },
        description: t("meta.description"),
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#050816" },
        { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
    ],
};

export default async function LocaleLayout({
    children,
    params,
}: LayoutProps<"/[locale]">) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);

    const user = await getServerSessionUser();

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            data-scroll-behavior="smooth"
            className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col font-sans">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NextIntlClientProvider>
                        <StoreProvider
                            preloadedState={{
                                auth: { ...initialAuthState, user },
                            }}
                        >
                            <AppReadyProvider>
                                <DemoBanner />
                                {children}
                            </AppReadyProvider>
                        </StoreProvider>
                    </NextIntlClientProvider>
                    <Toaster />
                </ThemeProvider>
                <PageLoader />
            </body>
        </html>
    );
}
