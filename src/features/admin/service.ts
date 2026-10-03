import {
    accountFromApi,
    assertMoneyMovementOpen,
    transactionFromApi,
    userFromApi,
} from "@/data/api/bridge";
import { apiRequest } from "@/data/api/http";
import type {
    ApiAccount,
    ApiAdminUser,
    ApiTransaction,
} from "@/data/api/types";
import { getRepository, resetDemoData, withLatency } from "@/data/client";
import type { Repository } from "@/data/repository";
import type { ReviewInput } from "@/domain/audit";
import { DomainError } from "@/domain/errors";
import { applyRequest } from "@/domain/ledger";
import { parseDecimal } from "@/domain/money";
import { reviewCredit, reviewKyc } from "@/domain/review";
import type {
    Account,
    AnyRequest,
    CurrencyCode,
    Minor,
    CreditApplication,
    KycSubmission,
    PlatformSettings,
    Transaction,
    User,
} from "@/domain/types";
import { byNewest } from "@/features/user/service";

function assertAdmin(repo: Repository, adminId: string): void {
    if (repo.users.get(adminId)?.role !== "admin")
        throw new DomainError("forbidden");
}

/** Runs an admin-only read or command with simulated latency. */
function asAdmin<T>(
    adminId: string,
    work: (repo: Repository) => T,
): Promise<T> {
    return withLatency(() => {
        const repo = getRepository();
        assertAdmin(repo, adminId);
        return work(repo);
    });
}

// ─── Users (orion-bank-api; the admin's cookie authorizes, ids scope the cache) ─

const userPath = (userId: string) =>
    `/admin/users/${encodeURIComponent(userId)}`;

export async function listUsers(): Promise<User[]> {
    const users = await apiRequest<ApiAdminUser[]>("GET", "/admin/users");
    return users.map(userFromApi);
}

export interface UserScope {
    adminId: string;
    userId: string;
}

export async function getUser({ userId }: UserScope): Promise<User> {
    return userFromApi(await apiRequest<ApiAdminUser>("GET", userPath(userId)));
}

export async function listUserAccounts({
    userId,
}: UserScope): Promise<Account[]> {
    const accounts = await apiRequest<ApiAccount[]>(
        "GET",
        `${userPath(userId)}/accounts`,
    );
    return accounts.map(accountFromApi);
}

export async function listUserTransactions({
    userId,
}: UserScope): Promise<Transaction[]> {
    const transactions = await apiRequest<ApiTransaction[]>(
        "GET",
        `${userPath(userId)}/transactions`,
    );
    return transactions.map(transactionFromApi);
}

export interface AdjustmentInput {
    adminId: string;
    userId: string;
    currency: CurrencyCode;
    /** Signed minor units: positive credits the account, negative debits available funds. */
    amount: Minor;
    reason: string;
}

/** Manual credit/debit; the API writes the transaction, notification and audit entry. */
export async function adjustUserBalance({
    userId,
    currency,
    amount,
    reason,
}: AdjustmentInput): Promise<Transaction> {
    return transactionFromApi(
        await apiRequest<ApiTransaction>(
            "POST",
            `${userPath(userId)}/adjustments`,
            { currency, amount, reason: reason.trim() },
        ),
    );
}

// ─── Review queues (mock) ───────────────────────────────────────────────────

export const listKycSubmissions = (adminId: string): Promise<KycSubmission[]> =>
    asAdmin(adminId, (repo) => repo.kyc.list().sort(byNewest));

export const listRequests = (adminId: string): Promise<AnyRequest[]> =>
    asAdmin(adminId, (repo) => repo.requests.list().sort(byNewest));

export const listCreditApplications = (
    adminId: string,
): Promise<CreditApplication[]> =>
    asAdmin(adminId, (repo) => repo.credits.list().sort(byNewest));

export const reviewRequestAsAdmin = (input: ReviewInput) =>
    asAdmin(input.adminId, (repo) => {
        assertMoneyMovementOpen();
        return applyRequest(repo, input).request;
    });

export const reviewKycAsAdmin = (input: ReviewInput) =>
    asAdmin(input.adminId, (repo) => reviewKyc(repo, input).item);

export const reviewCreditAsAdmin = (input: ReviewInput) =>
    asAdmin(input.adminId, (repo) => reviewCredit(repo, input).item);

export function updatePlatformSettings(
    adminId: string,
    patch: Partial<PlatformSettings>,
): Promise<PlatformSettings> {
    return asAdmin(adminId, (repo) => {
        for (const price of Object.values(patch.usdPrices ?? {})) {
            if (parseDecimal(price).int <= 0n)
                throw new DomainError("invalidAmount");
        }
        return repo.settings.update(patch);
    });
}

export function resetDemo(adminId: string): Promise<null> {
    return asAdmin(adminId, () => {
        resetDemoData();
        return null;
    });
}
