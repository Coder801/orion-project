"use client";

import { useEffect } from "react";

import en from "@/i18n/messages/en.json";
import { routing } from "@/i18n/routing";
import "./globals.css";

export default function GlobalError({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        // global-error replaces the root layout: no providers, so no locale —
        // default-language messages are imported directly.
        <html lang={routing.defaultLocale} className="dark">
            <body className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
                <h1 className="font-heading text-2xl font-semibold">
                    {en.errors.title}
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                    {en.errors.generic}
                </p>
                {error.digest ? (
                    <p className="font-mono text-xs text-muted-foreground">
                        {error.digest}
                    </p>
                ) : null}
                <button
                    type="button"
                    onClick={() => retry()}
                    className="mt-2 cursor-pointer rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
                >
                    {en.errors.retry}
                </button>
            </body>
        </html>
    );
}
