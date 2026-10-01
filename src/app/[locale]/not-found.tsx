import { HomeIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
    AuroraBackground,
    GlowSpot,
} from "@/components/effects/AuroraBackground";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
    const t = useTranslations();

    return (
        <main className="relative flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
            <AuroraBackground intensity="strong" />
            <div
                aria-hidden
                className="absolute inset-0 bg-grid mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"
            />
            <GlowSpot color="primary" className="-top-40 left-1/4" />
            <GlowSpot color="pink" className="-right-40 bottom-0 opacity-60" />

            <div className="relative flex flex-col items-center">
                <div className="relative animate-float select-none" aria-hidden>
                    <span className="absolute inset-0 text-gradient font-heading text-[8rem] leading-none font-bold tracking-tight opacity-50 blur-2xl sm:text-[12rem]">
                        404
                    </span>
                    <span className="relative text-gradient font-heading text-[8rem] leading-none font-bold tracking-tight sm:text-[12rem]">
                        404
                    </span>
                </div>

                <h1 className="mt-8 font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                    {t("errors.notFoundTitle")}
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t("errors.notFoundText")}
                </p>

                <Button asChild size="lg" variant="gradient" className="mt-9">
                    <Link href="/">
                        <HomeIcon aria-hidden />
                        {t("common.goHome")}
                    </Link>
                </Button>
            </div>
        </main>
    );
}
