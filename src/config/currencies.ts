import type {
    AmountLimits,
    CardPlan,
    CreditSettings,
    Currency,
    CurrencyCode,
    DecimalString,
    FeeSettings,
    PhysicalCardOffer,
} from "@/domain/types";

export const DEFAULT_CURRENCIES: Currency[] = [
    { code: "EUR", type: "fiat", decimals: 2, enabled: true },
    { code: "USD", type: "fiat", decimals: 2, enabled: true },
    { code: "GBP", type: "fiat", decimals: 2, enabled: true },
    { code: "CHF", type: "fiat", decimals: 2, enabled: true },
    { code: "BTC", type: "crypto", decimals: 8, enabled: true },
    { code: "ETH", type: "crypto", decimals: 8, enabled: true },
    { code: "USDT", type: "crypto", decimals: 6, enabled: true },
    { code: "USDC", type: "crypto", decimals: 6, enabled: true },
    { code: "SOL", type: "crypto", decimals: 9, enabled: false },
];

/** Fiat currencies a user can pick as display currency. */
export const DISPLAY_CURRENCIES = ["EUR", "USD", "GBP", "CHF"] as const;
export const DEFAULT_DISPLAY_CURRENCY = "EUR";

/** Placeholder unit prices in USD; admins can edit them in the admin panel. */
export const DEFAULT_USD_PRICES: Record<CurrencyCode, DecimalString> = {
    USD: "1",
    EUR: "1.08",
    GBP: "1.27",
    CHF: "1.12",
    BTC: "64000",
    ETH: "3200",
    USDT: "1",
    USDC: "1",
    SOL: "150",
};

/** The mock rates feed moves once per period; the UI polls at the same pace. */
export const RATES_REFRESH_MS = 30_000;

/** How long a locked conversion quote stays valid. */
export const QUOTE_TTL_MS = 15_000;

export const DEFAULT_FEES: FeeSettings = {
    conversionBps: 50,
    withdrawalBps: 25,
    transferBps: 0,
};

const FIAT_LIMITS: AmountLimits = { min: "10", max: "50000" };

export const DEFAULT_LIMITS: Record<CurrencyCode, AmountLimits> = {
    EUR: FIAT_LIMITS,
    USD: FIAT_LIMITS,
    GBP: FIAT_LIMITS,
    CHF: FIAT_LIMITS,
    BTC: { min: "0.0001", max: "5" },
    ETH: { min: "0.005", max: "100" },
    USDT: { min: "10", max: "100000" },
    USDC: { min: "10", max: "100000" },
    SOL: { min: "0.1", max: "1000" },
};

// Placeholder plans: amounts are minor units of `currency`.
export const DEFAULT_CARD_PLANS: CardPlan[] = [
    {
        id: "basic",
        rank: 0,
        price: "0",
        currency: "EUR",
        billing: "free",
        dailyLimit: "100000",
        atmLimit: "20000",
        support: "standard",
        cashbackBps: 0,
        extras: ["virtualCard"],
    },
    {
        id: "plus",
        rank: 1,
        price: "499",
        currency: "EUR",
        billing: "monthly",
        dailyLimit: "500000",
        atmLimit: "50000",
        support: "standard",
        cashbackBps: 50,
        extras: ["virtualCard", "freeFx"],
    },
    {
        id: "premium",
        rank: 2,
        price: "1499",
        currency: "EUR",
        billing: "monthly",
        popular: true,
        dailyLimit: "2000000",
        atmLimit: "150000",
        support: "priority",
        cashbackBps: 100,
        extras: ["virtualCard", "freeFx", "travelInsurance"],
    },
    {
        id: "elite",
        rank: 3,
        price: "29900",
        currency: "EUR",
        billing: "yearly",
        dailyLimit: "5000000",
        atmLimit: "300000",
        support: "dedicated",
        cashbackBps: 200,
        extras: ["virtualCard", "freeFx", "travelInsurance", "loungeAccess"],
    },
];

export const DEFAULT_PHYSICAL_CARD: PhysicalCardOffer = {
    price: "999",
    currency: "EUR",
    deliveryDays: { min: 5, max: 10 },
};

export const DEFAULT_CREDIT: CreditSettings = {
    currency: "EUR",
    limits: { min: "1000", max: "50000" },
    termMonths: { min: 6, max: 60 },
    aprBps: 899,
};

export type Network = "bitcoin" | "ethereum" | "tron" | "solana";

export const NETWORKS_BY_CURRENCY: Record<CurrencyCode, Network[]> = {
    BTC: ["bitcoin"],
    ETH: ["ethereum"],
    USDT: ["ethereum", "tron"],
    USDC: ["ethereum", "solana"],
    SOL: ["solana"],
};

/** Confirmations required before a crypto deposit is credited. */
export const NETWORK_CONFIRMATIONS: Record<Network, number> = {
    bitcoin: 3,
    ethereum: 12,
    tron: 20,
    solana: 32,
};
