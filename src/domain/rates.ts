import type { CurrencyCode, DecimalString, Minor } from "@/domain/types";

export interface Quote {
    from: CurrencyCode;
    to: CurrencyCode;
    amount: Minor;
    fee: Minor;
    /** Units of `to` per one unit of `from`. */
    rate: DecimalString;
    toAmount: Minor;
}

/** A quote the backend holds for a short time; conversions are created by its id. */
export interface LockedQuote extends Quote {
    id: string;
    fromAccountId: string;
    expiresAt: string;
}

/** Indicative USD prices of every currency at one point in time. */
export interface RatesSnapshot {
    usdPrices: Record<CurrencyCode, DecimalString>;
    updatedAt: string;
}

export interface RatesProvider {
    getRate(from: CurrencyCode, to: CurrencyCode): DecimalString;
    quote(from: CurrencyCode, to: CurrencyCode, amount: Minor): Quote;
    snapshot(): RatesSnapshot;
}
