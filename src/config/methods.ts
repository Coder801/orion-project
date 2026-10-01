import type { PaymentMethod } from "@/domain/types";

const FIAT = ["EUR", "USD", "GBP"];
const CRYPTO = ["BTC", "ETH", "USDT", "SOL"];

// Deposit/withdrawal forms are generated from these field lists
// (see features/payments/fieldSchema.ts for the validation per field kind).
export const DEFAULT_METHODS: PaymentMethod[] = [
    {
        id: "sepa-in",
        kind: "deposit",
        currencies: ["EUR"],
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "iban", kind: "iban" },
        ],
    },
    {
        id: "wire-in",
        kind: "deposit",
        currencies: ["USD", "GBP"],
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "accountNumber", kind: "accountNumber" },
            { name: "routingNumber", kind: "routingNumber" },
        ],
    },
    {
        id: "card-in",
        kind: "deposit",
        currencies: FIAT,
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "cardNumber", kind: "cardNumber" },
            { name: "cardExpiry", kind: "cardExpiry" },
        ],
    },
    {
        id: "crypto-in",
        kind: "deposit",
        currencies: CRYPTO,
        enabled: true,
        fields: [
            { name: "network", kind: "network" },
            { name: "txHash", kind: "txHash" },
        ],
    },
    {
        id: "sepa-out",
        kind: "withdrawal",
        currencies: ["EUR"],
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "iban", kind: "iban" },
            { name: "bic", kind: "bic" },
        ],
    },
    {
        id: "wire-out",
        kind: "withdrawal",
        currencies: ["USD", "GBP"],
        enabled: true,
        fields: [
            { name: "holderName", kind: "holderName" },
            { name: "accountNumber", kind: "accountNumber" },
            { name: "routingNumber", kind: "routingNumber" },
            { name: "reference", kind: "text", optional: true },
        ],
    },
    {
        id: "card-out",
        kind: "withdrawal",
        currencies: FIAT,
        enabled: false,
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
