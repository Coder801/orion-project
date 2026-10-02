import { DomainError } from "@/domain/errors";
import {
    convertMinor,
    crossRate,
    feeFromBps,
    fromBig,
    minorToDecimal,
    parseDecimal,
} from "@/domain/money";
import type { Quote, RatesProvider, RatesSnapshot } from "@/domain/rates";
import { findCurrency } from "@/domain/rules";
import type {
    CurrencyCode,
    DecimalString,
    PlatformSettings,
} from "@/domain/types";

interface Jitter {
    /** Max deviation from the configured price, in basis points. */
    bps: number;
    /** Prices stay fixed within one period. */
    periodMs: number;
    clock?: () => number;
}

function hash(seed: string): number {
    let h = 2166136261;
    for (const char of seed) {
        h ^= char.charCodeAt(0);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
}

/**
 * Placeholder prices from platform settings; fee is charged on top in `from`.
 * With `jitter`, prices drift deterministically per period so a polling UI
 * sees the feed move without any network access.
 */
export class MockRatesProvider implements RatesProvider {
    constructor(
        private readonly getSettings: () => PlatformSettings,
        private readonly jitter?: Jitter,
    ) {}

    private period(): number {
        if (!this.jitter) return 0;
        const now = (this.jitter.clock ?? Date.now)();
        return Math.floor(now / this.jitter.periodMs);
    }

    private price(code: CurrencyCode, base: DecimalString): DecimalString {
        if (!this.jitter || this.jitter.bps === 0 || code === "USD")
            return base;
        const span = this.jitter.bps * 2 + 1;
        const delta =
            (hash(`${code}:${this.period()}`) % span) - this.jitter.bps;
        const { int, scale } = parseDecimal(base);
        return minorToDecimal(fromBig(int * BigInt(10_000 + delta)), scale + 4);
    }

    private leg(code: CurrencyCode) {
        const settings = this.getSettings();
        const currency = findCurrency(settings, code);
        const base = settings.usdPrices[code];
        if (!currency || !base) throw new DomainError("currencyDisabled");
        return { decimals: currency.decimals, price: this.price(code, base) };
    }

    snapshot(): RatesSnapshot {
        const settings = this.getSettings();
        const usdPrices = Object.fromEntries(
            Object.entries(settings.usdPrices).map(([code, price]) => [
                code,
                this.price(code, price),
            ]),
        );
        const updatedAt = this.jitter
            ? new Date(this.period() * this.jitter.periodMs).toISOString()
            : new Date().toISOString();
        return { usdPrices, updatedAt };
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
