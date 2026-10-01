"use client";

import { HomeIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { AuroraBackground } from "@/components/effects/aurora-background";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function ErrorPage({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    const t = useTranslations();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main
            role="alert"
            className="relative flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center overflow-hidden px-6 text-center"
        >
            <AuroraBackground intensity="subtle" />
            <div className="relative flex flex-col items-center gap-5">
                <h1 className="font-heading text-2xl font-semibold">
                    {t("errors.title")}
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                    {t("errors.generic")}
                </p>
                {error.digest ? (
                    <p className="font-mono text-xs text-muted-foreground">
                        {error.digest}
                    </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                    <Button variant="gradient" onClick={() => retry()}>
                        <RefreshCwIcon aria-hidden />
                        {t("errors.retry")}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <HomeIcon aria-hidden />
                            {t("common.goHome")}
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
