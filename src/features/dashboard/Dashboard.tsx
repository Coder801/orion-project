"use client";

import {
    ArrowDownToLineIcon,
    ArrowRightIcon,
    ArrowUpFromLineIcon,
    CoinsIcon,
    ReceiptIcon,
    SendIcon,
    WalletIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ROUTES } from "@/config/routes";
import { availableBalance } from "@/domain/rules";
import type { Account, CurrencyType, User } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { CardWidget } from "@/features/dashboard/CardWidget";
import { PhysicalCardCta } from "@/features/dashboard/PhysicalCardCta";
import { TransactionsTable } from "@/features/dashboard/TransactionsTable";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { BalanceTotals } from "@/features/shared/BalanceTotals";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { Link } from "@/i18n/navigation";
import { useCurrencies, useFormatMoney } from "@/lib/hooks/useMoney";
import { cn } from "@/lib/utils";
import {
    useAccountsQuery,
    useMeQuery,
    useTransactionsQuery,
} from "@/store/api";

const RECENT_LIMIT = 10;

const QUICK_ACTIONS = [
    { href: ROUTES.deposit, key: "deposit", icon: ArrowDownToLineIcon },
    { href: ROUTES.withdraw, key: "withdraw", icon: ArrowUpFromLineIcon },
    { href: ROUTES.transfer, key: "transfer", icon: SendIcon },
] as const;

function Welcome({ user }: { user: User }) {
    const t = useTranslations("dashboard");
    const firstName = user.name.trim().split(/\s+/)[0] ?? user.name;
    return (
        <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                {t("welcome", { name: firstName })}
            </h2>
            <StatusBadge
                status={user.kycStatus}
                label={t("kyc", { status: t(`kycStatus.${user.kycStatus}`) })}
            />
        </div>
    );
}

function QuickActions() {
    const t = useTranslations("dashboard.actions");
    return (
        <nav aria-label={t("label")} className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map(({ href, key, icon: Icon }) => (
                <Button
                    key={key}
                    asChild
                    variant="outline"
                    className="h-auto flex-col gap-2 rounded-2xl py-4"
                >
                    <Link href={href}>
                        <span
                            aria-hidden
                            className="grid size-9 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary"
                        >
                            <Icon className="size-4" />
                        </span>
                        {t(key)}
                    </Link>
                </Button>
            ))}
        </nav>
    );
}

function AccountRow({ account }: { account: Account }) {
    const t = useTranslations("dashboard");
    const formatMoney = useFormatMoney();
    const currencies = useCurrencies();
    const type = currencies.get(account.currency)?.type ?? "crypto";
    const Icon = type === "crypto" ? CoinsIcon : WalletIcon;
    return (
        <li className="flex items-center gap-3 py-3">
            <span
                aria-hidden
                className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl border",
                    type === "crypto"
                        ? "border-accent/25 bg-accent/10 text-accent-foreground dark:text-accent"
                        : "border-primary/25 bg-primary/10 text-primary",
                )}
            >
                <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {accountLabel(account)}
                </p>
                <p className="text-xs text-muted-foreground">
                    {t(`accountType.${type}`)}
                    {account.hold !== "0" &&
                        ` · ${t("available")} ${formatMoney(availableBalance(account), account.currency)}`}
                </p>
            </div>
            <div className="text-right">
                <p className="font-medium tabular-nums">
                    {formatMoney(account.balance, account.currency)}
                </p>
                {account.hold !== "0" && (
                    <Badge variant="warning" className="px-2 py-0 text-[10px]">
                        {t("onHold")}
                    </Badge>
                )}
            </div>
        </li>
    );
}

function Accounts({ accounts }: { accounts: Account[] }) {
    const t = useTranslations("dashboard");
    const currencies = useCurrencies();
    const byType = (type: CurrencyType) =>
        accounts.filter(
            (a) => (currencies.get(a.currency)?.type ?? "crypto") === type,
        );

    return (
        <Panel title={t("accounts")}>
            <Tabs defaultValue="fiat">
                <TabsList aria-label={t("accounts")}>
                    {(["fiat", "crypto"] as const).map((type) => (
                        <TabsTrigger key={type} value={type}>
                            {t(`accountType.${type}`)}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(["fiat", "crypto"] as const).map((type) => {
                    const list = byType(type);
                    return (
                        <TabsContent key={type} value={type} className="mt-2">
                            {list.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    {t("noAccounts")}
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {list.map((account) => (
                                        <AccountRow
                                            key={account.id}
                                            account={account}
                                        />
                                    ))}
                                </ul>
                            )}
                        </TabsContent>
                    );
                })}
            </Tabs>
        </Panel>
    );
}

function RecentTransactions({ userId }: { userId: string }) {
    const t = useTranslations("dashboard");
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useTransactionsQuery({ userId, limit: RECENT_LIMIT });
    const isEmpty = data.length === 0;

    return (
        <Panel
            title={t("recentTransactions")}
            actions={
                <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link href={ROUTES.transactions}>
                        {t("viewAll")}
                        <ArrowRightIcon aria-hidden />
                    </Link>
                </Button>
            }
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

export function Dashboard() {
    const t = useTranslations("common");
    const session = useCurrentUser();
    const me = useMeQuery(session.id);
    const accounts = useAccountsQuery(session.id);

    return (
        <AsyncContent
            isLoading={me.isLoading || accounts.isLoading}
            isError={me.isError || accounts.isError}
            onRetry={() => {
                me.refetch();
                accounts.refetch();
            }}
            loadingLabel={t("loading")}
            skeleton={
                <div className="space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                    <Skeleton className="h-56 rounded-2xl" />
                </div>
            }
        >
            {me.data && accounts.data && (
                <div className="space-y-6">
                    <Welcome user={me.data} />
                    <BalanceTotals accounts={accounts.data} />
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
                        <CardWidget user={me.data} accounts={accounts.data} />
                        <div className="space-y-6">
                            <QuickActions />
                            <PhysicalCardCta
                                user={me.data}
                                accounts={accounts.data}
                            />
                        </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
                        <Accounts accounts={accounts.data} />
                        <RecentTransactions userId={session.id} />
                    </div>
                </div>
            )}
        </AsyncContent>
    );
}
