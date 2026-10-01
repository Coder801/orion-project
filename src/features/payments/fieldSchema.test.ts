import { describe, expect, it } from "vitest";
import { DEFAULT_METHODS } from "@/config/methods";
import {
    buildFieldsSchema,
    isValidBic,
    isValidCardExpiry,
    isValidCardNumber,
    isValidIban,
    isValidRoutingNumber,
} from "@/features/payments/fieldSchema";
import { amountSchema } from "@/lib/validation";

function method(id: string) {
    const found = DEFAULT_METHODS.find((m) => m.id === id);
    if (!found) throw new Error(id);
    return found;
}

function firstError(result: {
    success: boolean;
    error?: { issues: { message: string }[] };
}) {
    return result.error?.issues[0]?.message;
}

describe("field validators", () => {
    it("checks IBAN checksums", () => {
        expect(isValidIban("DE89 3704 0044 0532 0130 00")).toBe(true);
        expect(isValidIban("DE89370400440532013001")).toBe(false);
    });

    it("checks BIC, routing and card numbers", () => {
        expect(isValidBic("DEUTDEFF")).toBe(true);
        expect(isValidBic("DEUTDEFF500")).toBe(true);
        expect(isValidBic("DEU1")).toBe(false);
        expect(isValidRoutingNumber("011000015")).toBe(true);
        expect(isValidRoutingNumber("011000016")).toBe(false);
        expect(isValidCardNumber("4242 4242 4242 4242")).toBe(true);
        expect(isValidCardNumber("4242 4242 4242 4241")).toBe(false);
    });

    it("rejects expired cards", () => {
        const now = new Date("2026-06-15T00:00:00Z");
        expect(isValidCardExpiry("06/26", now)).toBe(true);
        expect(isValidCardExpiry("05/26", now)).toBe(false);
        expect(isValidCardExpiry("13/30", now)).toBe(false);
    });
});

describe("method schemas", () => {
    it("validates SEPA withdrawal fields", () => {
        const schema = buildFieldsSchema(method("sepa-out").fields, []);
        expect(
            schema.safeParse({
                holderName: "Jane Doe",
                iban: "DE89370400440532013000",
                bic: "DEUTDEFF",
            }).success,
        ).toBe(true);
        expect(
            firstError(
                schema.safeParse({
                    holderName: "Jane Doe",
                    iban: "DE00",
                    bic: "DEUTDEFF",
                }),
            ),
        ).toBe("iban");
    });

    it("checks crypto addresses against the selected network", () => {
        const schema = buildFieldsSchema(method("crypto-out").fields, [
            "ethereum",
            "tron",
        ]);
        const eth = "0x52908400098527886E0F7030069857D2E4169EE7";
        expect(
            schema.safeParse({ network: "ethereum", address: eth }).success,
        ).toBe(true);
        expect(
            firstError(schema.safeParse({ network: "tron", address: eth })),
        ).toBe("cryptoAddress");
        expect(
            firstError(schema.safeParse({ network: "bitcoin", address: eth })),
        ).toBe("network");
    });

    it("allows optional fields to be empty", () => {
        const schema = buildFieldsSchema(method("wire-out").fields, []);
        expect(
            schema.safeParse({
                holderName: "Jane Doe",
                accountNumber: "12345678",
                routingNumber: "011000015",
                reference: "",
            }).success,
        ).toBe(true);
    });
});

describe("amountSchema", () => {
    const schema = amountSchema(2);

    it("accepts positive decimals within precision", () => {
        expect(schema.safeParse("10").success).toBe(true);
        expect(schema.safeParse("0.01").success).toBe(true);
    });

    it("reports the right error key", () => {
        expect(firstError(schema.safeParse(""))).toBe("required");
        expect(firstError(schema.safeParse("1,5"))).toBe("amountFormat");
        expect(firstError(schema.safeParse("1.555"))).toBe("amountDecimals");
        expect(firstError(schema.safeParse("0.00"))).toBe("amountPositive");
    });
});
