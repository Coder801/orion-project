"use client";

import { ClipboardListIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import type { RequestKind } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { RequestAmount } from "@/features/payments/RequestAmount";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { useUserRequestsQuery } from "@/store/api";

export function UserRequests({ kinds }: { kinds: RequestKind[] }) {
    const t = useTranslations("requests");
    const language = useLocale();
    const user = useCurrentUser();
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useUserRequestsQuery(user.id);
    const requests = data.filter((r) => kinds.includes(r.kind));
    const isEmpty = requests.length === 0;

    return (
        <Panel title={t("mine")} flush={!isLoading && !isError && !isEmpty}>
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={isEmpty}
                onRetry={refetch}
                loadingLabel={t("mine")}
                empty={{ title: t("empty"), icon: ClipboardListIcon }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-5 lg:pl-6">
                                {t("date")}
                            </TableHead>
                            <TableHead>{t("kind")}</TableHead>
                            <TableHead>{t("amount")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                            <TableHead className="pr-5 lg:pr-6">
                                {t("reason")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                    {formatDate(
                                        request.createdAt,
                                        language,
                                        "dateTime",
                                    )}
                                </TableCell>
                                <TableCell>
                                    {t(`kinds.${request.kind}`)}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    <RequestAmount request={request} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={request.status} />
                                </TableCell>
                                <TableCell className="max-w-xs truncate pr-5 text-muted-foreground lg:pr-6">
                                    {request.reason ?? "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AsyncContent>
        </Panel>
    );
}
