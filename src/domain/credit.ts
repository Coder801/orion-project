import { fromBig, toBig } from "@/domain/money";
import type { Minor } from "@/domain/types";

const SCALE = 10n ** 18n;

/**
 * Preliminary annuity payment: P·r / (1 − (1 + r)^−n) with r = APR / 12,
 * in 18-digit fixed point and rounded up to the next minor unit.
 */
export function estimateMonthlyPayment(
    principal: Minor,
    aprBps: number,
    months: number,
): Minor {
    if (months <= 0) throw new RangeError("months must be positive");
    const p = toBig(principal);
    const n = BigInt(months);
    if (aprBps === 0) return fromBig((p + n - 1n) / n);

    const r = (BigInt(aprBps) * SCALE) / 120_000n;
    let q = SCALE;
    for (let i = 0; i < months; i += 1) q = (q * (SCALE + r)) / SCALE;
    const numerator = p * r * q;
    const denominator = (q - SCALE) * SCALE;
    const payment = numerator / denominator;
    return fromBig(numerator % denominator === 0n ? payment : payment + 1n);
}
