import { DomainError } from "@/domain/errors";
import { convertMinor, crossRate, feeFromBps } from "@/domain/money";
import type { Quote, RatesProvider } from "@/domain/rates";
import { findCurrency } from "@/domain/rules";
import type { CurrencyCode, PlatformSettings } from "@/domain/types";

/** Static placeholder prices from platform settings; fee is charged on top in `from`. */
export class MockRatesProvider implements RatesProvider {
    constructor(private readonly getSettings: () => PlatformSettings) {}

    private leg(code: CurrencyCode) {
        const settings = this.getSettings();
        const currency = findCurrency(settings, code);
        const price = settings.usdPrices[code];
        if (!currency || !price) throw new DomainError("currencyDisabled");
        return { decimals: currency.decimals, price };
    }

    getRate(from: CurrencyCode, to: CurrencyCode): string {
        return crossRate(this.leg(from).price, this.leg(to).price);
    }

    quote(from: CurrencyCode, to: CurrencyCode, amount: string): Quote {
        if (from === to) throw new DomainError("sameCurrency");
        return {
            from,
            to,
            amount,
            fee: feeFromBps(amount, this.getSettings().fees.conversionBps),
            rate: this.getRate(from, to),
            toAmount: convertMinor(amount, this.leg(from), this.leg(to)),
        };
    }
}
