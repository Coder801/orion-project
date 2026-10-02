import {
    QUOTE_TTL_MS,
    NETWORK_CONFIRMATIONS,
    NETWORKS_BY_CURRENCY,
    type Network,
} from "@/config/currencies";
import { DEPOSIT_FLOW } from "@/config/methods";
import { getRatesProvider, getRepository, withLatency } from "@/data/client";
import type { Repository } from "@/data/repository";
import { DomainError } from "@/domain/errors";
import { ensureAccount, submitRequest } from "@/domain/ledger";
import { cmpMinor, decimalToMinor, feeFromBps, ZERO } from "@/domain/money";
import type { LockedQuote, RatesSnapshot } from "@/domain/rates";
import { railSupports, requireEnabledCurrency } from "@/domain/rules";
import type {
    AmountLimits,
    AnyRequest,
    Beneficiary,
    BeneficiaryDetails,
    Currency,
    CurrencyCode,
    DecimalString,
    MethodKind,
    Minor,
    PlatformSettings,
    TransferRail,
    TransferTarget,
} from "@/domain/types";
import {
    depositAddressFor,
    depositBankDetailsFor,
    depositReferenceFor,
} from "@/features/accounts/identifiers";
import {
    isValidBic,
    isValidCardNumber,
    isValidIban,
} from "@/features/payments/fieldSchema";
import {
    assertConfirmationCode,
    byNewest,
    requireVerifiedUser,
} from "@/features/user/service";

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

export function limitsFor(
    settings: PlatformSettings,
    currency: Currency,
): { min: Minor; max: Minor } | null {
    const limits: AmountLimits | undefined = settings.limits[currency.code];
    if (!limits) return null;
    return {
        min: decimalToMinor(limits.min, currency.decimals),
        max: decimalToMinor(limits.max, currency.decimals),
    };
}

function assertWithinLimits(
    settings: PlatformSettings,
    currency: Currency,
    amount: Minor,
): void {
    const limits = limitsFor(settings, currency);
    if (
        limits &&
        (cmpMinor(amount, limits.min) < 0 || cmpMinor(amount, limits.max) > 0)
    ) {
        throw new DomainError("amountOutOfRange");
    }
}

function requireNetwork(currency: CurrencyCode, network: string): Network {
    const networks = NETWORKS_BY_CURRENCY[currency] ?? [];
    if (!(networks as string[]).includes(network))
        throw new DomainError("methodUnavailable");
    return network as Network;
}

/** Demo stand-in for a card provider's tokenization: only a token + last 4 survive. */
function tokenizeCard(cardNumber: string) {
    const digits = cardNumber.replace(/[\s-]/g, "");
    if (!isValidCardNumber(digits)) throw new DomainError("invalidDetails");
    return {
        cardToken: `tok_demo_${Math.random().toString(36).slice(2, 12)}`,
        cardLast4: digits.slice(-4),
    };
}

// ─── Deposits ───────────────────────────────────────────────────────────────

export type DepositInstructions =
    | {
          flow: "instructions";
          beneficiary: string;
          accountNumber: string;
          bankCode: string;
          reference: string;
      }
    | { flow: "checkout" }
    | {
          flow: "address";
          network: Network;
          address: string;
          confirmations: number;
      };

export interface DepositInstructionsInput {
    userId: string;
    methodId: string;
    currency: CurrencyCode;
    network?: string;
}

/** What the user needs to complete a deposit with the chosen method. */
export function getDepositInstructions(
    input: DepositInstructionsInput,
): Promise<DepositInstructions> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        const currency = requireEnabledCurrency(
            repo.settings.get(),
            input.currency,
        );
        const method = requireMethod(
            repo,
            input.methodId,
            "deposit",
            currency.code,
        );
        const flow = DEPOSIT_FLOW[method.id];
        if (flow === "instructions") {
            return {
                flow,
                ...depositBankDetailsFor(currency.code),
                reference: depositReferenceFor(input.userId, currency.code),
            };
        }
        if (flow === "address") {
            const network = requireNetwork(currency.code, input.network ?? "");
            return {
                flow,
                network,
                address: depositAddressFor(
                    input.userId,
                    currency.code,
                    network,
                ),
                confirmations: NETWORK_CONFIRMATIONS[network],
            };
        }
        return { flow: "checkout" };
    }, 200);
}

export interface DepositInput {
    userId: string;
    methodId: string;
    currency: CurrencyCode;
    amount: DecimalString;
    network?: string;
}

/**
 * Registers a pending deposit. Bank transfers carry the user's reference, card
 * payments a provider checkout session, crypto the (simulated) on-chain transfer.
 * The account for the currency is opened on first use.
 */
export function createDeposit(input: DepositInput): Promise<AnyRequest> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        const settings = repo.settings.get();
        const currency = requireEnabledCurrency(settings, input.currency);
        const method = requireMethod(
            repo,
            input.methodId,
            "deposit",
            currency.code,
        );
        const amount = decimalToMinor(input.amount, currency.decimals);
        assertWithinLimits(settings, currency, amount);

        const flow = DEPOSIT_FLOW[method.id];
        let fields: Record<string, string>;
        if (flow === "address") {
            const network = requireNetwork(currency.code, input.network ?? "");
            fields = {
                network,
                address: depositAddressFor(
                    input.userId,
                    currency.code,
                    network,
                ),
                txHash: `0xdemo${Date.now().toString(16).padStart(60, "0")}`,
            };
        } else if (flow === "checkout") {
            fields = {
                checkoutSession: `cs_demo_${Math.random().toString(36).slice(2, 12)}`,
            };
        } else {
            fields = {
                reference: depositReferenceFor(input.userId, currency.code),
            };
        }

        return repo.transaction(() => {
            const account = ensureAccount(repo, input.userId, currency.code);
            return submitRequest(repo, {
                kind: "deposit",
                userId: input.userId,
                method: method.id,
                payload: {
                    accountId: account.id,
                    currency: currency.code,
                    amount,
                    fee: ZERO,
                    fields,
                },
            });
        });
    });
}

// ─── Withdrawals ────────────────────────────────────────────────────────────

export interface WithdrawalInput {
    userId: string;
    methodId: string;
    accountId: string;
    amount: DecimalString;
    fields: Record<string, string>;
    /** Step-up confirmation code (2FA or email). */
    code: string;
}

export function createWithdrawal(input: WithdrawalInput): Promise<AnyRequest> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        assertConfirmationCode(input.code);
        const account = requireOwnAccount(repo, input.userId, input.accountId);
        const settings = repo.settings.get();
        const currency = requireEnabledCurrency(settings, account.currency);
        const method = requireMethod(
            repo,
            input.methodId,
            "withdrawal",
            currency.code,
        );
        const amount = decimalToMinor(input.amount, currency.decimals);
        assertWithinLimits(settings, currency, amount);

        const fields: Record<string, string> = {};
        for (const field of method.fields) {
            const value = input.fields[field.name]?.trim() ?? "";
            if (field.kind === "cardNumber") {
                Object.assign(fields, tokenizeCard(value));
            } else {
                fields[field.name] = value;
            }
        }

        return submitRequest(repo, {
            kind: "withdrawal",
            userId: input.userId,
            method: method.id,
            payload: {
                accountId: account.id,
                currency: currency.code,
                amount,
                fee: feeFromBps(amount, settings.fees.withdrawalBps),
                fields,
            },
        });
    });
}

// ─── Transfers ──────────────────────────────────────────────────────────────

export interface ExternalBeneficiaryInput {
    name: string;
    iban?: string;
    bic?: string;
    bankAddress?: string;
    bankCountry?: string;
    /** Raw card number, tokenized before anything is stored. */
    cardNumber?: string;
    /** A saved card beneficiary's token instead of a raw number. */
    cardToken?: string;
    cardLast4?: string;
}

export type TransferTargetInput =
    | { kind: "own"; accountId: string }
    | { kind: "user"; email: string }
    | {
          kind: "external";
          rail: TransferRail;
          beneficiary: ExternalBeneficiaryInput;
          reference?: string;
          /** Add the beneficiary to the saved list. */
          save?: boolean;
      };

export interface TransferInput {
    userId: string;
    fromAccountId: string;
    amount: DecimalString;
    target: TransferTargetInput;
    code: string;
}

function externalBeneficiary(
    rail: TransferRail,
    input: ExternalBeneficiaryInput,
): BeneficiaryDetails {
    const name = input.name.trim();
    if (!name) throw new DomainError("invalidDetails");
    if (rail === "card") {
        const card =
            input.cardToken && input.cardLast4
                ? { cardToken: input.cardToken, cardLast4: input.cardLast4 }
                : tokenizeCard(input.cardNumber ?? "");
        return { name, ...card };
    }
    const iban = (input.iban ?? "").replace(/\s+/g, "").toUpperCase();
    const bic = (input.bic ?? "").replace(/\s+/g, "").toUpperCase();
    if (!isValidIban(iban)) throw new DomainError("invalidDetails");
    if ((rail === "wire" || bic) && !isValidBic(bic))
        throw new DomainError("invalidDetails");
    if (rail === "sepa") return { name, iban, ...(bic ? { bic } : {}) };
    const bankAddress = input.bankAddress?.trim() ?? "";
    const bankCountry = input.bankCountry?.trim() ?? "";
    if (!bankAddress || !bankCountry) throw new DomainError("invalidDetails");
    return { name, iban, bic, bankAddress, bankCountry };
}

function saveBeneficiary(
    repo: Repository,
    userId: string,
    rail: TransferRail,
    details: BeneficiaryDetails,
): void {
    const duplicate = repo.beneficiaries.list(
        (b) =>
            b.userId === userId &&
            b.rail === rail &&
            b.name === details.name &&
            (rail === "card"
                ? b.cardLast4 === details.cardLast4
                : b.iban === details.iban),
    )[0];
    if (duplicate) return;
    repo.beneficiaries.insert({
        id: repo.nextId("ben"),
        userId,
        rail,
        ...details,
        createdAt: repo.now(),
    });
}

export function createTransfer(input: TransferInput): Promise<AnyRequest> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        assertConfirmationCode(input.code);
        const account = requireOwnAccount(
            repo,
            input.userId,
            input.fromAccountId,
        );
        const settings = repo.settings.get();
        const currency = requireEnabledCurrency(settings, account.currency);
        const amount = decimalToMinor(input.amount, currency.decimals);
        const fee = feeFromBps(amount, settings.fees.transferBps);

        let target: TransferTarget;
        let method: string;
        const requested = input.target;
        if (requested.kind === "own") {
            target = requested;
            method = "internal-own";
        } else if (requested.kind === "user") {
            const email = requested.email.trim().toLowerCase();
            const recipient = repo.users.list(
                (u) => u.email === email && u.role === "user",
            )[0];
            if (!recipient) throw new DomainError("recipientNotFound");
            target = { kind: "user", email, userId: recipient.id };
            method = "internal-user";
        } else {
            if (!railSupports(requested.rail, currency))
                throw new DomainError("methodUnavailable");
            assertWithinLimits(settings, currency, amount);
            const reference = requested.reference?.trim().slice(0, 140);
            target = {
                kind: "external",
                rail: requested.rail,
                beneficiary: externalBeneficiary(
                    requested.rail,
                    requested.beneficiary,
                ),
                ...(reference ? { reference } : {}),
            };
            method = `${requested.rail}-transfer`;
        }

        return repo.transaction(() => {
            const request = submitRequest(repo, {
                kind: "transfer",
                userId: input.userId,
                method,
                payload: {
                    fromAccountId: account.id,
                    currency: currency.code,
                    amount,
                    fee,
                    target,
                },
            });
            if (
                requested.kind === "external" &&
                requested.save &&
                target.kind === "external"
            ) {
                saveBeneficiary(
                    repo,
                    input.userId,
                    target.rail,
                    target.beneficiary,
                );
            }
            return request;
        });
    });
}

export function listBeneficiaries(userId: string): Promise<Beneficiary[]> {
    return withLatency(() =>
        getRepository()
            .beneficiaries.list((b) => b.userId === userId)
            .sort(byNewest),
    );
}

// ─── Conversions ────────────────────────────────────────────────────────────

export function getRates(): Promise<RatesSnapshot> {
    return withLatency(() => getRatesProvider().snapshot(), 150);
}

export interface QuoteInput {
    userId: string;
    fromAccountId: string;
    to: CurrencyCode;
    amount: DecimalString;
}

// Locked quotes live in "server" memory only: they expire within seconds.
const lockedQuotes = new Map<string, LockedQuote & { userId: string }>();

function pruneQuotes(now: number): void {
    for (const [id, quote] of lockedQuotes) {
        if (Date.parse(quote.expiresAt) < now) lockedQuotes.delete(id);
    }
}

/** Fixes the rate for `QUOTE_TTL_MS`; the conversion is then created by quote id. */
export function lockQuote(input: QuoteInput): Promise<LockedQuote> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        const account = requireOwnAccount(
            repo,
            input.userId,
            input.fromAccountId,
        );
        const settings = repo.settings.get();
        const from = requireEnabledCurrency(settings, account.currency);
        requireEnabledCurrency(settings, input.to);
        const amount = decimalToMinor(input.amount, from.decimals);
        const quote = getRatesProvider().quote(from.code, input.to, amount);

        const now = Date.now();
        pruneQuotes(now);
        const locked = {
            ...quote,
            id: repo.nextId("qte"),
            fromAccountId: account.id,
            expiresAt: new Date(now + QUOTE_TTL_MS).toISOString(),
        };
        lockedQuotes.set(locked.id, { ...locked, userId: input.userId });
        return locked;
    }, 250);
}

export interface ConvertInput {
    userId: string;
    quoteId: string;
}

/** Creates the conversion from the locked quote, never from client-side numbers. */
export function createConversion(input: ConvertInput): Promise<AnyRequest> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, input.userId);
        const quote = lockedQuotes.get(input.quoteId);
        if (!quote || quote.userId !== input.userId)
            throw new DomainError("quoteExpired");
        if (Date.parse(quote.expiresAt) < Date.now()) {
            lockedQuotes.delete(quote.id);
            throw new DomainError("quoteExpired");
        }
        const request = submitRequest(repo, {
            kind: "conversion",
            userId: input.userId,
            method: "rates",
            payload: {
                fromAccountId: quote.fromAccountId,
                from: quote.from,
                to: quote.to,
                amount: quote.amount,
                fee: quote.fee,
                rate: quote.rate,
                toAmount: quote.toAmount,
            },
        });
        lockedQuotes.delete(quote.id);
        return request;
    });
}

export function listUserRequests(userId: string): Promise<AnyRequest[]> {
    return withLatency(() =>
        getRepository()
            .requests.list((r) => r.userId === userId)
            .sort(byNewest),
    );
}
