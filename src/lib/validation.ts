import { z } from "zod";
import { isPositive } from "@/domain/money";

// Schema error messages are keys under `validation.*` in the message files;
// forms translate them via `useFieldError`.
export const VALIDATION_KEYS = [
    "required",
    "email",
    "passwordMin",
    "passwordMismatch",
    "amountFormat",
    "amountPositive",
    "amountDecimals",
    "insufficientFunds",
    "holderName",
    "iban",
    "bic",
    "accountNumber",
    "routingNumber",
    "cardNumber",
    "cardExpiry",
    "cryptoAddress",
    "txHash",
    "network",
    "birthDate",
    "fileRequired",
    "fileTooLarge",
    "fileType",
    "price",
    "bps",
    "sameAccount",
    "sameCurrency",
    "amountOutOfRange",
    "termRange",
    "consent",
    "code",
    "passwordWeak",
] as const;

export type ValidationKey = (typeof VALIDATION_KEYS)[number];

export function isValidationKey(
    value: string | undefined,
): value is ValidationKey {
    return (VALIDATION_KEYS as readonly string[]).includes(value ?? "");
}

export const requiredString = () =>
    z.string().trim().min(1, { error: "required" });

export const emailSchema = z.email({ error: "email" });

export const passwordSchema = z.string().min(8, { error: "passwordMin" });

const AMOUNT_RE = /^\d+(\.\d+)?$/;

/** A positive decimal amount with at most `decimals` fraction digits, kept as a string. */
export function amountSchema(decimals: number) {
    return (
        z
            .string()
            .trim()
            .min(1, { error: "required" })
            .regex(AMOUNT_RE, { error: "amountFormat" })
            .refine((value) => (value.split(".")[1]?.length ?? 0) <= decimals, {
                error: "amountDecimals",
            })
            // Zod 4 keeps running checks after a failure, so guard against malformed input.
            .refine(
                (value) =>
                    !AMOUNT_RE.test(value) ||
                    isPositive(value.replace(".", "")),
                {
                    error: "amountPositive",
                },
            )
    );
}

/** Complexity rules shown next to a new password; all must pass. */
export const PASSWORD_RULES = {
    length: (v: string) => v.length >= 8,
    mixedCase: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    digit: (v: string) => /\d/.test(v),
    symbol: (v: string) => /[^A-Za-z0-9]/.test(v),
} as const;

export type PasswordRule = keyof typeof PASSWORD_RULES;

export function passwordChecks(value: string): Record<PasswordRule, boolean> {
    return Object.fromEntries(
        Object.entries(PASSWORD_RULES).map(([rule, check]) => [
            rule,
            check(value),
        ]),
    ) as Record<PasswordRule, boolean>;
}

export const strongPasswordSchema = passwordSchema.refine(
    (v) => Object.values(passwordChecks(v)).every(Boolean),
    { error: "passwordWeak" },
);
