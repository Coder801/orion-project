import { cookies } from "next/headers";
import { API_PREFIX, apiOrigin, SESSION_COOKIE } from "@/data/api/origin";
import type { ApiMe } from "@/data/api/types";
import { toSession } from "@/features/auth/service";
import type { SessionUser } from "@/types";

/**
 * Server-only (uses `next/headers`). Session user for the first render: asks
 * the API who owns the cookie. Any failure (no cookie, expired session, API
 * down) renders a guest.
 */
export async function getServerSessionUser(): Promise<SessionUser | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    try {
        const response = await fetch(`${apiOrigin()}${API_PREFIX}/auth/me`, {
            headers: { cookie: `${SESSION_COOKIE}=${token}` },
            cache: "no-store",
        });
        if (!response.ok) return null;
        return toSession((await response.json()) as ApiMe);
    } catch {
        return null;
    }
}
