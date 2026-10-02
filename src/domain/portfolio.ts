import { addMinor, convertMinor, ZERO } from "@/domain/money";
import { findCurrency } from "@/domain/rules";
import type {
    Account,
    CurrencyCode,
    CurrencyType,
    DecimalString,
    Minor,
    PlatformSettings,
} from "@/domain/types";

type PriceSource = Pick<PlatformSettings, "currencies"> & {
    usdPrices: Record<CurrencyCode, DecimalString>;
};

/**
 * Converts `amount` of `from` into `to` through the USD pivot prices, or null
 * when either price is unknown.
 */
export function convertVia(
    source: PriceSource,
    amount: Minor,
    from: CurrencyCode,
    to: CurrencyCode,
): Minor | null {
    const fromCurrency = findCurrency(source as PlatformSettings, from);
    const toCurrency = findCurrency(source as PlatformSettings, to);
    const fromPrice = source.usdPrices[from];
    const toPrice = source.usdPrices[to];
    if (!fromCurrency || !toCurrency || !fromPrice || !toPrice) return null;
    if (from === to) return amount;
    return convertMinor(
        amount,
        { decimals: fromCurrency.decimals, price: fromPrice },
        { decimals: toCurrency.decimals, price: toPrice },
    );
}

/** Sum of account balances of one currency type, expressed in `target`. */
export function totalBalance(
    source: PriceSource,
    accounts: Pick<Account, "currency" | "balance">[],
    target: CurrencyCode,
    type?: CurrencyType,
): Minor {
    let total = ZERO;
    for (const account of accounts) {
        const currency = findCurrency(
            source as PlatformSettings,
            account.currency,
        );
        if (!currency || (type && currency.type !== type)) continue;
        const converted = convertVia(
            source,
            account.balance,
            account.currency,
            target,
        );
        if (converted) total = addMinor(total, converted);
    }
    return total;
}
