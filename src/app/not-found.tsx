import Link from "next/link";

import en from "@/i18n/messages/en.json";
import { routing } from "@/i18n/routing";
import "./globals.css";

// Only reached for URLs the proxy does not localize (e.g. unknown files), so
// there is no locale context — fall back to the default-language messages.
export default function GlobalNotFound() {
    return (
        <html lang={routing.defaultLocale} className="dark">
            <body className="grid min-h-screen place-items-center p-6 text-center">
                <main>
                    <p className="text-gradient font-heading text-7xl font-bold">
                        404
                    </p>
                    <h1 className="mt-4 font-heading text-2xl font-semibold">
                        {en.errors.notFoundTitle}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {en.errors.notFoundText}
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        {en.common.goHome}
                    </Link>
                </main>
            </body>
        </html>
    );
}
