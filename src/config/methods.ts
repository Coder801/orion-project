import type { PaymentMethod } from "@/domain/types";

const FIAT = ["EUR", "USD", "GBP", "CHF"];
const CRYPTO = ["BTC", "ETH", "USDT", "USDC", "SOL"];

/**
 * How a deposit method is completed in the UI:
 * - `instructions`: the user pays to the shown bank details and confirms;
 * - `checkout`: hand-off to a card payment provider;
 * - `address`: on-chain transfer, credited when the network confirms it.
 */
export type DepositFlow = "instructions" | "checkout" | "address";

export const DEPOSIT_FLOW: Record<string, DepositFlow> = {
    "bank-in": "instructions",
    "sepa-in": "instructions",
    "wire-in": "instructions",
    "card-in": "checkout",
    "crypto-in": "address",
};

/** Placeholder processing time shown under the withdrawal form. */
export const PROCESSING_DAYS: Record<string, { min: number; max: number }> = {
    "sepa-out": { min: 0, max: 1 },
    "wire-out": { min: 1, max: 5 },
    "card-out": { min: 1, max: 3 },
    "crypto-out": { min: 0, max: 1 },
};

// Withdrawal forms are generated from these field lists (see
// features/payments/fieldSchema.ts for the validation per field kind). Deposit
// methods collect no payer data: the bank details, checkout or address are shown.
export const DEFAULT_METHODS: PaymentMethod[] = [
    {
        id: "bank-in",
        kind: "deposit",
        currencies: FIAT,
        enabled: true,
        fields: [],
    },
    {
        id: "sepa-in",
        kind: "deposit",
        currencies: ["EUR"],
        enabled: true,
        fields: [],
    },
    {
        id: "wire-in",
        kind: "deposit",
        currencies: FIAT,
        enabled: true,
        fields: [],
    },
    {
        id: "card-in",
        kind: "deposit",
        currencies: FIAT,
        enabled: true,
        fields: [],
    },
    {
        id: "crypto-in",
        kind: "deposit",
        currencies: CRYPTO,
        enabled: true,
        fields: [{ name: "network", kind: "network" }],
    },
    {
        id: "sepa-out",
        kind: "withdrawal",
        currencies: ["EUR"],
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "iban", kind: "iban" },
            { name: "bic", kind: "bic", optional: true },
        ],
    },
    {
        id: "wire-out",
        kind: "withdrawal",
        currencies: FIAT,
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "iban", kind: "iban" },
            { name: "bic", kind: "bic" },
            { name: "reference", kind: "text", optional: true },
        ],
    },
    {
        id: "card-out",
        kind: "withdrawal",
        currencies: FIAT,
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "cardNumber", kind: "cardNumber" },
        ],
    },
    {
        id: "crypto-out",
        kind: "withdrawal",
        currencies: CRYPTO,
        enabled: true,
        fields: [
            { name: "network", kind: "network" },
            { name: "address", kind: "cryptoAddress" },
        ],
    },
];
