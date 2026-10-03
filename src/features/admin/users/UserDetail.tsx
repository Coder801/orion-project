"use client";

import {
    ArrowLeftIcon,
    ReceiptIcon,
    SlidersHorizontalIcon,
    UserXIcon,
    WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ROUTES } from "@/config/routes";
import { availableBalance } from "@/domain/rules";
import type { Account, User } from "@/domain/types";
import { RequestsQueue } from "@/features/admin/RequestsQueue";
import {
    AdjustBalanceDialog,
    type AdjustTarget,
} from "@/features/admin/users/AdjustBalanceDialog";
import { RoleBadge } from "@/features/admin/users/UsersList";
import { useCurrentUser } from "@/features/auth/session";
import { TransactionsTable } from "@/features/dashboard/TransactionsTable";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { BalanceTotals } from "@/features/shared/BalanceTotals";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { SummaryList } from "@/features/shared/SummaryList";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import {
    useAdminUserAccountsQuery,
    useAdminUserQuery,
    useAdminUserTransactionsQuery,
    usePlatformSettingsQuery,
} from "@/store/api";

const TABS = ["profile", "accounts", "transactions", "requests"] as const;
type Tab = (typeof TABS)[number];

// Tables render inside flush panels, so their non-table states need padding.
const FLUSH_STATE = "m-5 lg:m-6";

function Profile({ user }: { user: User }) {
    const t = useTranslations("admin.users");
    const tv = useTranslations("verification");
    const tp = useTranslations("cards.plans");
    const language = useLocale();
    const dash = "—";
    return (
        <Panel>
            <SummaryList
                items={[
                    [t("email"), user.email],
                    [t("name"), user.name],
                    [t("role"), <RoleBadge key="role" role={user.role} />],
                    [
                        t("kycStatus"),
                        <StatusBadge key="kyc" status={user.kycStatus} />,
                    ],
                    [t("profile.phone"), user.phone ?? dash],
                    [
                        t("profile.country"),
                        user.country
                            ? tv(`countries.${user.country as "DE"}`)
                            : dash,
                    ],
                    [
                        t("profile.displayCurrency"),
                        user.displayCurrency ?? "EUR",
                    ],
                    [
                        t("profile.cardPlan"),
                        tp((user.cardPlan ?? "basic") as "basic"),
                    ],
                    [
                        t("profile.twoFactor"),
                        user.twoFactorEnabled
                            ? t("profile.on")
                            : t("profile.off"),
                    ],
                    [
                        t("registered"),
                        formatDate(user.createdAt, language, "dateTime"),
                    ],
                ]}
            />
        </Panel>
    );
}

function AccountsTable({
    accounts,
    onAdjust,
}: {
    accounts: Account[];
    onAdjust: (currency: string) => void;
}) {
    const t = useTranslations("admin.users.accounts");
    const formatMoney = useFormatMoney();
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5 lg:pl-6">
                        {t("currency")}
                    </TableHead>
                    <TableHead className="text-right">{t("balance")}</TableHead>
                    <TableHead className="text-right">{t("hold")}</TableHead>
                    <TableHead className="text-right">
                        {t("available")}
                    </TableHead>
                    <TableHead className="pr-5 lg:pr-6">
                        <span className="sr-only">{t("adjust")}</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {accounts.map((account) => (
                    <TableRow key={account.id}>
                        <TableCell className="pl-5 font-medium lg:pl-6">
                            {account.currency}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatMoney(account.balance, account.currency)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground tabular-nums">
                            {formatMoney(account.hold, account.currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                            {formatMoney(
                                availableBalance(account),
                                account.currency,
                            )}
                        </TableCell>
                        <TableCell className="pr-5 text-right lg:pr-6">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onAdjust(account.currency)}
                                aria-label={`${t("adjust")}: ${account.currency}`}
                            >
                                <SlidersHorizontalIcon aria-hidden />
                                {t("adjust")}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function Balances({ adminId, userId }: { adminId: string; userId: string }) {
    const t = useTranslations("admin.users");
    const scope = { adminId, userId };
    const {
        data: accounts = [],
        isLoading,
        isError,
        refetch,
    } = useAdminUserAccountsQuery(scope);
    const { data: settings } = usePlatformSettingsQuery();
    const [target, setTarget] = useState<AdjustTarget | null>(null);
    const isEmpty = accounts.length === 0;

    return (
        <div className="space-y-6">
            {!isEmpty && <BalanceTotals accounts={accounts} />}
            <Panel
                title={t("tabs.accounts")}
                actions={
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={!settings}
                        onClick={() => setTarget({})}
                    >
                        <SlidersHorizontalIcon aria-hidden />
                        {t("adjust.open")}
                    </Button>
                }
                flush={!isLoading && !isError && !isEmpty}
            >
                <AsyncContent
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={isEmpty}
                    onRetry={refetch}
                    loadingLabel={t("tabs.accounts")}
                    empty={{ title: t("accounts.empty"), icon: WalletIcon }}
                >
                    <AccountsTable
                        accounts={accounts}
                        onAdjust={(currency) => setTarget({ currency })}
                    />
                </AsyncContent>
            </Panel>
            {settings && (
                <AdjustBalanceDialog
                    target={target}
                    onClose={() => setTarget(null)}
                    adminId={adminId}
                    userId={userId}
                    accounts={accounts}
                    currencies={settings.currencies}
                />
            )}
        </div>
    );
}

function Transactions({
    adminId,
    userId,
}: {
    adminId: string;
    userId: string;
}) {
    const t = useTranslations("admin.users");
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAdminUserTransactionsQuery({ adminId, userId });
    return (
        <Panel flush>
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={data.length === 0}
                onRetry={refetch}
                loadingLabel={t("tabs.transactions")}
                stateClassName={FLUSH_STATE}
                empty={{ title: t("noTransactions"), icon: ReceiptIcon }}
            >
                <TransactionsTable transactions={data} />
            </AsyncContent>
        </Panel>
    );
}

/** Admin view of one user: profile, balances (with adjustments), history, requests. */
export function UserDetail({ userId }: { userId: string }) {
    const t = useTranslations("admin.users");
    const admin = useCurrentUser();
    const {
        data: user,
        isLoading,
        isError,
        refetch,
    } = useAdminUserQuery({ adminId: admin.id, userId });
    const [tab, setTab] = useState<Tab>("profile");

    const back = (
        <Button asChild size="sm" variant="ghost" className="mb-4 -ml-2">
            <Link href={ROUTES.adminUsers}>
                <ArrowLeftIcon aria-hidden />
                {t("back")}
            </Link>
        </Button>
    );

    if (!user)
        return (
            <>
                {back}
                <AsyncContent
                    isLoading={isLoading}
                    isError={isError}
                    onRetry={refetch}
                    loadingLabel={t("loading")}
                >
                    <EmptyState title={t("notFound")} icon={UserXIcon} />
                </AsyncContent>
            </>
        );

    const isAdmin = user.role === "admin";
    return (
        <>
            {back}
            <PageHeader
                title={user.name}
                description={user.email}
                actions={
                    <>
                        <RoleBadge role={user.role} />
                        {!isAdmin && <StatusBadge status={user.kycStatus} />}
                    </>
                }
            />
            {isAdmin ? (
                <div className="space-y-6">
                    <Profile user={user} />
                    <p className="text-sm text-muted-foreground">
                        {t("adminNoData")}
                    </p>
                </div>
            ) : (
                <Tabs
                    value={tab}
                    onValueChange={(value) => setTab(value as Tab)}
                >
                    <TabsList aria-label={t("tabs.label")} className="mb-6">
                        {TABS.map((value) => (
                            <TabsTrigger key={value} value={value}>
                                {t(`tabs.${value}`)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value="profile">
                        <Profile user={user} />
                    </TabsContent>
                    <TabsContent value="accounts">
                        <Balances adminId={admin.id} userId={user.id} />
                    </TabsContent>
                    <TabsContent value="transactions">
                        <Transactions adminId={admin.id} userId={user.id} />
                    </TabsContent>
                    <TabsContent value="requests">
                        <RequestsQueue userId={user.id} />
                    </TabsContent>
                </Tabs>
            )}
        </>
    );
}
