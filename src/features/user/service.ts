import {
    accountFromApi,
    mirrorUser,
    sessionFromApi,
    transactionFromApi,
} from "@/data/api/bridge";
import { apiRequest } from "@/data/api/http";
import type {
    ApiAccount,
    ApiMe,
    ApiSession,
    ApiTransaction,
    ApiUser,
} from "@/data/api/types";
import { getRepository, withLatency } from "@/data/client";
import type { Repository } from "@/data/repository";
import { DomainError } from "@/domain/errors";
import { assertKycApproved } from "@/domain/rules";
import type {
    Account,
    CurrencyCode,
    Notification,
    Session,
    Transaction,
    User,
} from "@/domain/types";

const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
    b.createdAt.localeCompare(a.createdAt);

export function requireUser(repo: Repository, userId: string): User {
    const user = repo.users.get(userId);
    if (!user) throw new DomainError("notFound");
    return user;
}

export function requireVerifiedUser(repo: Repository, userId: string): User {
    const user = requireUser(repo, userId);
    assertKycApproved(user);
    return user;
}

/**
 * Demo step-up check for money operations: a 6-digit authenticator code when
 * 2FA is on, otherwise an emailed one. Nothing is sent, so any 6 digits pass.
 */
export function assertConfirmationCode(code: string | undefined): void {
    if (!/^\d{6}$/.test(code ?? "")) throw new DomainError("invalidCode");
}

/** Profile from the API merged with the fields mock features still own. */
const merged = (user: ApiUser): User => mirrorUser(getRepository(), user);

export async function getMe(): Promise<User> {
    return merged((await apiRequest<ApiMe>("GET", "/auth/me")).user);
}

export async function listAccounts(): Promise<Account[]> {
    const accounts = await apiRequest<ApiAccount[]>("GET", "/me/accounts");
    return accounts.map(accountFromApi);
}

export async function listTransactions(limit?: number): Promise<Transaction[]> {
    const query = limit ? `?limit=${limit}` : "";
    const transactions = await apiRequest<ApiTransaction[]>(
        "GET",
        `/me/transactions${query}`,
    );
    return transactions.map(transactionFromApi);
}

export function listNotifications(userId: string): Promise<Notification[]> {
    return withLatency(() =>
        getRepository()
            .notifications.list((n) => n.userId === userId)
            .sort(byNewest),
    );
}

export function markNotificationsRead(userId: string): Promise<null> {
    return withLatency(() => {
        const repo = getRepository();
        repo.transaction(() => {
            for (const n of repo.notifications.list(
                (n) => n.userId === userId && !n.read,
            )) {
                repo.notifications.update(n.id, { read: true });
            }
        });
        return null;
    }, 100);
}

export async function setDisplayCurrency(
    currency: CurrencyCode,
): Promise<User> {
    return merged(
        await apiRequest<ApiUser>("PUT", "/me/display-currency", { currency }),
    );
}

const MAX_AVATAR_CHARS = 200_000;

/** Stores an already cropped and downscaled image (data URL); null removes it. */
export function setAvatar(
    userId: string,
    avatar: string | null,
): Promise<User> {
    return withLatency(() => {
        const repo = getRepository();
        requireUser(repo, userId);
        if (
            avatar !== null &&
            (!avatar.startsWith("data:image/") ||
                avatar.length > MAX_AVATAR_CHARS)
        ) {
            throw new DomainError("invariant", "invalid avatar");
        }
        return repo.users.update(userId, { avatar: avatar ?? undefined });
    });
}

/** Turns 2FA on or off; both directions need a current code. */
export async function setTwoFactor(input: {
    enabled: boolean;
    code: string;
}): Promise<User> {
    return merged(await apiRequest<ApiUser>("PUT", "/me/two-factor", input));
}

export async function listSessions(): Promise<Session[]> {
    const sessions = await apiRequest<ApiSession[]>("GET", "/me/sessions");
    return sessions.map(sessionFromApi);
}

export function revokeSession(sessionId: string): Promise<null> {
    return apiRequest<null>(
        "DELETE",
        `/me/sessions/${encodeURIComponent(sessionId)}`,
    );
}

/** The API signs out every other session after a successful change. */
export function changePassword(input: {
    currentPassword: string;
    newPassword: string;
}): Promise<null> {
    return apiRequest<null>("POST", "/me/password", input);
}

export { byNewest };
