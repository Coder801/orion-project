"use client";

import {
    BellIcon,
    CheckCheckIcon,
    CoinsIcon,
    ReceiptIcon,
    WalletIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { availableBalance } from "@/domain/rules";
import type { Account } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { TransactionsTable } from "@/features/dashboard/transactions-table";
import { NotificationText } from "@/features/notifications/notification-text";
import { AsyncContent } from "@/features/shared/async-content";
import { Panel } from "@/features/shared/panel";
import { useCurrencies, useFormatMoney } from "@/lib/hooks/useMoney";
import { cn } from "@/lib/utils";
import {
    useAccountsQuery,
    useMarkNotificationsReadMutation,
    useNotificationsQuery,
    useTransactionsQuery,
} from "@/store/api";

function BalanceCard({ account }: { account: Account }) {
    const t = useTranslations("dashboard");
    const formatMoney = useFormatMoney();
    const currencies = useCurrencies();
    const isCrypto = currencies.get(account.currency)?.type === "crypto";
    const Icon = isCrypto ? CoinsIcon : WalletIcon;

    return (
        <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30">
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute -top-12 -right-12 size-32 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100",
                    isCrypto ? "bg-accent/10" : "bg-primary/10",
                    "opacity-60",
                )}
            />
            <div className="relative flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span
                        aria-hidden
                        className={cn(
                            "flex size-6 items-center justify-center rounded-lg border",
                            isCrypto
                                ? "border-accent/25 bg-accent/10 text-accent-foreground dark:text-accent"
                                : "border-primary/25 bg-primary/10 text-primary",
                        )}
                    >
                        <Icon className="size-3.5" />
                    </span>
                    {accountLabel(account)}
                </p>
                {account.hold !== "0" && (
                    <Badge variant="warning" className="px-2 py-0 text-[10px]">
                        {t("onHold")}
                    </Badge>
                )}
            </div>
            <p className="relative mt-3 font-heading text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                {formatMoney(account.balance, account.currency)}
            </p>
            <dl className="relative mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                <div>
                    <dt className="text-muted-foreground">{t("available")}</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">
                        {formatMoney(
                            availableBalance(account),
                            account.currency,
                        )}
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">{t("hold")}</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">
                        {formatMoney(account.hold, account.currency)}
                    </dd>
                </div>
            </dl>
        </div>
    );
}

function Balances({ userId }: { userId: string }) {
    const t = useTranslations("dashboard");
    const { data = [], isLoading, isError, refetch } = useAccountsQuery(userId);

    return (
        <section aria-labelledby="balances-title">
            <h2
                id="balances-title"
                className="mb-3 font-heading text-base font-semibold"
            >
                {t("balances")}
            </h2>
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={data.length === 0}
                onRetry={refetch}
                loadingLabel={t("balances")}
                empty={{ title: t("noAccounts"), icon: WalletIcon }}
                skeleton={
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-40 rounded-2xl" />
                        ))}
                    </div>
                }
            >
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {data.map((account) => (
                        <li key={account.id}>
                            <BalanceCard account={account} />
                        </li>
                    ))}
                </ul>
            </AsyncContent>
        </section>
    );
}

function RecentTransactions({ userId }: { userId: string }) {
    const t = useTranslations("dashboard");
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useTransactionsQuery({
        userId,
        limit: 5,
    });
    const isEmpty = data.length === 0;

    return (
        <Panel
            title={t("recentTransactions")}
            flush={!isLoading && !isError && !isEmpty}
        >
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={isEmpty}
                onRetry={refetch}
                loadingLabel={t("recentTransactions")}
                empty={{ title: t("noTransactions"), icon: ReceiptIcon }}
            >
                <TransactionsTable transactions={data} />
            </AsyncContent>
        </Panel>
    );
}

function Notifications({ userId }: { userId: string }) {
    const t = useTranslations("dashboard");
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useNotificationsQuery(userId);
    const [markRead, { isLoading: isMarking }] =
        useMarkNotificationsReadMutation();
    const unread = data.filter((n) => !n.read).length;

    return (
        <Panel
            title={
                <>
                    {t("notifications")}
                    {unread > 0 && (
                        <Badge variant="glow" className="px-2 py-0 text-[10px]">
                            {unread}
                        </Badge>
                    )}
                </>
            }
            actions={
                unread > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        disabled={isMarking}
                        onClick={() => markRead(userId)}
                    >
                        <CheckCheckIcon aria-hidden />
                        {t("markAllRead")}
                    </Button>
                )
            }
        >
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={data.length === 0}
                onRetry={refetch}
                loadingLabel={t("notifications")}
                empty={{ title: t("noNotifications"), icon: BellIcon }}
            >
                <ul className="-my-3 divide-y">
                    {data.slice(0, 8).map((n) => (
                        <li key={n.id} className="flex items-start gap-3 py-3">
                            <span
                                aria-hidden
                                className={cn(
                                    "mt-1.5 size-2 shrink-0 rounded-full",
                                    !n.read &&
                                        "bg-primary shadow-[0_0_8px_var(--glow-primary)]",
                                )}
                            />
                            <div className="min-w-0 flex-1">
                                <NotificationText notification={n} />
                            </div>
                        </li>
                    ))}
                </ul>
            </AsyncContent>
        </Panel>
    );
}

export function Dashboard() {
    const user = useCurrentUser();
    return (
        <div className="space-y-6">
            <Balances userId={user.id} />
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <RecentTransactions userId={user.id} />
                <Notifications userId={user.id} />
            </div>
        </div>
    );
}
