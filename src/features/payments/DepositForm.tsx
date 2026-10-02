"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@reduxjs/toolkit/query";
import {
    CreditCardIcon,
    ExternalLinkIcon,
    InfoIcon,
    LandmarkIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { SelectField, TextField } from "@/components/ui/FormField";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { NETWORKS_BY_CURRENCY } from "@/config/currencies";
import { DEPOSIT_FLOW } from "@/config/methods";
import { decimalToMinor } from "@/domain/money";
import type { AnyRequest, Currency, PlatformSettings } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { amountLimitsSchema, limitsOf } from "@/features/payments/limits";
import { CopyValue } from "@/features/shared/CopyValue";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { useGroupedOptions } from "@/features/shared/options";
import { Panel } from "@/features/shared/Panel";
import { PlaceholderQr } from "@/features/shared/PlaceholderQr";
import { RequestResult } from "@/features/shared/RequestResult";
import {
    WithWalletData,
    type WalletData,
} from "@/features/shared/WithWalletData";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { requiredString } from "@/lib/validation";
import {
    useCreateDepositMutation,
    useDepositInstructionsQuery,
} from "@/store/api";

interface DepositValues {
    currency: string;
    methodId: string;
    network: string;
    amount: string;
}

function depositMethods(settings: PlatformSettings, currency: string) {
    return settings.methods.filter(
        (m) =>
            m.enabled &&
            m.kind === "deposit" &&
            m.currencies.includes(currency),
    );
}

function buildSchema(settings: PlatformSettings, values: DepositValues) {
    const currency = settings.currencies.find(
        (c) => c.code === values.currency,
    );
    const isCrypto = currency?.type === "crypto";
    return z.object({
        currency: requiredString(),
        methodId: requiredString(),
        network: isCrypto ? requiredString() : z.string(),
        amount: amountLimitsSchema(settings, currency),
    });
}

function Instructions({
    userId,
    currency,
    methodId,
    network,
}: {
    userId: string;
    currency: Currency;
    methodId: string;
    network: string;
}) {
    const t = useTranslations("deposit");
    const flow = DEPOSIT_FLOW[methodId];
    const ready = flow !== "address" || network !== "";
    const { data, isFetching, isError, refetch } = useDepositInstructionsQuery(
        ready
            ? { userId, currency: currency.code, methodId, network }
            : skipToken,
    );

    if (!ready) return null;
    if (isFetching)
        return (
            <div className="space-y-2 rounded-2xl border p-4" aria-busy="true">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        );
    if (isError || !data)
        return (
            <div className="flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm">
                {t("instructionsError")}
                <Button variant="outline" size="sm" onClick={refetch}>
                    {t("retry")}
                </Button>
            </div>
        );

    if (data.flow === "checkout") {
        return (
            <p className="flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 text-sm text-muted-foreground">
                <CreditCardIcon
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    aria-hidden
                />
                {t("checkoutText")}
            </p>
        );
    }

    if (data.flow === "address") {
        return (
            <div className="grid gap-5 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
                <PlaceholderQr value={data.address} className="mx-auto" />
                <div className="min-w-0 space-y-3">
                    <dl className="divide-y">
                        <CopyValue label={t("address")} value={data.address} />
                    </dl>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li>
                            {t("networkNote", {
                                network: t(`networks.${data.network}`),
                            })}
                        </li>
                        <li>
                            {t("confirmations", {
                                count: data.confirmations,
                            })}
                        </li>
                        <li>{t("webhookNote")}</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 rounded-2xl border bg-muted/30 p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-medium">
                <LandmarkIcon className="size-4 text-primary" aria-hidden />
                {t("bankDetails")}
            </p>
            <dl className="divide-y">
                <CopyValue label={t("beneficiary")} value={data.beneficiary} />
                <CopyValue
                    label={t("accountNumber")}
                    value={data.accountNumber}
                />
                <CopyValue label={t("bankCode")} value={data.bankCode} />
                <CopyValue label={t("reference")} value={data.reference} />
            </dl>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {t("referenceNote")}
            </p>
        </div>
    );
}

function DepositFormInner({ settings }: WalletData) {
    const t = useTranslations();
    const user = useCurrentUser();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const { currencyOptions } = useGroupedOptions();
    const [createDeposit, { isLoading, error, reset: resetMutation }] =
        useCreateDepositMutation();
    const [result, setResult] = useState<AnyRequest | null>(null);
    const [checkoutValues, setCheckoutValues] = useState<DepositValues | null>(
        null,
    );

    const currencies = settings.currencies.filter(
        (c) => c.enabled && depositMethods(settings, c.code).length > 0,
    );

    const resolver: Resolver<DepositValues> = (values, context, options) =>
        zodResolver(buildSchema(settings, values))(
            values,
            context,
            options,
        ) as ReturnType<Resolver<DepositValues>>;

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<DepositValues>({
        resolver,
        defaultValues: { currency: "", methodId: "", network: "", amount: "" },
    });
    const [currencyCode, methodId, network] = useWatch({
        control,
        name: ["currency", "methodId", "network"],
    });
    const currency = currencies.find((c) => c.code === currencyCode);
    const methods = useMemo(
        () => depositMethods(settings, currencyCode),
        [settings, currencyCode],
    );
    const networks = useMemo(
        () => NETWORKS_BY_CURRENCY[currencyCode] ?? [],
        [currencyCode],
    );
    const flow = DEPOSIT_FLOW[methodId];
    const limits = limitsOf(settings, currency);

    // Keep the method/network valid for the chosen currency; crypto has one method.
    useEffect(() => {
        const first = methods[0];
        if (!methods.some((m) => m.id === methodId))
            setValue(
                "methodId",
                currency?.type === "crypto" && first ? first.id : "",
            );
        if (network && !(networks as string[]).includes(network))
            setValue("network", "");
    }, [currency, methodId, methods, network, networks, setValue]);

    const submit = async (values: DepositValues) => {
        const response = await createDeposit({
            userId: user.id,
            currency: values.currency,
            methodId: values.methodId,
            amount: values.amount,
            network: values.network || undefined,
        });
        if ("data" in response && response.data) {
            setCheckoutValues(null);
            setResult(response.data);
            reset();
        }
    };

    const onSubmit = handleSubmit(async (values) => {
        if (DEPOSIT_FLOW[values.methodId] === "checkout") {
            resetMutation();
            setCheckoutValues(values);
            return;
        }
        await submit(values);
    });

    if (result && result.kind === "deposit") {
        return (
            <RequestResult
                request={result}
                title={t("deposit.resultTitle")}
                items={[
                    [
                        t("payments.amount"),
                        formatMoney(
                            result.payload.amount,
                            result.payload.currency,
                        ),
                        true,
                    ],
                    [
                        t("payments.method"),
                        t(`methods.${result.method as "sepa-in"}`),
                    ],
                ]}
                onReset={() => {
                    resetMutation();
                    setResult(null);
                }}
                resetLabel={t("deposit.again")}
            />
        );
    }

    const submitLabel =
        flow === "checkout"
            ? t("deposit.submitCheckout")
            : flow === "address"
              ? t("deposit.submitSimulate")
              : t("deposit.submitSent");

    return (
        <Panel>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormError
                    message={checkoutValues ? undefined : apiError(error)}
                />

                <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            label={t("deposit.currency")}
                            placeholder={t("deposit.chooseCurrency")}
                            options={currencyOptions(currencies)}
                            error={fieldError(errors.currency)}
                        />
                    )}
                />

                {currency?.type === "fiat" && (
                    <div className="space-y-3">
                        <Label id="deposit-method-label">
                            {t("payments.method")}
                        </Label>
                        <Tabs
                            value={methodId}
                            onValueChange={(value) =>
                                setValue("methodId", value, {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <TabsList
                                aria-labelledby="deposit-method-label"
                                className="flex-wrap"
                            >
                                {methods.map((m) => (
                                    <TabsTrigger key={m.id} value={m.id}>
                                        {t(`methods.${m.id as "sepa-in"}`)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                        {errors.methodId && (
                            <p
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {fieldError(errors.methodId)}
                            </p>
                        )}
                    </div>
                )}

                {currency?.type === "crypto" && (
                    <Controller
                        control={control}
                        name="network"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("methodFields.network")}
                                placeholder={t("payments.chooseNetwork")}
                                options={networks.map((n) => ({
                                    value: n,
                                    label: t(`networks.${n}`),
                                }))}
                                error={fieldError(errors.network)}
                            />
                        )}
                    />
                )}

                {currency && methodId && (
                    <Instructions
                        userId={user.id}
                        currency={currency}
                        methodId={methodId}
                        network={network}
                    />
                )}

                <TextField
                    label={t("payments.amount")}
                    inputMode="decimal"
                    placeholder="0.00"
                    endAdornment={currency?.code}
                    hint={
                        limits
                            ? t("payments.limitsHint", {
                                  min: formatMoney(limits.min, limits.currency),
                                  max: formatMoney(limits.max, limits.currency),
                              })
                            : undefined
                    }
                    error={fieldError(errors.amount)}
                    {...register("amount")}
                />

                <p className="text-xs text-muted-foreground">
                    {t("payments.reviewNotice")}
                </p>
                <SubmitButton
                    pending={isLoading && !checkoutValues}
                    pendingLabel={t("common.loading")}
                    variant="gradient"
                >
                    {submitLabel}
                </SubmitButton>
            </form>

            <Dialog
                open={checkoutValues !== null}
                onOpenChange={(open) => {
                    if (!open) setCheckoutValues(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("deposit.checkoutTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("deposit.checkoutDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <FormError message={apiError(error)} />
                    {checkoutValues && currency && (
                        <p className="rounded-xl border bg-muted/40 p-4 text-center font-heading text-2xl font-bold tabular-nums">
                            {formatMoney(
                                decimalToMinor(
                                    checkoutValues.amount,
                                    currency.decimals,
                                ),
                                currency.code,
                            )}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCheckoutValues(null)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <SubmitButton
                            type="button"
                            pending={isLoading}
                            pendingLabel={t("common.loading")}
                            variant="gradient"
                            onClick={() =>
                                checkoutValues && submit(checkoutValues)
                            }
                        >
                            <ExternalLinkIcon aria-hidden />
                            {t("deposit.checkoutPay")}
                        </SubmitButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Panel>
    );
}

export function DepositForm() {
    return (
        <WithWalletData>
            {(data) => <DepositFormInner {...data} />}
        </WithWalletData>
    );
}
