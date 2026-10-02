"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormField";
import { Label } from "@/components/ui/Label";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { NETWORKS_BY_CURRENCY } from "@/config/currencies";
import { PROCESSING_DAYS } from "@/config/methods";
import {
    addMinor,
    cmpMinor,
    decimalToMinor,
    feeFromBps,
    maxAmountWithFee,
    minorToDecimal,
} from "@/domain/money";
import { availableBalance } from "@/domain/rules";
import type {
    Account,
    AnyRequest,
    PaymentMethod,
    PlatformSettings,
} from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { buildFieldsSchema } from "@/features/payments/fieldSchema";
import { amountLimitsSchema, limitsOf } from "@/features/payments/limits";
import { BalanceTotals } from "@/features/shared/BalanceTotals";
import { ConfirmCodeDialog } from "@/features/shared/ConfirmCodeDialog";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { useGroupedOptions } from "@/features/shared/options";
import { Panel } from "@/features/shared/Panel";
import { RequestResult } from "@/features/shared/RequestResult";
import { SummaryList } from "@/features/shared/SummaryList";
import {
    WithWalletData,
    type WalletData,
} from "@/features/shared/WithWalletData";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { requiredString } from "@/lib/validation";
import { useCreateWithdrawalMutation } from "@/store/api";

interface WithdrawValues {
    accountId: string;
    methodId: string;
    amount: string;
    fields: Record<string, string>;
}

function safeMinor(amount: string, decimals: number): string | null {
    try {
        return decimalToMinor(amount, decimals);
    } catch {
        return null;
    }
}

function methodsFor(
    settings: PlatformSettings,
    account: Account | undefined,
): PaymentMethod[] {
    if (!account) return [];
    return settings.methods.filter(
        (m) =>
            m.enabled &&
            m.kind === "withdrawal" &&
            m.currencies.includes(account.currency),
    );
}

// The schema depends on the chosen account (decimals, balance, limits) and
// method (fields), so it is rebuilt for every validation run.
function buildSchema(
    { settings, accounts }: WalletData,
    values: WithdrawValues,
) {
    const account = accounts.find((a) => a.id === values.accountId);
    const currency = settings.currencies.find(
        (c) => c.code === account?.currency,
    );
    const method = methodsFor(settings, account).find(
        (m) => m.id === values.methodId,
    );
    const decimals = currency?.decimals ?? 2;

    return z
        .object({
            accountId: requiredString(),
            methodId: requiredString(),
            amount: amountLimitsSchema(settings, currency),
            fields: method
                ? buildFieldsSchema(
                      method.fields,
                      NETWORKS_BY_CURRENCY[account?.currency ?? ""] ?? [],
                  )
                : z.record(z.string(), z.string()),
        })
        .superRefine((v, issue) => {
            if (!account) return;
            const amount = safeMinor(v.amount, decimals);
            if (!amount) return;
            const total = addMinor(
                amount,
                feeFromBps(amount, settings.fees.withdrawalBps),
            );
            if (cmpMinor(total, availableBalance(account)) > 0) {
                issue.addIssue({
                    code: "custom",
                    message: "insufficientFunds",
                    path: ["amount"],
                });
            }
        });
}

function WithdrawFormInner(data: WalletData) {
    const { settings, accounts } = data;
    const t = useTranslations();
    const user = useCurrentUser();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const { accountOptions } = useGroupedOptions();
    const [createWithdrawal, mutation] = useCreateWithdrawalMutation();
    const [pending, setPending] = useState<WithdrawValues | null>(null);
    const [result, setResult] = useState<AnyRequest | null>(null);
    const bps = settings.fees.withdrawalBps;

    const sourceAccounts = accounts.filter(
        (a) =>
            methodsFor(settings, a).length > 0 &&
            settings.currencies.some((c) => c.code === a.currency && c.enabled),
    );

    const resolver: Resolver<WithdrawValues> = (values, context, options) =>
        zodResolver(buildSchema(data, values))(
            values,
            context,
            options,
        ) as ReturnType<Resolver<WithdrawValues>>;

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<WithdrawValues>({
        resolver,
        defaultValues: { accountId: "", methodId: "", amount: "", fields: {} },
    });

    const [accountId, methodId, amountInput] = useWatch({
        control,
        name: ["accountId", "methodId", "amount"],
    });
    const account = accounts.find((a) => a.id === accountId);
    const currency = settings.currencies.find(
        (c) => c.code === account?.currency,
    );
    const methods = useMemo(
        () => methodsFor(settings, account),
        [settings, account],
    );
    const method = methods.find((m) => m.id === methodId);
    const networks = NETWORKS_BY_CURRENCY[account?.currency ?? ""] ?? [];
    const limits = limitsOf(settings, currency);
    const processing = method ? PROCESSING_DAYS[method.id] : undefined;

    // Keep the method valid for the account; crypto has a single method.
    useEffect(() => {
        if (methods.some((m) => m.id === methodId)) return;
        const only = methods.length === 1 ? methods[0] : undefined;
        setValue("methodId", only ? only.id : "");
    }, [methodId, methods, setValue]);

    // Recipient name defaults to the profile name; the user can still edit it.
    useEffect(() => {
        const holder = method?.fields.find((f) => f.kind === "holderName");
        if (holder && !getValues(`fields.${holder.name}`))
            setValue(`fields.${holder.name}`, user.name);
    }, [getValues, method, setValue, user.name]);

    const amountMinor = currency
        ? safeMinor(amountInput, currency.decimals)
        : null;
    const fee = amountMinor ? feeFromBps(amountMinor, bps) : null;

    const fillMax = () => {
        if (!account || !currency) return;
        const max = maxAmountWithFee(availableBalance(account), bps);
        setValue("amount", minorToDecimal(max, currency.decimals), {
            shouldValidate: true,
        });
    };

    const onSubmit = handleSubmit((values) => {
        mutation.reset();
        setPending(values);
    });

    const confirm = async (code: string) => {
        if (!pending) return;
        const response = await createWithdrawal({
            userId: user.id,
            methodId: pending.methodId,
            accountId: pending.accountId,
            amount: pending.amount,
            fields: pending.fields,
            code,
        });
        if ("data" in response && response.data) {
            setPending(null);
            setResult(response.data);
            reset();
        }
    };

    if (result && result.kind === "withdrawal") {
        const { payload } = result;
        return (
            <RequestResult
                request={result}
                title={t("withdraw.resultTitle")}
                items={[
                    [
                        t("withdraw.recipientGets"),
                        formatMoney(payload.amount, payload.currency),
                        true,
                    ],
                    [
                        t("payments.fee"),
                        formatMoney(payload.fee, payload.currency),
                    ],
                    [
                        t("payments.method"),
                        t(`methods.${result.method as "sepa-out"}`),
                    ],
                ]}
                onReset={() => setResult(null)}
                resetLabel={t("withdraw.again")}
            />
        );
    }

    const summary =
        account && amountMinor && fee ? (
            <SummaryList
                items={[
                    [
                        t("withdraw.recipientGets"),
                        formatMoney(amountMinor, account.currency),
                    ],
                    [t("payments.fee"), formatMoney(fee, account.currency)],
                    [
                        t("payments.totalDebit"),
                        formatMoney(
                            addMinor(amountMinor, fee),
                            account.currency,
                        ),
                        true,
                    ],
                ]}
            />
        ) : null;

    return (
        <div className="space-y-6">
            <BalanceTotals accounts={accounts} available />
            <Panel>
                <form onSubmit={onSubmit} noValidate className="space-y-5">
                    <Controller
                        control={control}
                        name="accountId"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("withdraw.currency")}
                                placeholder={t("payments.chooseAccount")}
                                options={accountOptions(sourceAccounts)}
                                error={fieldError(errors.accountId)}
                            />
                        )}
                    />

                    {currency?.type === "fiat" && (
                        <div className="space-y-3">
                            <Label id="withdraw-method-label">
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
                                    aria-labelledby="withdraw-method-label"
                                    className="flex-wrap"
                                >
                                    {methods.map((m) => (
                                        <TabsTrigger key={m.id} value={m.id}>
                                            {t(`methods.${m.id as "sepa-out"}`)}
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

                    {method && method.fields.length > 0 && (
                        <fieldset className="grid gap-5 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2 sm:p-5">
                            <legend className="px-1 text-sm font-medium">
                                {t("withdraw.recipient")}
                            </legend>
                            {method.fields.map((field) => {
                                const name = `fields.${field.name}` as const;
                                const label = t(
                                    `methodFields.${field.name as "iban"}`,
                                );
                                const error = fieldError(
                                    errors.fields?.[field.name],
                                );
                                return field.kind === "network" ? (
                                    <Controller
                                        key={field.name}
                                        control={control}
                                        name={name}
                                        defaultValue=""
                                        render={({ field: control }) => (
                                            <SelectField
                                                {...control}
                                                value={control.value ?? ""}
                                                label={label}
                                                placeholder={t(
                                                    "payments.chooseNetwork",
                                                )}
                                                options={networks.map((n) => ({
                                                    value: n,
                                                    label: t(`networks.${n}`),
                                                }))}
                                                error={error}
                                            />
                                        )}
                                    />
                                ) : (
                                    <TextField
                                        key={field.name}
                                        label={
                                            field.optional
                                                ? t("payments.optional", {
                                                      label,
                                                  })
                                                : label
                                        }
                                        autoComplete="off"
                                        spellCheck={false}
                                        containerClassName={
                                            field.kind === "cryptoAddress"
                                                ? "sm:col-span-2"
                                                : undefined
                                        }
                                        error={error}
                                        {...register(name)}
                                    />
                                );
                            })}
                        </fieldset>
                    )}

                    <TextField
                        label={t("payments.amount")}
                        inputMode="decimal"
                        placeholder="0.00"
                        endAdornment={account?.currency}
                        endAction={
                            account && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    onClick={fillMax}
                                >
                                    {t("payments.max")}
                                </Button>
                            )
                        }
                        hint={
                            account
                                ? [
                                      t("payments.availableHint", {
                                          amount: formatMoney(
                                              availableBalance(account),
                                              account.currency,
                                          ),
                                      }),
                                      limits &&
                                          t("payments.limitsHint", {
                                              min: formatMoney(
                                                  limits.min,
                                                  limits.currency,
                                              ),
                                              max: formatMoney(
                                                  limits.max,
                                                  limits.currency,
                                              ),
                                          }),
                                  ]
                                      .filter(Boolean)
                                      .join(" · ")
                                : undefined
                        }
                        error={fieldError(errors.amount)}
                        {...register("amount")}
                    />

                    {summary}

                    {processing && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ClockIcon
                                className="size-4 shrink-0"
                                aria-hidden
                            />
                            {t("withdraw.processing", processing)}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {t("payments.reviewNotice")}
                    </p>
                    <SubmitButton
                        pending={false}
                        pendingLabel={t("common.loading")}
                        variant="gradient"
                    >
                        {t("payments.submitWithdrawal")}
                    </SubmitButton>
                </form>
            </Panel>

            <ConfirmCodeDialog
                open={pending !== null}
                onOpenChange={(open) => {
                    if (!open) setPending(null);
                }}
                title={t("withdraw.confirmTitle")}
                summary={summary}
                pending={mutation.isLoading}
                error={apiError(mutation.error)}
                onConfirm={confirm}
            />
        </div>
    );
}

export function WithdrawForm() {
    return (
        <WithWalletData>
            {(data) => <WithdrawFormInner {...data} />}
        </WithWalletData>
    );
}
