import { getRatesProvider, getRepository, withLatency } from "@/data/client";
import type { Repository } from "@/data/repository";
import { DomainError } from "@/domain/errors";
import { submitRequest } from "@/domain/ledger";
import { decimalToMinor, feeFromBps, ZERO } from "@/domain/money";
import type { Quote } from "@/domain/rates";
import { requireEnabledCurrency } from "@/domain/rules";
import type {
    AnyRequest,
    CurrencyCode,
    DecimalString,
    MethodKind,
} from "@/domain/types";
import { requireVerifiedUser } from "@/features/user/service";

export interface MovementInput {
    userId: string;
    methodId: string;
    accountId: string;
    amount: DecimalString;
    fields: Record<string, string>;
}

function requireMethod(
    repo: Repository,
    id: string,
    kind: MethodKind,
    currency: CurrencyCode,
) {
    const method = repo.settings.get().methods.find((m) => m.id === id);
    if (
        !method?.enabled ||
        method.kind !== kind ||
        !method.currencies.includes(currency)
    ) {
        throw new DomainError("methodUnavailable");
    }
    return method;
}

function requireOwnAccount(
    repo: Repository,
    userId: string,
    accountId: string,
) {
    const account = repo.accounts.get(accountId);
    if (!account || account.userId !== userId)
        throw new DomainError("notFound");
    return account;
}

function createMovement(
    kind: MethodKind,
    input: MovementInput,
): Promise<AnyRequest> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        const account = requireOwnAccount(repo, input.userId, input.accountId);
        const currency = requireEnabledCurrency(
            repo.settings.get(),
            account.currency,
        );
        const method = requireMethod(repo, input.methodId, kind, currency.code);
        const amount = decimalToMinor(input.amount, currency.decimals);
        const fee =
            kind === "withdrawal"
                ? feeFromBps(amount, repo.settings.get().fees.withdrawalBps)
                : ZERO;
        const fields = Object.fromEntries(
            method.fields.map((field) => [
                field.name,
                input.fields[field.name]?.trim() ?? "",
            ]),
        );

        return submitRequest(repo, {
            kind,
            userId: input.userId,
            method: method.id,
            payload: {
                accountId: account.id,
                currency: currency.code,
                amount,
                fee,
                fields,
            },
        });
    });
}

export const createDeposit = (input: MovementInput) =>
    createMovement("deposit", input);
export const createWithdrawal = (input: MovementInput) =>
    createMovement("withdrawal", input);

export interface TransferInput {
    userId: string;
    fromAccountId: string;
    amount: DecimalString;
    target:
        { kind: "own"; accountId: string } | { kind: "user"; email: string };
}

export function createTransfer(input: TransferInput): Promise<AnyRequest> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        const account = requireOwnAccount(
            repo,
            input.userId,
            input.fromAccountId,
        );
        const currency = requireEnabledCurrency(
            repo.settings.get(),
            account.currency,
        );
        const amount = decimalToMinor(input.amount, currency.decimals);

        let target;
        if (input.target.kind === "own") {
            target = input.target;
        } else {
            const email = input.target.email.trim().toLowerCase();
            const recipient = repo.users.list(
                (u) => u.email === email && u.role === "user",
            )[0];
            if (!recipient) throw new DomainError("recipientNotFound");
            target = { kind: "user" as const, email, userId: recipient.id };
        }

        return submitRequest(repo, {
            kind: "transfer",
            userId: input.userId,
            method: target.kind === "own" ? "internal-own" : "internal-user",
            payload: {
                fromAccountId: account.id,
                currency: currency.code,
                amount,
                fee: feeFromBps(amount, repo.settings.get().fees.transferBps),
                target,
            },
        });
    });
}

export interface ConvertInput {
    userId: string;
    fromAccountId: string;
    to: CurrencyCode;
    amount: DecimalString;
}

function buildQuote(
    repo: Repository,
    input: Omit<ConvertInput, "userId"> & { userId?: string },
) {
    const account = repo.accounts.get(input.fromAccountId);
    if (!account || (input.userId && account.userId !== input.userId)) {
        throw new DomainError("notFound");
    }
    const settings = repo.settings.get();
    const from = requireEnabledCurrency(settings, account.currency);
    requireEnabledCurrency(settings, input.to);
    const amount = decimalToMinor(input.amount, from.decimals);
    return {
        account,
        quote: getRatesProvider().quote(from.code, input.to, amount),
    };
}

export function getQuote(input: Omit<ConvertInput, "userId">): Promise<Quote> {
    return withLatency(() => buildQuote(getRepository(), input).quote, 200);
}

export function createConversion(input: ConvertInput): Promise<AnyRequest> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        const { account, quote } = buildQuote(repo, input);
        return submitRequest(repo, {
            kind: "conversion",
            userId: input.userId,
            method: "rates",
            payload: {
                fromAccountId: account.id,
                from: quote.from,
                to: quote.to,
                amount: quote.amount,
                fee: quote.fee,
                rate: quote.rate,
                toAmount: quote.toAmount,
            },
        });
    });
}

export function listUserRequests(userId: string): Promise<AnyRequest[]> {
    return withLatency(() =>
        getRepository()
            .requests.list((r) => r.userId === userId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
}
