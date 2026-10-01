import { describe, expect, it } from "vitest";
import { createSeed } from "@/data/seed";
import { addMinor } from "@/domain/money";
import { debitOf, isDebitRequest } from "@/domain/rules";

describe("seed", () => {
    it("keeps every hold equal to the pending debits of its account", () => {
        const state = createSeed();
        for (const account of state.accounts) {
            const expected = state.requests
                .filter(
                    (request) =>
                        request.status === "pending" && isDebitRequest(request),
                )
                .map((request) =>
                    isDebitRequest(request) ? debitOf(request) : null,
                )
                .filter((debit) => debit?.accountId === account.id)
                .reduce(
                    (sum, debit) => addMinor(sum, debit?.total ?? "0"),
                    "0",
                );
            expect(account.hold, account.id).toBe(expected);
            expect(
                BigInt(account.balance) >= BigInt(account.hold),
                account.id,
            ).toBe(true);
        }
    });
});
