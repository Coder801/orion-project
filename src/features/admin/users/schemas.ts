import { z } from "zod";
import { cmpMinor, decimalToMinor } from "@/domain/money";
import { availableBalance } from "@/domain/rules";
import type { Account, Currency } from "@/domain/types";
import { amountSchema, requiredString } from "@/lib/validation";

export const ADJUSTMENT_DIRECTIONS = ["credit", "debit"] as const;

/**
 * Admin balance adjustment. Decimals follow the chosen currency, and a debit
 * may not exceed the available funds (the service re-checks both).
 */
export function adjustmentSchema(currencies: Currency[], accounts: Account[]) {
    return z
        .object({
            direction: z.enum(ADJUSTMENT_DIRECTIONS, { error: "required" }),
            currency: requiredString(),
            amount: z.string(),
            reason: requiredString(),
        })
        .superRefine((values, ctx) => {
            const currency = currencies.find((c) => c.code === values.currency);
            if (!currency) return;
            const parsed = amountSchema(currency.decimals).safeParse(
                values.amount,
            );
            if (!parsed.success) {
                ctx.addIssue({
                    code: "custom",
                    path: ["amount"],
                    message: parsed.error.issues[0]?.message ?? "required",
                });
                return;
            }
            if (values.direction !== "debit") return;
            const account = accounts.find((a) => a.currency === currency.code);
            const amount = decimalToMinor(parsed.data, currency.decimals);
            if (!account || cmpMinor(amount, availableBalance(account)) > 0)
                ctx.addIssue({
                    code: "custom",
                    path: ["amount"],
                    message: "insufficientFunds",
                });
        });
}

export type AdjustmentValues = z.infer<ReturnType<typeof adjustmentSchema>>;
