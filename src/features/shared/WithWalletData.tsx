"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { Account, PlatformSettings } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { useAccountsQuery, usePlatformSettingsQuery } from "@/store/api";

export interface WalletData {
    settings: PlatformSettings;
    accounts: Account[];
}

/** Loads platform settings + the user's accounts that every money form needs. */
export function WithWalletData({
    children,
}: {
    children: (data: WalletData) => ReactNode;
}) {
    const t = useTranslations("common");
    const user = useCurrentUser();
    const settings = usePlatformSettingsQuery();
    const accounts = useAccountsQuery(user.id);

    return (
        <AsyncContent
            isLoading={settings.isLoading || accounts.isLoading}
            isError={settings.isError || accounts.isError}
            onRetry={() => {
                settings.refetch();
                accounts.refetch();
            }}
            loadingLabel={t("loading")}
        >
            {settings.data &&
                accounts.data &&
                children({ settings: settings.data, accounts: accounts.data })}
        </AsyncContent>
    );
}
