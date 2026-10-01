"use client";

import { useLocale } from "next-intl";
import { useCallback, useMemo } from "react";
import { DEFAULT_CURRENCIES } from "@/config/currencies";
import type { Currency, CurrencyCode, Minor } from "@/domain/types";
import { formatMinor } from "@/lib/format";
import { usePlatformSettingsQuery } from "@/store/api";

/** Currency metadata from platform settings (config defaults while loading). */
export function useCurrencies(): Map<CurrencyCode, Currency> {
    const { data } = usePlatformSettingsQuery();
    return useMemo(
        () =>
            new Map(
                (data?.currencies ?? DEFAULT_CURRENCIES).map((c) => [
                    c.code,
                    c,
                ]),
            ),
        [data],
    );
}

export function useFormatMoney() {
    const language = useLocale();
    const currencies = useCurrencies();
    return useCallback(
        (
            amount: Minor,
            code: CurrencyCode,
            options?: Parameters<typeof formatMinor>[3],
        ) => {
            const currency = currencies.get(code) ?? {
                code,
                type: "crypto",
                decimals: 8,
            };
            return formatMinor(amount, currency, language, options);
        },
        [currencies, language],
    );
}
