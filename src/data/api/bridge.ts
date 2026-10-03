import type {
    ApiAccount,
    ApiSession,
    ApiTransaction,
    ApiUser,
} from "@/data/api/types";
import type { Repository } from "@/data/repository";
import { DomainError } from "@/domain/errors";
import { ensureAccount } from "@/domain/ledger";
import type { Account, Session, Transaction, User } from "@/domain/types";

// Transitional: auth, profile, accounts and transactions come from
// orion-bank-api, while requests, KYC and card features still run on the
// in-browser mock repository. Both use the same user ids, so an API user is
// mirrored into the mock DB on first sight.

/** Fields still owned by mock-backed features; the API's copy is ignored. */
type MockOwned = Pick<User, "kycStatus" | "cardPlan" | "avatar">;

export function userFromApi(user: ApiUser): User {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        phone: user.phone ?? undefined,
        country: user.country ?? undefined,
        displayCurrency: user.displayCurrency,
        twoFactorEnabled: user.twoFactorEnabled,
        cardPlan: user.cardPlan,
    };
}

/**
 * Inserts an unknown API user into the mock DB (with fiat accounts for wallet
 * users) and refreshes the profile fields of a known one.
 */
export function mirrorUser(repo: Repository, user: ApiUser): User {
    const remote = userFromApi(user);
    return repo.transaction(() => {
        const local = repo.users.get(user.id);
        if (local) {
            const owned: MockOwned = {
                kycStatus: local.kycStatus,
                cardPlan: local.cardPlan,
                avatar: local.avatar,
            };
            return repo.users.update(user.id, { ...remote, ...owned });
        }
        const created = repo.users.insert(remote);
        if (created.role === "user") {
            for (const currency of repo.settings.get().currencies) {
                if (currency.enabled && currency.type === "fiat")
                    ensureAccount(repo, created.id, currency.code);
            }
        }
        return created;
    });
}

export function sessionFromApi(session: ApiSession): Session {
    return {
        id: session.id,
        userId: session.userId,
        device: session.device,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
    };
}

export const accountFromApi = ({
    id,
    userId,
    currency,
    balance,
    hold,
}: ApiAccount): Account => ({ id, userId, currency, balance, hold });

export const transactionFromApi = (tx: ApiTransaction): Transaction => ({
    id: tx.id,
    userId: tx.userId,
    accountId: tx.accountId,
    type: tx.type,
    amount: tx.amount,
    currency: tx.currency,
    status: tx.status,
    method: tx.method ?? undefined,
    requestId: tx.requestId ?? undefined,
    createdAt: tx.createdAt,
});

/**
 * Requests move balances, and balances now live in the API: until the ledger
 * moves there too, creating or approving requests is paused.
 */
export function assertMoneyMovementOpen(): void {
    throw new DomainError("moneyMovementPaused");
}
