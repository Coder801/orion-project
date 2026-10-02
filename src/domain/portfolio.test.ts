import { describe, expect, it } from "vitest";
import { createEmptyState } from "@/data/seed";
import { convertVia, totalBalance } from "@/domain/portfolio";

const { settings } = createEmptyState();
const source = { ...settings, usdPrices: { ...settings.usdPrices } };
source.usdPrices.EUR = "1.25";
source.usdPrices.BTC = "50000";

describe("portfolio totals", () => {
    it("convert through USD prices", () => {
        // 100.00 USD → 80.00 EUR
        expect(convertVia(source, "10000", "USD", "EUR")).toBe("8000");
        expect(convertVia(source, "10000", "EUR", "EUR")).toBe("10000");
        expect(convertVia(source, "1", "XXX", "EUR")).toBeNull();
    });

    it("sum balances per currency type in the target currency", () => {
        const accounts = [
            { currency: "EUR", balance: "10000" },
            { currency: "USD", balance: "12500" },
            { currency: "BTC", balance: "100000" }, // 0.001 BTC = 50 USD
        ];
        expect(totalBalance(source, accounts, "EUR", "fiat")).toBe("20000");
        expect(totalBalance(source, accounts, "EUR", "crypto")).toBe("4000");
        expect(totalBalance(source, accounts, "EUR")).toBe("24000");
    });
});
