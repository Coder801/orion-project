import { z } from "zod";
import type { Network } from "@/config/currencies";
import type { FieldKind, FieldSchema } from "@/domain/types";
import { requiredString, type ValidationKey } from "@/lib/validation";

const compact = (value: string) => value.replace(/\s+/g, "").toUpperCase();

/** ISO 13616 mod-97 check. */
export function isValidIban(value: string): boolean {
    const iban = compact(value);
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    const digits = rearranged.replace(/[A-Z]/g, (char) =>
        String(char.charCodeAt(0) - 55),
    );
    let remainder = 0;
    for (const digit of digits)
        remainder = (remainder * 10 + Number(digit)) % 97;
    return remainder === 1;
}

export function isValidBic(value: string): boolean {
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(compact(value));
}

/** ABA routing number: 9 digits with a 3-7-1 weighted checksum. */
export function isValidRoutingNumber(value: string): boolean {
    if (!/^\d{9}$/.test(value)) return false;
    const d = [...value].map(Number);
    const sum = [3, 7, 1, 3, 7, 1, 3, 7, 1].reduce(
        (acc, weight, i) => acc + weight * (d[i] ?? 0),
        0,
    );
    return sum % 10 === 0;
}

export function isValidCardNumber(value: string): boolean {
    const digits = value.replace(/[\s-]/g, "");
    if (!/^\d{13,19}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
        let digit = Number(digits[digits.length - 1 - i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
}

/** MM/YY, not in the past. */
export function isValidCardExpiry(value: string, now = new Date()): boolean {
    const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value.trim());
    if (!match) return false;
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    return (
        year > now.getUTCFullYear() ||
        (year === now.getUTCFullYear() && month >= now.getUTCMonth() + 1)
    );
}

const BASE58 = "[1-9A-HJ-NP-Za-km-z]";

const ADDRESS_PATTERNS: Record<Network, RegExp> = {
    bitcoin: new RegExp(`^(bc1[02-9ac-hj-np-z]{11,71}|[13]${BASE58}{25,34})$`),
    ethereum: /^0x[0-9a-fA-F]{40}$/,
    tron: new RegExp(`^T${BASE58}{33}$`),
    solana: new RegExp(`^${BASE58}{32,44}$`),
};

export function isValidCryptoAddress(
    address: string,
    network: Network,
): boolean {
    return ADDRESS_PATTERNS[network].test(address.trim());
}

export function isValidTxHash(value: string): boolean {
    return new RegExp(`^((0x)?[0-9a-fA-F]{64}|${BASE58}{64,88})$`).test(
        value.trim(),
    );
}

const FIELD_VALIDATORS: Partial<
    Record<FieldKind, [(value: string) => boolean, ValidationKey]>
> = {
    holderName: [
        (v) => /^[\p{L}][\p{L} .'-]{1,69}$/u.test(v.trim()),
        "holderName",
    ],
    iban: [isValidIban, "iban"],
    bic: [isValidBic, "bic"],
    accountNumber: [(v) => /^\d{6,17}$/.test(v.trim()), "accountNumber"],
    routingNumber: [isValidRoutingNumber, "routingNumber"],
    cardNumber: [isValidCardNumber, "cardNumber"],
    cardExpiry: [(v) => isValidCardExpiry(v), "cardExpiry"],
    txHash: [isValidTxHash, "txHash"],
};

export type MethodFieldValues = Record<string, string>;

/**
 * Builds the zod schema for a payment method's dynamic fields. Crypto addresses
 * are checked against the network selected in the same form.
 */
export function buildFieldsSchema(
    fields: FieldSchema[],
    networks: Network[],
): z.ZodType<MethodFieldValues, MethodFieldValues> {
    const shape: Record<string, z.ZodType<string, string>> = {};
    for (const field of fields) {
        if (field.kind === "network") {
            shape[field.name] = z
                .string()
                .refine((v) => (networks as string[]).includes(v), {
                    error: "network",
                });
            continue;
        }
        const validator = FIELD_VALIDATORS[field.kind];
        if (field.optional) {
            // Optional fields may stay empty, but a filled one must be valid.
            shape[field.name] = validator
                ? z
                      .string()
                      .trim()
                      .max(140)
                      .refine((v) => v === "" || validator[0](v), {
                          error: validator[1],
                      })
                : z.string().trim().max(140);
            continue;
        }
        shape[field.name] = validator
            ? requiredString().refine(validator[0], { error: validator[1] })
            : requiredString();
    }

    const networkField = fields.find((f) => f.kind === "network");
    const addressField = fields.find((f) => f.kind === "cryptoAddress");

    return z.object(shape).superRefine((values: MethodFieldValues, ctx) => {
        if (!addressField) return;
        const address = values[addressField.name] ?? "";
        const network = (
            networkField ? values[networkField.name] : networks[0]
        ) as Network | undefined;
        if (
            address.trim() &&
            (!network || !isValidCryptoAddress(address, network))
        ) {
            ctx.addIssue({
                code: "custom",
                message: "cryptoAddress",
                path: [addressField.name],
            });
        }
    });
}
