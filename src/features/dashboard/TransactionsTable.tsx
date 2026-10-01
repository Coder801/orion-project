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
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { cn } from "@/lib/utils";

export function TransactionsTable({
    transactions,
}: {
    transactions: Transaction[];
}) {
    const t = useTranslations("transactions");
    const language = useLocale();
    const formatMoney = useFormatMoney();

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5 lg:pl-6">{t("date")}</TableHead>
                    <TableHead>{t("type")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="pr-5 text-right lg:pr-6">
                        {t("amount")}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                        <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                            {formatDate(tx.createdAt, language, "dateTime")}
                        </TableCell>
                        <TableCell>{t(`types.${tx.type}`)}</TableCell>
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
                ))}
            </TableBody>
        </Table>
    );
}
