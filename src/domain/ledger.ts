import type { Repository } from "@/data/repository";
import {
    normalizeReason,
    recordStatusChange,
    type ReviewInput,
} from "@/domain/audit";
import { DomainError } from "@/domain/errors";
import {
    addMinor,
    cmpMinor,
    isPositive,
    negMinor,
    subMinor,
    ZERO,
} from "@/domain/money";
import { debitOf, hasAvailable, isDebitRequest } from "@/domain/rules";
import type {
    Account,
    AnyRequest,
    CurrencyCode,
    Minor,
    RequestKind,
    RequestPayloadByKind,
    TransactionType,
} from "@/domain/types";

export type NewRequest = {
    [K in RequestKind]: {
        kind: K;
        userId: string;
        method: string;
        payload: RequestPayloadByKind[K];
    };
}[RequestKind];

const TRANSACTION_TYPE: Record<RequestKind, TransactionType> = {
    deposit: "deposit",
    withdrawal: "withdrawal",
    transfer: "transfer",
    conversion: "conversion",
    card: "card",
};

function ownAccount(
    repo: Repository,
    accountId: string,
    userId: string,
): Account {
    const account = repo.accounts.get(accountId);
    if (!account || account.userId !== userId)
        throw new DomainError("notFound");
    return account;
}

export function ensureAccount(
    repo: Repository,
    userId: string,
    currency: CurrencyCode,
): Account {
    const existing = repo.accounts.list(
        (a) => a.userId === userId && a.currency === currency,
    )[0];
    if (existing) return existing;
    return repo.accounts.insert({
        id: repo.nextId("acc"),
        userId,
        currency,
        balance: ZERO,
        hold: ZERO,
    });
}

function sourceCurrency(draft: NewRequest): CurrencyCode {
    return draft.kind === "conversion"
        ? draft.payload.from
        : draft.payload.currency;
}

function validateTransferTarget(
    repo: Repository,
    draft: NewRequest & { kind: "transfer" },
) {
    const { target, fromAccountId, currency } = draft.payload;
    if (target.kind === "external") {
        if (!target.beneficiary.name.trim())
            throw new DomainError("invalidDetails");
        return;
    }
    if (target.kind === "own") {
        if (target.accountId === fromAccountId)
            throw new DomainError("sameAccount");
        const account = ownAccount(repo, target.accountId, draft.userId);
        if (account.currency !== currency)
            throw new DomainError("currencyMismatch");
        return;
    }
    const recipient = repo.users.get(target.userId);
    if (!recipient || recipient.role !== "user")
        throw new DomainError("recipientNotFound");
    if (recipient.id === draft.userId) throw new DomainError("recipientSelf");
}

/**
 * Registers a request. Debit requests move `amount + fee` to the account's hold
 * so the funds can't be spent twice while the request waits for review.
 */
export function submitRequest(repo: Repository, draft: NewRequest): AnyRequest {
    return repo.transaction(() => {
        if (!isPositive(draft.payload.amount))
            throw new DomainError("invalidAmount");
        if (draft.kind === "transfer") validateTransferTarget(repo, draft);
        if (
            draft.kind === "conversion" &&
            draft.payload.from === draft.payload.to
        ) {
            throw new DomainError("sameCurrency");
        }

        const request = {
            ...draft,
            id: repo.nextId("req"),
            status: "pending",
            createdAt: repo.now(),
        } as AnyRequest;

        let accountId: string;
        let txAmount: Minor;
        if (isDebitRequest(request)) {
            const debit = debitOf(request);
            const account = ownAccount(repo, debit.accountId, request.userId);
            if (account.currency !== sourceCurrency(draft))
                throw new DomainError("currencyMismatch");
            if (!hasAvailable(account, debit.total))
                throw new DomainError("insufficientFunds");
            repo.accounts.update(account.id, {
                hold: addMinor(account.hold, debit.total),
            });
            accountId = account.id;
            txAmount = negMinor(debit.total);
        } else {
            const account = ownAccount(
                repo,
                request.payload.accountId,
                request.userId,
            );
            if (account.currency !== request.payload.currency)
                throw new DomainError("currencyMismatch");
            accountId = account.id;
            txAmount = request.payload.amount;
        }

        repo.requests.insert(request);
        repo.transactions.insert({
            id: repo.nextId("txn"),
            userId: request.userId,
            accountId,
            type: TRANSACTION_TYPE[request.kind],
            amount: txAmount,
            currency: sourceCurrency(draft),
            status: "pending",
            method: request.method,
            requestId: request.id,
            createdAt: request.createdAt,
        });
        return request;
    });
}

function releaseHold(
    repo: Repository,
    accountId: string,
    total: Minor,
): Account {
    const account = repo.accounts.get(accountId);
    if (!account)
        throw new DomainError("invariant", `account ${accountId} missing`);
    const hold = subMinor(account.hold, total);
    if (cmpMinor(hold, ZERO) < 0)
        throw new DomainError("invariant", "hold below zero");
    return repo.accounts.update(account.id, { hold });
}

function settleDebit(repo: Repository, accountId: string, total: Minor): void {
    const account = releaseHold(repo, accountId, total);
    const balance = subMinor(account.balance, total);
    if (cmpMinor(balance, ZERO) < 0)
        throw new DomainError("invariant", "balance below zero");
    repo.accounts.update(account.id, { balance });
}

function credit(
    repo: Repository,
    account: Account,
    amount: Minor,
    meta: { type: TransactionType; method: string; requestId: string },
): void {
    repo.accounts.update(account.id, {
        balance: addMinor(account.balance, amount),
    });
    repo.transactions.insert({
        id: repo.nextId("txn"),
        userId: account.userId,
        accountId: account.id,
        type: meta.type,
        amount,
        currency: account.currency,
        status: "completed",
        method: meta.method,
        requestId: meta.requestId,
        createdAt: repo.now(),
    });
}

function approve(repo: Repository, request: AnyRequest): void {
    switch (request.kind) {
        case "deposit": {
            const account = ownAccount(
                repo,
                request.payload.accountId,
                request.userId,
            );
            repo.accounts.update(account.id, {
                balance: addMinor(account.balance, request.payload.amount),
            });
            return;
        }
        case "withdrawal":
            settleDebit(
                repo,
                request.payload.accountId,
                debitOf(request).total,
            );
            return;
        case "transfer": {
            const { payload } = request;
            settleDebit(repo, payload.fromAccountId, debitOf(request).total);
            // External rails: the money leaves the platform, nothing to credit.
            if (payload.target.kind === "external") return;
            const target =
                payload.target.kind === "own"
                    ? ownAccount(repo, payload.target.accountId, request.userId)
                    : ensureAccount(
                          repo,
                          payload.target.userId,
                          payload.currency,
                      );
            credit(repo, target, payload.amount, {
                type: "transfer",
                method: request.method,
                requestId: request.id,
            });
            return;
        }
        case "conversion": {
            const { payload } = request;
            settleDebit(repo, payload.fromAccountId, debitOf(request).total);
            const target = ensureAccount(repo, request.userId, payload.to);
            credit(repo, target, payload.toAmount, {
                type: "conversion",
                method: request.method,
                requestId: request.id,
            });
            return;
        }
        case "card": {
            const { payload } = request;
            settleDebit(repo, payload.accountId, debitOf(request).total);
            if (payload.product.kind === "plan")
                repo.users.update(request.userId, {
                    cardPlan: payload.product.plan,
                });
            return;
        }
    }
}

export interface ApplyResult {
    request: AnyRequest;
    /** False when the request had already been reviewed (idempotent no-op). */
    applied: boolean;
}

/**
 * The only place where balances change. Runs atomically and is idempotent:
 * re-applying a reviewed request returns it unchanged.
 */
export function applyRequest(
    repo: Repository,
    input: ReviewInput,
): ApplyResult {
    return repo.transaction(() => {
        const request = repo.requests.get(input.id);
        if (!request) throw new DomainError("notFound");
        if (request.status !== "pending") return { request, applied: false };
        const reason = normalizeReason(input.decision, input.reason);

        if (input.decision === "approved") approve(repo, request);
        else if (isDebitRequest(request))
            releaseHold(
                repo,
                debitOf(request).accountId,
                debitOf(request).total,
            );

        const pendingTx = repo.transactions.list(
            (tx) => tx.requestId === request.id && tx.status === "pending",
        );
        for (const tx of pendingTx) {
            repo.transactions.update(tx.id, {
                status: input.decision === "approved" ? "completed" : "failed",
            });
        }

        const reviewed = repo.requests.update(request.id, {
            status: input.decision,
            reviewedBy: input.adminId,
            reason,
            reviewedAt: repo.now(),
        });
        recordStatusChange(repo, {
            actorId: input.adminId,
            userId: request.userId,
            entity: "request",
            entityId: request.id,
            subject: request.kind,
            from: "pending",
            to: input.decision,
            reason,
        });
        return { request: reviewed, applied: true };
    });
}
