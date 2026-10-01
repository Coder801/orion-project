import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { redirectFor } from "@/config/routes";
import { routing } from "@/i18n/routing";
import { parseSessionCookie, SESSION_COOKIE } from "@/store/persistence";

const intl = createMiddleware(routing);

// Optimistic guard from the demo session cookie; <RequireAuth>/<RequireRole>
// repeat the check on the client after sign-in/out without a reload.
export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const [, locale, ...rest] = pathname.split("/");

    if (hasLocale(routing.locales, locale)) {
        const session = parseSessionCookie(
            request.cookies.get(SESSION_COOKIE)?.value,
        );
        const target = redirectFor(`/${rest.join("/")}`, session?.role ?? null);
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
