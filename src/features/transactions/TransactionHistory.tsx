"use client";

import { ReceiptIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { SelectField } from "@/components/ui/FormField";
import type { TransactionStatus, TransactionType } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { TransactionsTable } from "@/features/dashboard/TransactionsTable";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { Panel } from "@/features/shared/Panel";
import { useTransactionsQuery } from "@/store/api";

const ALL = "all";
const TYPES: TransactionType[] = [
    "deposit",
    "withdrawal",
    "transfer",
    "conversion",
    "card",
];
const STATUSES: TransactionStatus[] = ["pending", "completed", "failed"];

/** Full history with filters; `?request=<id>` highlights that request's entries. */
export function TransactionHistory() {
    const t = useTranslations("transactions");
    const ts = useTranslations("status");
    const user = useCurrentUser();
    const highlight = useSearchParams().get("request");
    const [type, setType] = useState<string>(ALL);
    const [status, setStatus] = useState<string>(ALL);
    const [currency, setCurrency] = useState<string>(ALL);
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useTransactionsQuery({ userId: user.id });

    const currencies = [...new Set(data.map((tx) => tx.currency))].sort();
    const rows = data.filter(
        (tx) =>
            (type === ALL || tx.type === type) &&
            (status === ALL || tx.status === status) &&
            (currency === ALL || tx.currency === currency),
    );
    const isEmpty = rows.length === 0;
    const all = { value: ALL, label: t("all") };

    return (
        <Panel
            toolbar={
                <div className="grid gap-3 sm:grid-cols-3">
                    <SelectField
                        label={t("type")}
                        value={type}
                        onChange={setType}
                        options={[
                            all,
                            ...TYPES.map((v) => ({
                                value: v,
                                label: t(`types.${v}`),
                            })),
                        ]}
                    />
                    <SelectField
                        label={t("status")}
                        value={status}
                        onChange={setStatus}
                        options={[
                            all,
                            ...STATUSES.map((v) => ({
                                value: v,
                                label: ts(v),
                            })),
                        ]}
                    />
                    <SelectField
                        label={t("currency")}
                        value={currency}
                        onChange={setCurrency}
                        options={[
                            all,
                            ...currencies.map((v) => ({ value: v, label: v })),
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
                loadingLabel={t("title")}
                empty={{ title: t("empty"), icon: ReceiptIcon }}
            >
                <TransactionsTable
                    transactions={rows}
                    highlightRequestId={highlight}
                />
            </AsyncContent>
        </Panel>
    );
}
