"use client";

import { InfoIcon, WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/Badge";
import {
    accountLabel,
    accountNumberFor,
    routingCodeFor,
    walletAddressFor,
} from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { CopyValue } from "@/features/shared/CopyValue";
import { Panel } from "@/features/shared/Panel";
import { useCurrencies } from "@/lib/hooks/useMoney";
import { useAccountsQuery } from "@/store/api";

export function AccountDetails() {
    const t = useTranslations("accountDetails");
    const user = useCurrentUser();
    const currencies = useCurrencies();
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAccountsQuery(user.id);

    return (
        <div className="space-y-6">
            <p className="flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 text-sm text-muted-foreground">
                <InfoIcon
                    className="mt-0.5 size-4 shrink-0 text-accent-foreground dark:text-accent"
                    aria-hidden
                />
                {t("disclaimer")}
            </p>
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={data.length === 0}
                onRetry={refetch}
                loadingLabel={t("title")}
                empty={{ title: t("empty"), icon: WalletIcon }}
            >
                <ul className="grid gap-4 lg:grid-cols-2">
                    {data.map((account) => {
                        const isFiat =
                            currencies.get(account.currency)?.type === "fiat";
                        return (
                            <li key={account.id}>
                                <Panel
                                    className="h-full"
                                    title={accountLabel(account)}
                                    actions={
                                        <Badge
                                            variant={isFiat ? "glow" : "accent"}
                                            className="px-2 py-0 text-[10px]"
                                        >
                                            {t(isFiat ? "fiat" : "crypto")}
                                        </Badge>
                                    }
                                >
                                    <dl className="-my-2.5 divide-y">
                                        {isFiat ? (
                                            <>
                                                <CopyValue
                                                    label={t("holder")}
                                                    value={user.name}
                                                />
                                                <CopyValue
                                                    label={t("accountNumber")}
                                                    value={accountNumberFor(
                                                        account,
                                                    )}
                                                />
                                                <CopyValue
                                                    label={t("routingCode")}
                                                    value={routingCodeFor(
                                                        account,
                                                    )}
                                                />
                                            </>
                                        ) : (
                                            <CopyValue
                                                label={t("walletAddress")}
                                                value={walletAddressFor(
                                                    account,
                                                )}
                                            />
                                        )}
                                        <CopyValue
                                            label={t("currency")}
                                            value={account.currency}
                                        />
                                    </dl>
                                </Panel>
                            </li>
                        );
                    })}
                </ul>
            </AsyncContent>
        </div>
    );
}
