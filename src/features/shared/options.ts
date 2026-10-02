"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import type { SelectOption } from "@/components/ui/FormField";
import { availableBalance } from "@/domain/rules";
import type { Account, Currency, CurrencyType } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrencies, useFormatMoney } from "@/lib/hooks/useMoney";

const TYPE_ORDER: Record<CurrencyType, number> = { fiat: 0, crypto: 1 };

/** Select options grouped under "Fiat" / "Crypto" (fiat first). */
export function useGroupedOptions() {
    const t = useTranslations("common");
    const currencies = useCurrencies();
    const formatMoney = useFormatMoney();

    const currencyOptions = useCallback(
        (list: Currency[]): SelectOption[] =>
            [...list]
                .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
                .map((c) => ({
                    value: c.code,
                    label: c.code,
                    group: t(c.type),
                })),
        [t],
    );

    const accountOptions = useCallback(
        (list: Account[]): SelectOption[] =>
            list
                .map((a) => ({
                    account: a,
                    type: currencies.get(a.currency)?.type ?? "crypto",
                }))
                .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
                .map(({ account, type }) => ({
                    value: account.id,
                    label: `${accountLabel(account)} — ${formatMoney(availableBalance(account), account.currency)}`,
                    group: t(type),
                })),
        [currencies, formatMoney, t],
    );

    return { currencyOptions, accountOptions };
}
