import { describe, expect, it } from "vitest";
import {
    convertMinor,
    crossRate,
    decimalToMinor,
    feeFromBps,
    maxAmountWithFee,
    MoneyError,
    minorToDecimal,
} from "@/domain/money";

describe("decimal ↔ minor units", () => {
    it("parses decimals exactly", () => {
        expect(decimalToMinor("12.34", 2)).toBe("1234");
        expect(decimalToMinor("0.1", 2)).toBe("10");
        expect(decimalToMinor("5", 8)).toBe("500000000");
        // 0.1 + 0.2 must not drift like floats do.
        expect(
            BigInt(decimalToMinor("0.1", 8)) + BigInt(decimalToMinor("0.2", 8)),
        ).toBe(BigInt(decimalToMinor("0.3", 8)));
    });

    it("rejects malformed input and excess precision", () => {
        expect(() => decimalToMinor("1.234", 2)).toThrow(MoneyError);
        expect(() => decimalToMinor("1e3", 2)).toThrow(MoneyError);
        expect(() => decimalToMinor("abc", 2)).toThrow(MoneyError);
    });

    it("formats back to a decimal string", () => {
        expect(minorToDecimal("1234", 2)).toBe("12.34");
        expect(minorToDecimal("5", 2)).toBe("0.05");
        expect(minorToDecimal("-5", 2)).toBe("-0.05");
        expect(minorToDecimal("42", 0)).toBe("42");
    });
});

describe("fees", () => {
    it("charges basis points rounded up", () => {
        expect(feeFromBps("10000", 50)).toBe("50");
        expect(feeFromBps("1", 50)).toBe("1");
        expect(feeFromBps("12345", 0)).toBe("0");
    });
});

describe("conversions", () => {
    const usd = { decimals: 2, price: "1" };
    const eur = { decimals: 2, price: "1.08" };
    const btc = { decimals: 8, price: "64000" };

    it("converts between currencies with different decimals", () => {
        expect(convertMinor("50000", usd, btc)).toBe("781250"); // 500 USD → 0.0078125 BTC
        expect(convertMinor("100000000", btc, usd)).toBe("6400000"); // 1 BTC → 64 000 USD
    });

    it("rounds down to the target minor unit", () => {
        expect(convertMinor("100", usd, eur)).toBe("92"); // 1 / 1.08 = 0.9259…
    });

    it("computes cross rates", () => {
        expect(crossRate("1", "64000")).toBe("0.00001562");
        expect(crossRate("1.08", "1")).toBe("1.08");
    });
});

describe("maxAmountWithFee", () => {
    it("leaves room for a rounded-up fee", () => {
        expect(maxAmountWithFee("10025", 25)).toBe("10000");
        expect(maxAmountWithFee("10000", 25)).toBe("9975");
        expect(maxAmountWithFee("10000", 0)).toBe("10000");
        expect(maxAmountWithFee("0", 25)).toBe("0");
    });

    it("never exceeds the available balance", () => {
        for (const available of ["1", "7", "999", "123457"]) {
            const amount = maxAmountWithFee(available, 33);
            const total = BigInt(amount) + BigInt(feeFromBps(amount, 33));
            expect(total <= BigInt(available)).toBe(true);
        }
    });
});
