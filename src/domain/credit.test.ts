import { describe, expect, it } from "vitest";
import { estimateMonthlyPayment } from "@/domain/credit";

describe("estimateMonthlyPayment", () => {
    it("splits the principal evenly without interest", () => {
        expect(estimateMonthlyPayment("120000", 0, 12)).toBe("10000");
        expect(estimateMonthlyPayment("100", 0, 3)).toBe("34");
    });

    it("matches the annuity formula", () => {
        // 10 000.00 at 12% APR over 12 months ≈ 888.49 per month.
        expect(estimateMonthlyPayment("1000000", 1200, 12)).toBe("88849");
        // 5 000.00 at 8.99% over 36 months ≈ 158.98.
        expect(estimateMonthlyPayment("500000", 899, 36)).toBe("15898");
    });
});
