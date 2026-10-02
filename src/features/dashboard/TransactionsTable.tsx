"use client";

import { useLocale, useTranslations } from "next-intl";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import type { Transaction } from "@/domain/types";
import { useMethodLabel } from "@/features/payments/useMethodLabel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { cn } from "@/lib/utils";

export function TransactionsTable({
    transactions,
    highlightRequestId,
}: {
    transactions: Transaction[];
    /** Rows of this request are highlighted (e.g. after "View transaction"). */
    highlightRequestId?: string | null;
}) {
    const t = useTranslations("transactions");
    const language = useLocale();
    const formatMoney = useFormatMoney();
    const methodLabel = useMethodLabel();

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5 lg:pl-6">{t("type")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="pr-5 text-right lg:pr-6">
                        {t("amount")}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((tx) => {
                    const highlighted =
                        highlightRequestId != null &&
                        tx.requestId === highlightRequestId;
                    return (
                        <TableRow
                            key={tx.id}
                            aria-current={highlighted || undefined}
                            className={cn(highlighted && "bg-primary/10")}
                        >
                            <TableCell className="pl-5 lg:pl-6">
                                <span className="block font-medium">
                                    {t(`types.${tx.type}`)}
                                </span>
                                {methodLabel(tx.method) && (
                                    <span className="block text-xs text-muted-foreground">
                                        {methodLabel(tx.method)}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatDate(tx.createdAt, language, "dateTime")}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={tx.status} />
                            </TableCell>
                            <TableCell
                                className={cn(
                                    "pr-5 text-right font-medium tabular-nums lg:pr-6",
                                    tx.amount.startsWith("-")
                                        ? "text-foreground"
                                        : "text-success",
                                )}
                            >
                                {formatMoney(tx.amount, tx.currency, {
                                    signDisplay: "always",
                                })}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
