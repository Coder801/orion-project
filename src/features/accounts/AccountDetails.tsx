"use client";

import { CheckIcon, CopyIcon, InfoIcon, WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    accountLabel,
    accountNumberFor,
    routingCodeFor,
    walletAddressFor,
} from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { Panel } from "@/features/shared/Panel";
import { copyToClipboard } from "@/lib/utils";
import { useCurrencies } from "@/lib/hooks/useMoney";
import { useAccountsQuery } from "@/store/api";

function CopyValue({ label, value }: { label: string; value: string }) {
    const t = useTranslations("accountDetails");
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        // Clipboard can be blocked; the value stays selectable.
        if (await copyToClipboard(value)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 truncate font-mono text-sm">{value}</dd>
            </div>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={copy}
                aria-label={copied ? t("copied") : t("copy", { label })}
            >
                {copied ? (
                    <CheckIcon className="text-success" aria-hidden />
                ) : (
                    <CopyIcon aria-hidden />
                )}
            </Button>
        </div>
    );
}

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
