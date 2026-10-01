"use client";

import { ArrowRightIcon } from "lucide-react";

import type { AnyRequest } from "@/domain/types";
import { useFormatMoney } from "@/lib/hooks/useMoney";

/** "100.00 EUR" or, for conversions, "100.00 USD → 0.0015 BTC". */
export function RequestAmount({ request }: { request: AnyRequest }) {
    const formatMoney = useFormatMoney();
    if (request.kind === "conversion") {
        const { payload } = request;
        return (
            <span className="inline-flex items-center gap-1.5">
                {formatMoney(payload.amount, payload.from)}
                <ArrowRightIcon
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                />
                {formatMoney(payload.toAmount, payload.to)}
            </span>
        );
    }
    return <>{formatMoney(request.payload.amount, request.payload.currency)}</>;
}
