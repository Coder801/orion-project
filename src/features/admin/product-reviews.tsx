"use client";

import { CreditCardIcon, LandmarkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ReviewActions,
    ReviewDialog,
    useUserEmails,
    type ReviewTarget,
} from "@/features/admin/review";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/async-content";
import { Panel } from "@/features/shared/panel";
import { StatusBadge } from "@/features/shared/status-badge";
import { formatDate } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import {
    useAdminCardOrdersQuery,
    useAdminCreditsQuery,
    useReviewCardOrderMutation,
    useReviewCreditMutation,
} from "@/store/api";

export function CreditReviews() {
    const t = useTranslations("admin");
    const tc = useTranslations("credit");
    const language = useLocale();
    const formatMoney = useFormatMoney();
    const admin = useCurrentUser();
    const emails = useUserEmails(admin.id);
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAdminCreditsQuery(admin.id);
    const [review, { isLoading: isReviewing }] = useReviewCreditMutation();
    const [target, setTarget] = useState<ReviewTarget | null>(null);
    const isEmpty = data.length === 0;

    return (
        <>
            <Panel flush={!isLoading && !isError && !isEmpty}>
                <AsyncContent
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={isEmpty}
                    onRetry={refetch}
                    loadingLabel={t("credits.title")}
                    empty={{ title: tc("empty"), icon: LandmarkIcon }}
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-5 lg:pl-6">
                                    {tc("fields.date")}
                                </TableHead>
                                <TableHead>{t("requests.user")}</TableHead>
                                <TableHead>{tc("fields.amount")}</TableHead>
                                <TableHead>{tc("fields.term")}</TableHead>
                                <TableHead>{tc("fields.purpose")}</TableHead>
                                <TableHead>{tc("fields.income")}</TableHead>
                                <TableHead>{tc("fields.status")}</TableHead>
                                <TableHead className="pr-5 text-right lg:pr-6">
                                    <span className="sr-only">
                                        {t("requests.actions")}
                                    </span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                        {formatDate(c.createdAt, language)}
                                    </TableCell>
                                    <TableCell>
                                        {emails.get(c.userId) ?? c.userId}
                                    </TableCell>
                                    <TableCell className="tabular-nums">
                                        {formatMoney(c.amount, c.currency)}
                                    </TableCell>
                                    <TableCell>
                                        {tc("months", { count: c.termMonths })}
                                    </TableCell>
                                    <TableCell>
                                        {tc(`purposes.${c.purpose}`)}
                                    </TableCell>
                                    <TableCell className="tabular-nums">
                                        {formatMoney(
                                            c.monthlyIncome,
                                            c.currency,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={c.status} />
                                    </TableCell>
                                    <TableCell className="pr-5 lg:pr-6">
                                        <ReviewActions
                                            status={c.status}
                                            onReview={(decision) =>
                                                setTarget({
                                                    id: c.id,
                                                    decision,
                                                })
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </AsyncContent>
            </Panel>
            <ReviewDialog
                target={target}
                adminId={admin.id}
                onClose={() => setTarget(null)}
                review={review}
                isLoading={isReviewing}
            />
        </>
    );
}

export function CardOrderReviews() {
    const t = useTranslations("admin");
    const tc = useTranslations("cards");
    const language = useLocale();
    const admin = useCurrentUser();
    const emails = useUserEmails(admin.id);
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAdminCardOrdersQuery(admin.id);
    const [review, { isLoading: isReviewing }] = useReviewCardOrderMutation();
    const [target, setTarget] = useState<ReviewTarget | null>(null);
    const isEmpty = data.length === 0;

    return (
        <>
            <Panel flush={!isLoading && !isError && !isEmpty}>
                <AsyncContent
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={isEmpty}
                    onRetry={refetch}
                    loadingLabel={t("cardOrders.title")}
                    empty={{ title: tc("empty"), icon: CreditCardIcon }}
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-5 lg:pl-6">
                                    {tc("fields.date")}
                                </TableHead>
                                <TableHead>{t("requests.user")}</TableHead>
                                <TableHead>{tc("fields.type")}</TableHead>
                                <TableHead>{tc("fields.tier")}</TableHead>
                                <TableHead>
                                    {tc("fields.deliveryAddress")}
                                </TableHead>
                                <TableHead>{tc("fields.status")}</TableHead>
                                <TableHead className="pr-5 text-right lg:pr-6">
                                    <span className="sr-only">
                                        {t("requests.actions")}
                                    </span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                        {formatDate(order.createdAt, language)}
                                    </TableCell>
                                    <TableCell>
                                        {emails.get(order.userId) ??
                                            order.userId}
                                    </TableCell>
                                    <TableCell>
                                        {tc(`types.${order.type}`)}
                                    </TableCell>
                                    <TableCell>
                                        {tc(`tiers.${order.tier}.name`)}
                                    </TableCell>
                                    <TableCell className="max-w-56 truncate text-muted-foreground">
                                        {order.deliveryAddress ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell className="pr-5 lg:pr-6">
                                        <ReviewActions
                                            status={order.status}
                                            onReview={(decision) =>
                                                setTarget({
                                                    id: order.id,
                                                    decision,
                                                })
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </AsyncContent>
            </Panel>
            <ReviewDialog
                target={target}
                adminId={admin.id}
                onClose={() => setTarget(null)}
                review={review}
                isLoading={isReviewing}
            />
        </>
    );
}
