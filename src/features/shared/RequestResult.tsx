"use client";

import { ArrowRightIcon, CircleCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { transactionsFor } from "@/config/routes";
import type { AnyRequest } from "@/domain/types";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { SummaryList } from "@/features/shared/SummaryList";
import { Link } from "@/i18n/navigation";

/** Status screen after a money request is created. */
export function RequestResult({
    request,
    title,
    description,
    items,
    onReset,
    resetLabel,
}: {
    request: AnyRequest;
    title: string;
    description?: string;
    items: [string, ReactNode, boolean?][];
    onReset: () => void;
    resetLabel: string;
}) {
    const t = useTranslations("requestResult");
    return (
        <Panel>
            <div role="status" className="space-y-5">
                <div className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-success/30 bg-success/10 text-success">
                        <CircleCheckIcon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-heading font-semibold">
                                {title}
                            </h2>
                            <StatusBadge status={request.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description ?? t("pendingText")}
                        </p>
                    </div>
                </div>
                <SummaryList items={[[t("reference"), request.id], ...items]} />
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href={transactionsFor(request.id)}>
                            {t("viewTransaction")}
                            <ArrowRightIcon aria-hidden />
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={onReset}>
                        {resetLabel}
                    </Button>
                </div>
            </div>
        </Panel>
    );
}
