import { DomainError } from "@/domain/errors";
import { addMinor, cmpMinor, subMinor } from "@/domain/money";
import type {
    Account,
    AnyRequest,
    Currency,
    CurrencyCode,
    Minor,
    PlatformSettings,
    User,
} from "@/domain/types";

/** Operations blocked until the user's KYC is approved (guards + services). */
export const KYC_REQUIRED_OPERATIONS = [
    "deposit",
    "withdraw",
    "transfer",
    "convert",
    "credit",
    "cards",
] as const;

export type KycOperation = (typeof KYC_REQUIRED_OPERATIONS)[number];

export function isKycApproved(user: Pick<User, "kycStatus">): boolean {
    return user.kycStatus === "approved";
}

export function assertKycApproved(user: Pick<User, "kycStatus">): void {
    if (!isKycApproved(user)) throw new DomainError("kycRequired");
}

export function availableBalance(
    account: Pick<Account, "balance" | "hold">,
): Minor {
    return subMinor(account.balance, account.hold);
}

export function hasAvailable(
    account: Pick<Account, "balance" | "hold">,
    total: Minor,
): boolean {
    return cmpMinor(availableBalance(account), total) >= 0;
}

/** Kinds that take money out of an account and therefore hold funds while pending. */
export const DEBIT_KINDS = ["withdrawal", "transfer", "conversion"] as const;

export type DebitRequest = Extract<
    AnyRequest,
    { kind: (typeof DEBIT_KINDS)[number] }
>;

export function isDebitRequest(request: AnyRequest): request is DebitRequest {
    return (DEBIT_KINDS as readonly string[]).includes(request.kind);
}

/** Account and amount (fee included) a debit request reserves. */
export function debitOf(request: DebitRequest): {
    accountId: string;
    total: Minor;
} {
    const { payload } = request;
    const accountId =
        "fromAccountId" in payload ? payload.fromAccountId : payload.accountId;
    return { accountId, total: addMinor(payload.amount, payload.fee) };
}

export function findCurrency(
    settings: PlatformSettings,
    code: CurrencyCode,
): Currency | undefined {
    return settings.currencies.find((currency) => currency.code === code);
}

export function requireEnabledCurrency(
    settings: PlatformSettings,
    code: CurrencyCode,
): Currency {
    const currency = findCurrency(settings, code);
    if (!currency?.enabled) throw new DomainError("currencyDisabled");
    return currency;
}
