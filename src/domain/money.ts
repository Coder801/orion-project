import type { DecimalString, Minor } from "@/domain/types";

// All money math runs on bigint minor units. Decimal strings are only used at
// the edges: user input, rates and formatting.

const DECIMAL_RE = /^(-)?(\d+)(?:\.(\d+))?$/;

export class MoneyError extends Error {}

export function toBig(value: Minor): bigint {
    return BigInt(value);
}

export function fromBig(value: bigint): Minor {
    return value.toString();
}

export const ZERO: Minor = "0";

export function addMinor(a: Minor, b: Minor): Minor {
    return fromBig(toBig(a) + toBig(b));
}

export function subMinor(a: Minor, b: Minor): Minor {
    return fromBig(toBig(a) - toBig(b));
}

export function negMinor(a: Minor): Minor {
    return fromBig(-toBig(a));
}

export function cmpMinor(a: Minor, b: Minor): -1 | 0 | 1 {
    const diff = toBig(a) - toBig(b);
    return diff === 0n ? 0 : diff < 0n ? -1 : 1;
}

export function isPositive(a: Minor): boolean {
    return toBig(a) > 0n;
}

const pow10 = (exp: number): bigint => 10n ** BigInt(exp);

/** Exact decimal as an integer + scale: "12.345" → { int: 12345n, scale: 3 }. */
export function parseDecimal(value: DecimalString): {
    int: bigint;
    scale: number;
} {
    const match = DECIMAL_RE.exec(value.trim());
    if (!match) throw new MoneyError(`Invalid decimal: ${value}`);
    const [, sign, whole = "0", fraction = ""] = match;
    const int = BigInt(whole + fraction) * (sign ? -1n : 1n);
    return { int, scale: fraction.length };
}

/** "12.34" with 2 decimals → "1234". Rejects more fraction digits than allowed. */
export function decimalToMinor(value: DecimalString, decimals: number): Minor {
    const { int, scale } = parseDecimal(value);
    if (scale > decimals) throw new MoneyError(`Too many decimals: ${value}`);
    return fromBig(int * pow10(decimals - scale));
}

/** "1234" with 2 decimals → "12.34" (no trailing-zero trimming). */
export function minorToDecimal(value: Minor, decimals: number): DecimalString {
    const big = toBig(value);
    const negative = big < 0n;
    const digits = (negative ? -big : big)
        .toString()
        .padStart(decimals + 1, "0");
    const whole = digits.slice(0, digits.length - decimals);
    const fraction = digits.slice(digits.length - decimals);
    return `${negative ? "-" : ""}${whole}${decimals > 0 ? `.${fraction}` : ""}`;
}

/** Fee in basis points, rounded up so the platform never undercharges. */
export function feeFromBps(amount: Minor, bps: number): Minor {
    if (!Number.isInteger(bps) || bps < 0)
        throw new MoneyError(`Invalid bps: ${bps}`);
    const numerator = toBig(amount) * BigInt(bps);
    const fee = numerator / 10_000n;
    return fromBig(numerator % 10_000n === 0n ? fee : fee + 1n);
}

/**
 * Converts minor units between currencies using unit prices in a common pivot:
 * to = amount × priceFrom / priceTo, rescaled between decimals, rounded down.
 * Everything is one bigint expression to avoid intermediate rounding.
 */
export function convertMinor(
    amount: Minor,
    from: { decimals: number; price: DecimalString },
    to: { decimals: number; price: DecimalString },
): Minor {
    const pFrom = parseDecimal(from.price);
    const pTo = parseDecimal(to.price);
    if (pFrom.int <= 0n || pTo.int <= 0n)
        throw new MoneyError("Prices must be positive");
    const numerator =
        toBig(amount) * pFrom.int * pow10(pTo.scale) * pow10(to.decimals);
    const denominator = pTo.int * pow10(pFrom.scale) * pow10(from.decimals);
    return fromBig(numerator / denominator);
}

/** Cross rate priceFrom / priceTo as a decimal string with `precision` digits. */
export function crossRate(
    fromPrice: DecimalString,
    toPrice: DecimalString,
    precision = 8,
): DecimalString {
    const pFrom = parseDecimal(fromPrice);
    const pTo = parseDecimal(toPrice);
    if (pTo.int <= 0n) throw new MoneyError("Price must be positive");
    const scaled =
        (pFrom.int * pow10(pTo.scale) * pow10(precision)) /
        (pTo.int * pow10(pFrom.scale));
    return trimZeros(minorToDecimal(fromBig(scaled), precision));
}

function trimZeros(value: DecimalString): DecimalString {
    return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
}
