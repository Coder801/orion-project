"use client";

import { CoinsIcon, WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/Skeleton";
import { totalBalance } from "@/domain/portfolio";
import { availableBalance } from "@/domain/rules";
import type { Account, CurrencyType } from "@/domain/types";
import { useDisplayCurrency, useRates } from "@/features/shared/useWallet";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { cn } from "@/lib/utils";

const ICON = { fiat: WalletIcon, crypto: CoinsIcon };

/** Total fiat / crypto in the display currency (crypto at current rates). */
export function BalanceTotals({
    accounts,
    available = false,
    className,
}: {
    accounts: Account[];
    /** Sum available funds (balance − hold) instead of balances. */
    available?: boolean;
    className?: string;
}) {
    const t = useTranslations("totals");
    const display = useDisplayCurrency();
    const formatMoney = useFormatMoney();
    const { source, isLoading } = useRates();
    const list = available
        ? accounts.map((a) => ({
              currency: a.currency,
              balance: availableBalance(a),
          }))
        : accounts;

    return (
        <dl className={cn("grid gap-4 sm:grid-cols-2", className)}>
            {(["fiat", "crypto"] as CurrencyType[]).map((type) => {
                const Icon = ICON[type];
                return (
                    <div
                        key={type}
                        className="relative overflow-hidden rounded-2xl border bg-card p-5"
                    >
                        <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span
                                aria-hidden
                                className={cn(
                                    "flex size-6 items-center justify-center rounded-lg border",
                                    type === "crypto"
                                        ? "border-accent/25 bg-accent/10 text-accent-foreground dark:text-accent"
                                        : "border-primary/25 bg-primary/10 text-primary",
                                )}
                            >
                                <Icon className="size-3.5" />
                            </span>
                            {t(available ? `available.${type}` : type)}
                        </dt>
                        <dd className="mt-3">
                            {isLoading || !source ? (
                                <Skeleton className="h-8 w-40" />
                            ) : (
                                <span className="font-heading text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                                    {formatMoney(
                                        totalBalance(
                                            source,
                                            list,
                                            display,
                                            type,
                                        ),
                                        display,
                                    )}
                                </span>
                            )}
                            <span className="mt-1 block text-xs text-muted-foreground">
                                {t(
                                    type === "crypto" ? "atRates" : "inDisplay",
                                    {
                                        currency: display,
                                    },
                                )}
                            </span>
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
}
