import type { Role } from "@/domain/types";

export const ROUTES = {
    home: "/",
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
    dashboard: "/app/dashboard",
    transactions: "/app/transactions",
    deposit: "/app/deposit",
    withdraw: "/app/withdraw",
    transfer: "/app/transfer",
    cards: "/app/cards",
    support: "/app/support",
    settings: "/app/settings",
    verification: "/app/verification",
    adminUsers: "/admin/users",
    adminHome: "/admin/users",
} as const;

export const adminUserRoute = (userId: string) =>
    `${ROUTES.adminUsers}/${encodeURIComponent(userId)}`;

export function homeFor(role: Role): string {
    return role === "admin" ? ROUTES.adminHome : ROUTES.dashboard;
}

export type Area = "public" | "auth" | "app" | "admin";

/** Locale-less pathname → protected area it belongs to. */
export function areaOf(pathname: string): Area {
    const segment = pathname.split("/")[1];
    return segment === "app" || segment === "admin" || segment === "auth"
        ? segment
        : "public";
}

/**
 * Where a visitor must be sent instead of `pathname`, or null to let them through.
 * Shared by the proxy (server) and the client guards so both agree.
 */
export function redirectFor(
    pathname: string,
    role: Role | null,
): string | null {
    const area = areaOf(pathname);
    if (area === "auth") return role ? homeFor(role) : null;
    if (area === "app" || area === "admin") {
        if (!role)
            return `${ROUTES.signIn}?next=${encodeURIComponent(pathname)}`;
        if (area === "admin" && role !== "admin") return ROUTES.dashboard;
        if (area === "app" && role === "admin") return ROUTES.adminHome;
    }
    return null;
}

/** Transaction history focused on the entries of one request. */
export function transactionsFor(requestId: string): string {
    return `${ROUTES.transactions}?request=${encodeURIComponent(requestId)}`;
}
