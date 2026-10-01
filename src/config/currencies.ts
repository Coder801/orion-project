import type {
    Currency,
    CurrencyCode,
    DecimalString,
    FeeSettings,
} from "@/domain/types";

export const DEFAULT_CURRENCIES: Currency[] = [
    { code: "EUR", type: "fiat", decimals: 2, enabled: true },
    { code: "USD", type: "fiat", decimals: 2, enabled: true },
    { code: "GBP", type: "fiat", decimals: 2, enabled: true },
    { code: "BTC", type: "crypto", decimals: 8, enabled: true },
    { code: "ETH", type: "crypto", decimals: 8, enabled: true },
    { code: "USDT", type: "crypto", decimals: 6, enabled: true },
    { code: "SOL", type: "crypto", decimals: 9, enabled: false },
];

/** Placeholder unit prices in USD; admins can edit them in the admin panel. */
export const DEFAULT_USD_PRICES: Record<CurrencyCode, DecimalString> = {
    USD: "1",
    EUR: "1.08",
    GBP: "1.27",
    BTC: "64000",
    ETH: "3200",
    USDT: "1",
    SOL: "150",
};

export const DEFAULT_FEES: FeeSettings = {
    conversionBps: 50,
    withdrawalBps: 25,
    transferBps: 0,
};

export type Network = "bitcoin" | "ethereum" | "tron" | "solana";

export const NETWORKS_BY_CURRENCY: Record<CurrencyCode, Network[]> = {
    BTC: ["bitcoin"],
    ETH: ["ethereum"],
    USDT: ["ethereum", "tron"],
    SOL: ["solana"],
};
