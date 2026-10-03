"use client";

import { ClipboardListIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { SelectField } from "@/components/ui/FormField";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import type { AnyRequest, RequestKind, ReviewStatus } from "@/domain/types";
import {
    DetailList,
    ReviewActions,
    ReviewDialog,
    UserLink,
    useUserEmails,
    type ReviewTarget,
} from "@/features/admin/Review";
import { useCurrentUser } from "@/features/auth/session";
import { RequestAmount } from "@/features/payments/RequestAmount";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { MoneyPausedNotice } from "@/features/shared/MoneyPausedNotice";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatDate, formatDecimal } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { useAdminRequestsQuery, useReviewRequestMutation } from "@/store/api";

const ALL = "all";
const STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];
const ALL_KINDS: RequestKind[] = [
    "deposit",
    "withdrawal",
    "transfer",
    "conversion",
    "card",
];

function currencyOf(request: AnyRequest): string {
    return request.kind === "conversion"
        ? request.payload.from
        : request.payload.currency;
}

function RequestDetails({
    request,
    email,
}: {
    request: AnyRequest;
    email: string;
}) {
    const t = useTranslations("admin.requests");
    const tr = useTranslations("requests");
    const language = useLocale();
    const formatMoney = useFormatMoney();
    const items: [string, ReactNode][] = [
        [t("user"), email],
        [tr("kind"), tr(`kinds.${request.kind}`)],
        [tr("amount"), <RequestAmount key="amount" request={request} />],
    ];
    const { payload } = request;
    if (request.kind === "conversion") {
        items.push([t("rate"), formatDecimal(request.payload.rate, language)]);
    }
    items.push([t("fee"), formatMoney(payload.fee, currencyOf(request))]);
    if (request.kind === "transfer") {
        const { target } = request.payload;
        if (target.kind === "external") {
            const { beneficiary } = target;
            items.push(
                [t("rail"), t(`rails.${target.rail}`)],
                [t("beneficiary"), beneficiary.name],
            );
            if (beneficiary.iban) items.push(["IBAN", beneficiary.iban]);
            if (beneficiary.bic) items.push(["BIC", beneficiary.bic]);
            if (beneficiary.bankAddress)
                items.push([
                    t("bankAddress"),
                    `${beneficiary.bankAddress} (${beneficiary.bankCountry ?? ""})`,
                ]);
            if (beneficiary.cardLast4)
                items.push([t("card"), `•••• ${beneficiary.cardLast4}`]);
            if (target.reference)
                items.push([t("reference"), target.reference]);
        } else {
            items.push([
                t("target"),
                target.kind === "own" ? t("ownAccount") : target.email,
            ]);
        }
    }
    if (request.kind === "card") {
        const { product } = request.payload;
        items.push([
            t("product"),
            product.kind === "plan"
                ? t("planProduct", { plan: product.plan })
                : t("physicalCardProduct"),
        ]);
        if (product.kind === "physicalCard")
            items.push([t("deliveryAddress"), product.deliveryAddress]);
    }
    if (request.kind === "deposit" || request.kind === "withdrawal") {
        items.push([t("method"), request.method]);
        for (const [key, value] of Object.entries(request.payload.fields)) {
            if (value) items.push([key, value]);
        }
    }
    return <DetailList items={items} />;
}

/**
 * Review queue for money-movement requests of the given kinds; with `userId`
 * it shows that user's requests only (the admin user page).
 */
export function RequestsQueue({
    kinds = ALL_KINDS,
    userId,
}: {
    kinds?: RequestKind[];
    userId?: string;
}) {
    const t = useTranslations("admin.requests");
    const tr = useTranslations("requests");
    const ts = useTranslations("status");
    const language = useLocale();
    const admin = useCurrentUser();
    const emails = useUserEmails(admin.id);
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAdminRequestsQuery(admin.id);
    const [review, { isLoading: isReviewing }] = useReviewRequestMutation();
    const [target, setTarget] = useState<ReviewTarget | null>(null);
    const [status, setStatus] = useState<string>(userId ? ALL : "pending");
    const [kind, setKind] = useState<string>(ALL);
    const [currency, setCurrency] = useState<string>(ALL);

    const scoped = data.filter(
        (r) => kinds.includes(r.kind) && (!userId || r.userId === userId),
    );
    const currencies = [...new Set(scoped.map(currencyOf))].sort();
    const rows = scoped.filter(
        (r) =>
            (status === ALL || r.status === status) &&
            (kind === ALL || r.kind === kind) &&
            (currency === ALL || currencyOf(r) === currency),
    );
    const selected = data.find((r) => r.id === target?.id);
    const allOption = { value: ALL, label: t("all") };
    const isEmpty = rows.length === 0;

    return (
        <div className="space-y-6">
            <MoneyPausedNotice />
            <Panel
                toolbar={
                    <div className="grid gap-3 sm:grid-cols-3">
                        <SelectField
                            label={t("filters.status")}
                            value={status}
                            onChange={setStatus}
                            options={[
                                allOption,
                                ...STATUSES.map((s) => ({
                                    value: s,
                                    label: ts(s),
                                })),
                            ]}
                        />
                        {kinds.length > 1 && (
                            <SelectField
                                label={t("filters.type")}
                                value={kind}
                                onChange={setKind}
                                options={[
                                    allOption,
                                    ...kinds.map((k) => ({
                                        value: k,
                                        label: tr(`kinds.${k}`),
                                    })),
                                ]}
                            />
                        )}
                        <SelectField
                            label={t("filters.currency")}
                            value={currency}
                            onChange={setCurrency}
                            options={[
                                allOption,
                                ...currencies.map((c) => ({
                                    value: c,
                                    label: c,
                                })),
                            ]}
                        />
                    </div>
                }
                flush={!isLoading && !isError && !isEmpty}
            >
                <AsyncContent
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={isEmpty}
                    onRetry={refetch}
                    loadingLabel={t("loading")}
                    empty={{ title: t("empty"), icon: ClipboardListIcon }}
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-5 lg:pl-6">
                                    {tr("date")}
                                </TableHead>
                                {!userId && <TableHead>{t("user")}</TableHead>}
                                <TableHead>{tr("kind")}</TableHead>
                                <TableHead>{tr("amount")}</TableHead>
                                <TableHead>{tr("status")}</TableHead>
                                <TableHead className="pr-5 text-right lg:pr-6">
                                    <span className="sr-only">
                                        {t("actions")}
                                    </span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                        {formatDate(
                                            request.createdAt,
                                            language,
                                            "dateTime",
                                        )}
                                    </TableCell>
                                    {!userId && (
                                        <TableCell className="max-w-48 truncate">
                                            <UserLink
                                                userId={request.userId}
                                                emails={emails}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {tr(`kinds.${request.kind}`)}
                                    </TableCell>
                                    <TableCell className="tabular-nums">
                                        <RequestAmount request={request} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={request.status} />
                                        {request.reason && (
                                            <p className="mt-1 max-w-48 truncate text-xs text-muted-foreground">
                                                {request.reason}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell className="pr-5 lg:pr-6">
                                        <ReviewActions
                                            status={request.status}
                                            onReview={(decision) =>
                                                setTarget({
                                                    id: request.id,
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
            >
                {selected && (
                    <RequestDetails
                        request={selected}
                        email={emails.get(selected.userId) ?? ""}
                    />
                )}
            </ReviewDialog>
        </div>
    );
}
