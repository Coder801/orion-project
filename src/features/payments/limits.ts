import { cmpMinor, decimalToMinor } from "@/domain/money";
import type { Currency, Minor, PlatformSettings } from "@/domain/types";
import { amountSchema } from "@/lib/validation";

/** Min/max per operation for a currency, in minor units. */
export function limitsOf(
    settings: PlatformSettings,
    currency: Currency | undefined,
): { min: Minor; max: Minor; currency: string } | null {
    const limits = currency && settings.limits[currency.code];
    if (!currency || !limits) return null;
    return {
        min: decimalToMinor(limits.min, currency.decimals),
        max: decimalToMinor(limits.max, currency.decimals),
        currency: currency.code,
    };
}

/** Amount with the currency's precision and the platform limits (UX only; services re-check). */
export function amountLimitsSchema(
    settings: PlatformSettings,
    currency: Currency | undefined,
) {
    const decimals = currency?.decimals ?? 2;
    const limits = limitsOf(settings, currency);
    return amountSchema(decimals).refine(
        (value) => {
            if (!limits) return true;
            try {
                const amount = decimalToMinor(value, decimals);
                return (
                    cmpMinor(amount, limits.min) >= 0 &&
                    cmpMinor(amount, limits.max) <= 0
                );
            } catch {
                // Format errors are reported by amountSchema.
                return true;
            }
        },
        { error: "amountOutOfRange" },
    );
}
