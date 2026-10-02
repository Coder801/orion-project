import { z } from "zod";
import type { SessionUser } from "@/types";

// The mock session lives in a cookie so the server renders the right user on
// first paint, and the proxy can guard /app routes.
export const SESSION_COOKIE = "orion-session";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(["user", "admin"]),
    sessionId: z.string().optional(),
}) satisfies z.ZodType<SessionUser>;

export function parseSessionCookie(
    value: string | undefined,
): SessionUser | null {
    if (!value) return null;
    for (const candidate of [value, safeDecode(value)]) {
        try {
            const result = userSchema.safeParse(JSON.parse(candidate));
            if (result.success) return result.data;
        } catch {
            // Try the next candidate.
        }
    }
    return null;
}

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function writeCookie(name: string, value: string | null): void {
    const attributes = "path=/; SameSite=Lax";
    document.cookie =
        value === null
            ? `${name}=; ${attributes}; max-age=0`
            : `${name}=${encodeURIComponent(value)}; ${attributes}; max-age=${ONE_YEAR_SECONDS}`;
}

export function saveSession(user: SessionUser | null): void {
    writeCookie(SESSION_COOKIE, user ? JSON.stringify(user) : null);
}
