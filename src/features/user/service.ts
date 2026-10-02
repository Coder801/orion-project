import { DISPLAY_CURRENCIES } from "@/config/currencies";
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

export function getMe(userId: string): Promise<User> {
    return withLatency(() => requireUser(getRepository(), userId), 150);
}

export function listAccounts(userId: string): Promise<Account[]> {
    return withLatency(() =>
        getRepository().accounts.list((a) => a.userId === userId),
    );
}

export function listTransactions(
    userId: string,
    limit?: number,
): Promise<Transaction[]> {
    return withLatency(() => {
        const all = getRepository()
            .transactions.list((tx) => tx.userId === userId)
            .sort(byNewest);
        return limit ? all.slice(0, limit) : all;
    });
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

export function setDisplayCurrency(
    userId: string,
    currency: CurrencyCode,
): Promise<User> {
    return withLatency(() => {
        const repo = getRepository();
        requireUser(repo, userId);
        if (!(DISPLAY_CURRENCIES as readonly string[]).includes(currency))
            throw new DomainError("currencyDisabled");
        return repo.users.update(userId, { displayCurrency: currency });
    });
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
export function setTwoFactor(
    userId: string,
    input: { enabled: boolean; code: string },
): Promise<User> {
    return withLatency(() => {
        const repo = getRepository();
        requireUser(repo, userId);
        assertConfirmationCode(input.code);
        return repo.users.update(userId, { twoFactorEnabled: input.enabled });
    });
}

export function listSessions(userId: string): Promise<Session[]> {
    return withLatency(() =>
        getRepository()
            .sessions.list((s) => s.userId === userId && !s.revokedAt)
            .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt)),
    );
}

export function createSession(repo: Repository, userId: string): Session {
    const now = repo.now();
    return repo.sessions.insert({
        id: repo.nextId("ses"),
        userId,
        device: "Browser · Current device",
        createdAt: now,
        lastActiveAt: now,
    });
}

export function revokeSession(
    userId: string,
    sessionId: string,
): Promise<null> {
    return withLatency(() => {
        const repo = getRepository();
        const session = repo.sessions.get(sessionId);
        if (!session || session.userId !== userId)
            throw new DomainError("notFound");
        if (!session.revokedAt)
            repo.sessions.update(sessionId, { revokedAt: repo.now() });
        return null;
    }, 150);
}

/**
 * Demo only: passwords are never stored. A successful change signs out every
 * other session, as a real backend would.
 */
export function changePassword(
    userId: string,
    currentSessionId: string | undefined,
): Promise<null> {
    return withLatency(() => {
        const repo = getRepository();
        requireUser(repo, userId);
        repo.transaction(() => {
            for (const s of repo.sessions.list(
                (s) =>
                    s.userId === userId &&
                    !s.revokedAt &&
                    s.id !== currentSessionId,
            )) {
                repo.sessions.update(s.id, { revokedAt: repo.now() });
            }
        });
        return null;
    });
}

export { byNewest };
