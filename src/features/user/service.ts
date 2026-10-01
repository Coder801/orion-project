import { getRepository, withLatency } from "@/data/client";
import type { Repository } from "@/data/repository";
import { DomainError } from "@/domain/errors";
import { assertKycApproved } from "@/domain/rules";
import type { Account, Notification, Transaction, User } from "@/domain/types";

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

export function updateProfile(
    userId: string,
    input: { name: string },
): Promise<User> {
    return withLatency(() => {
        const repo = getRepository();
        requireUser(repo, userId);
        return repo.users.update(userId, { name: input.name.trim() });
    });
}

/** Demo only: the form is validated, nothing is stored. */
export function changePassword(): Promise<null> {
    return withLatency(() => null);
}

export { byNewest };
