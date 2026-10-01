"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@reduxjs/toolkit/query";
import { ArrowDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useDeferredValue } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { SelectField, TextField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmitButton } from "@/components/ui/submit-button";
import { addMinor, cmpMinor, decimalToMinor, feeFromBps } from "@/domain/money";
import { availableBalance } from "@/domain/rules";
import type { Account, PlatformSettings } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/form-status";
import { Panel } from "@/features/shared/panel";
import { SummaryList } from "@/features/shared/summary-list";
import {
    WithWalletData,
    type WalletData,
} from "@/features/shared/with-wallet-data";
import { formatDecimal } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { amountSchema, requiredString } from "@/lib/validation";
import { useCreateConversionMutation, useQuoteQuery } from "@/store/api";

interface ConvertValues {
    fromAccountId: string;
    to: string;
    amount: string;
}

function decimalsOf(settings: PlatformSettings, account: Account | undefined) {
    return (
        settings.currencies.find((c) => c.code === account?.currency)
            ?.decimals ?? 2
    );
}

function buildSchema(
    settings: PlatformSettings,
    accounts: Account[],
    values: ConvertValues,
) {
    const from = accounts.find((a) => a.id === values.fromAccountId);
    const decimals = decimalsOf(settings, from);

    return z
        .object({
            fromAccountId: requiredString(),
            to: requiredString(),
            amount: amountSchema(decimals),
        })
        .superRefine((v, ctx) => {
            if (!from) return;
            if (v.to === from.currency) {
                ctx.addIssue({
                    code: "custom",
                    message: "sameCurrency",
                    path: ["to"],
                });
            }
            try {
                const amount = decimalToMinor(v.amount, decimals);
                const total = addMinor(
                    amount,
                    feeFromBps(amount, settings.fees.conversionBps),
                );
                if (cmpMinor(total, availableBalance(from)) > 0) {
                    ctx.addIssue({
                        code: "custom",
                        message: "insufficientFunds",
                        path: ["amount"],
                    });
                }
            } catch {
                // Format errors are reported by amountSchema.
            }
        });
}

function ConvertFormInner({ settings, accounts }: WalletData) {
    const t = useTranslations("convert");
    const tc = useTranslations("common");
    const language = useLocale();
    const user = useCurrentUser();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const [createConversion, { isLoading, isSuccess, error }] =
        useCreateConversionMutation();

    const enabled = settings.currencies.filter((c) => c.enabled);
    const sourceAccounts = accounts.filter((a) =>
        enabled.some((c) => c.code === a.currency),
    );

    const resolver: Resolver<ConvertValues> = (values, context, options) =>
        zodResolver(buildSchema(settings, accounts, values))(
            values,
            context,
            options,
        ) as ReturnType<Resolver<ConvertValues>>;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<ConvertValues>({
        resolver,
        defaultValues: { fromAccountId: "", to: "", amount: "" },
    });
    const [fromAccountId, to, amount] = useWatch({
        control,
        name: ["fromAccountId", "to", "amount"],
    });
    const from = accounts.find((a) => a.id === fromAccountId);

    // Quote only well-formed input; deferring avoids a request per keystroke burst.
    const deferredAmount = useDeferredValue(amount);
    const quoteReady =
        from &&
        to &&
        to !== from.currency &&
        amountSchema(decimalsOf(settings, from)).safeParse(deferredAmount)
            .success;
    const quote = useQuoteQuery(
        quoteReady
            ? { fromAccountId: from.id, to, amount: deferredAmount }
            : skipToken,
    );

    const onSubmit = handleSubmit(async (values) => {
        const result = await createConversion({ userId: user.id, ...values });
        if ("data" in result) reset();
    });

    return (
        <Panel>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess show={isSuccess} message={t("created")} />
                <FormError message={apiError(error)} />

                <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                    <Controller
                        control={control}
                        name="fromAccountId"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("from")}
                                placeholder={t("chooseAccount")}
                                options={sourceAccounts.map((a) => ({
                                    value: a.id,
                                    label: `${accountLabel(a)} — ${formatMoney(availableBalance(a), a.currency)}`,
                                }))}
                                error={fieldError(errors.fromAccountId)}
                            />
                        )}
                    />
                    <TextField
                        label={t("amount")}
                        inputMode="decimal"
                        placeholder="0.00"
                        endAdornment={from?.currency}
                        error={fieldError(errors.amount)}
                        {...register("amount")}
                    />
                </div>
                <div aria-hidden className="flex justify-center">
                    <span className="grid size-9 place-items-center rounded-full border bg-muted/50 text-primary shadow-[0_0_20px_-6px_var(--glow-primary)]">
                        <ArrowDownIcon className="size-4" />
                    </span>
                </div>
                <Controller
                    control={control}
                    name="to"
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            label={t("to")}
                            placeholder={t("chooseCurrency")}
                            options={enabled.map((c) => ({
                                value: c.code,
                                label: c.code,
                                disabled: c.code === from?.currency,
                            }))}
                            error={fieldError(errors.to)}
                        />
                    )}
                />

                <section aria-live="polite" aria-label={t("quote")}>
                    {!quoteReady ? (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                            {t("quoteHint")}
                        </p>
                    ) : quote.isFetching ? (
                        <div
                            className="space-y-2 rounded-xl border p-4"
                            aria-busy="true"
                        >
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : quote.data ? (
                        <SummaryList
                            items={[
                                [
                                    t("rate"),
                                    `1 ${quote.data.from} = ${formatDecimal(quote.data.rate, language)} ${quote.data.to}`,
                                ],
                                [
                                    t("fee"),
                                    formatMoney(
                                        quote.data.fee,
                                        quote.data.from,
                                    ),
                                ],
                                [
                                    t("totalDebit"),
                                    formatMoney(
                                        addMinor(
                                            quote.data.amount,
                                            quote.data.fee,
                                        ),
                                        quote.data.from,
                                    ),
                                ],
                                [
                                    t("youGet"),
                                    formatMoney(
                                        quote.data.toAmount,
                                        quote.data.to,
                                    ),
                                    true,
                                ],
                            ]}
                        />
                    ) : (
                        <FormError message={apiError(quote.error)} />
                    )}
                </section>

                <p className="text-xs text-muted-foreground">
                    {t("reviewNotice")}
                </p>
                <SubmitButton
                    pending={isLoading}
                    pendingLabel={tc("loading")}
                    variant="gradient"
                >
                    {t("submit")}
                </SubmitButton>
            </form>
        </Panel>
    );
}

export function ConvertForm() {
    return (
        <WithWalletData>
            {(data) => <ConvertFormInner {...data} />}
        </WithWalletData>
    );
}
