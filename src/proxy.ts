import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { areaOf, redirectFor } from "@/config/routes";
import { SESSION_COOKIE } from "@/data/api/origin";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);

// Optimistic guard: without the API session cookie, protected areas go to
// sign-in. Roles are only known after `/auth/me`, so <RequireAuth>/<RequireRole>
// (fed by the root layout) do the role checks.
export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const [, locale, ...rest] = pathname.split("/");

    if (hasLocale(routing.locales, locale)) {
        const path = `/${rest.join("/")}`;
        const area = areaOf(path);
        const signedIn = request.cookies.has(SESSION_COOKIE);
        const target =
            !signedIn && (area === "app" || area === "admin")
                ? redirectFor(path, null)
                : null;
        if (target)
            return NextResponse.redirect(
                new URL(`/${locale}${target}`, request.url),
            );
    }

    return intl(request);
}

export const config = {
    // Everything except API routes, Next internals and files with an extension.
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
