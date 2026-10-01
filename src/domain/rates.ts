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

export interface RatesProvider {
    getRate(from: CurrencyCode, to: CurrencyCode): DecimalString;
    quote(from: CurrencyCode, to: CurrencyCode, amount: Minor): Quote;
}
