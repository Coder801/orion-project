import { describe, expect, it } from "vitest";
import type { Account, Currency } from "@/domain/types";
import { adjustmentSchema } from "@/features/admin/users/schemas";

const currencies: Currency[] = [
    { code: "EUR", type: "fiat", decimals: 2, enabled: true },
    { code: "BTC", type: "crypto", decimals: 8, enabled: true },
];
const accounts: Account[] = [
    { id: "a", userId: "u", currency: "EUR", balance: "10000", hold: "2500" },
];
const schema = adjustmentSchema(currencies, accounts);

function amountError(values: Record<string, string>) {
    const result = schema.safeParse({
        direction: "credit",
        currency: "EUR",
        amount: "1",
        reason: "fix",
        ...values,
    });
    if (result.success) return undefined;
    return result.error.issues.find((i) => i.path[0] === "amount")?.message;
}

describe("adjustmentSchema", () => {
    it("accepts a credit in any currency precision", () => {
        expect(amountError({ currency: "BTC", amount: "0.00000001" })).toBe(
            undefined,
        );
    });

    it("checks decimals of the chosen currency", () => {
        expect(amountError({ amount: "1.001" })).toBe("amountDecimals");
        expect(amountError({ amount: "0" })).toBe("amountPositive");
    });

    it("limits debits to the available balance", () => {
        expect(amountError({ direction: "debit", amount: "75" })).toBe(
            undefined,
        );
        expect(amountError({ direction: "debit", amount: "75.01" })).toBe(
            "insufficientFunds",
        );
        expect(
            amountError({ direction: "debit", currency: "BTC", amount: "1" }),
        ).toBe("insufficientFunds");
    });

    it("requires a reason", () => {
        expect(
            schema.safeParse({
                direction: "credit",
                currency: "EUR",
                amount: "1",
                reason: " ",
            }).success,
        ).toBe(false);
    });
});
