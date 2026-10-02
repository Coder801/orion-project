"use client";

import { useMemo } from "react";
import {
    DEFAULT_DISPLAY_CURRENCY,
    RATES_REFRESH_MS,
} from "@/config/currencies";
import type { CurrencyCode } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import {
    useMeQuery,
    usePlatformSettingsQuery,
    useRatesQuery,
} from "@/store/api";

/** The user's display currency (global: every total and equivalent uses it). */
export function useDisplayCurrency(): CurrencyCode {
    const user = useCurrentUser();
    const { data } = useMeQuery(user.id);
    return data?.displayCurrency ?? DEFAULT_DISPLAY_CURRENCY;
}

/**
 * Indicative prices (RTK Query caches them for 60 s). `live` polls the feed so
 * the numbers move with it. `source` is ready for `domain/portfolio` helpers.
 */
export function useRates({ live = false }: { live?: boolean } = {}) {
    const rates = useRatesQuery(undefined, {
        pollingInterval: live ? RATES_REFRESH_MS : 0,
        skipPollingIfUnfocused: true,
    });
    const settings = usePlatformSettingsQuery();
    const source = useMemo(
        () =>
            rates.data && settings.data
                ? {
                      currencies: settings.data.currencies,
                      usdPrices: rates.data.usdPrices,
                  }
                : null,
        [rates.data, settings.data],
    );
    return {
        source,
        updatedAt: rates.data?.updatedAt,
        isLoading: rates.isLoading || settings.isLoading,
        isError: rates.isError || settings.isError,
        refetch: () => {
            rates.refetch();
            settings.refetch();
        },
    };
}
