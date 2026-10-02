import type { Account } from "@/domain/types";

// Deterministic placeholder identifiers derived from the account id. They are
// prefixed with "DEMO" and follow no real banking or blockchain format.

function hashDigits(seed: string, length: number): string {
    let hash = 2166136261;
    let out = "";
    while (out.length < length) {
        for (const char of seed + out.length) {
            hash ^= char.charCodeAt(0);
            hash = Math.imul(hash, 16777619) >>> 0;
        }
        out += String(hash % 10);
    }
    return out;
}

export function accountNumberFor(account: Pick<Account, "id">): string {
    const digits = hashDigits(account.id, 16);
    return `DEMO ${digits.match(/.{4}/g)?.join(" ") ?? digits}`;
}

export function routingCodeFor(account: Pick<Account, "id">): string {
    return `DEMO-${hashDigits(`${account.id}:routing`, 6)}`;
}

export function walletAddressFor(
    account: Pick<Account, "id" | "currency">,
): string {
    return `demo:${account.currency.toLowerCase()}:${hashDigits(`${account.id}:wallet`, 24)}`;
}

/** Short label for selects and tables: "EUR ·· 1234". */
export function accountLabel(
    account: Pick<Account, "id" | "currency">,
): string {
    return `${account.currency} ·· ${hashDigits(account.id, 16).slice(-4)}`;
}

/** Placeholder platform bank details the user pays a fiat deposit to. */
export function depositBankDetailsFor(currency: string) {
    return {
        beneficiary: "DEMO BENEFICIARY",
        accountNumber: `DEMO ${hashDigits(`platform:${currency}`, 12).match(/.{4}/g)?.join(" ")}`,
        bankCode: `DEMO${hashDigits(`platform:${currency}:bank`, 4)}`,
    };
}

/** Unique reference that matches an incoming bank transfer to the user. */
export function depositReferenceFor(userId: string, currency: string): string {
    return `DEMO-${currency}-${hashDigits(`${userId}:${currency}:ref`, 8)}`;
}

/** Placeholder deposit address per user, currency and network. */
export function depositAddressFor(
    userId: string,
    currency: string,
    network: string,
): string {
    return `demo:${network}:${hashDigits(`${userId}:${currency}:${network}`, 32)}`;
}

/** Placeholder card number tail for a user's card widget. */
export function cardLast4For(userId: string): string {
    return hashDigits(`${userId}:card`, 4);
}
