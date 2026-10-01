"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { SelectField, TextField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { NETWORKS_BY_CURRENCY } from "@/config/currencies";
import {
    addMinor,
    cmpMinor,
    decimalToMinor,
    feeFromBps,
    ZERO,
} from "@/domain/money";
import { availableBalance } from "@/domain/rules";
import type { Account, MethodKind, PaymentMethod } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { buildFieldsSchema } from "@/features/payments/fieldSchema";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/form-status";
import { Panel } from "@/features/shared/panel";
import { SummaryList } from "@/features/shared/summary-list";
import {
    WithWalletData,
    type WalletData,
} from "@/features/shared/with-wallet-data";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { amountSchema, requiredString } from "@/lib/validation";
import {
    useCreateDepositMutation,
    useCreateWithdrawalMutation,
} from "@/store/api";

interface MovementValues {
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

interface Context extends WalletData {
    kind: MethodKind;
}

function methodsFor(
    ctx: Context,
    account: Account | undefined,
): PaymentMethod[] {
    if (!account) return [];
    return ctx.settings.methods.filter(
        (m) =>
            m.enabled &&
            m.kind === ctx.kind &&
            m.currencies.includes(account.currency),
    );
}

// The schema depends on the chosen account (decimals, balance) and method (fields),
// so it is rebuilt for every validation run.
function buildSchema(ctx: Context, values: MovementValues) {
    const account = ctx.accounts.find((a) => a.id === values.accountId);
    const currency = ctx.settings.currencies.find(
        (c) => c.code === account?.currency,
    );
    const method = methodsFor(ctx, account).find(
        (m) => m.id === values.methodId,
    );
    const decimals = currency?.decimals ?? 2;

    return z
        .object({
            accountId: requiredString(),
            methodId: requiredString(),
            amount: amountSchema(decimals),
            fields: method
                ? buildFieldsSchema(
                      method.fields,
                      NETWORKS_BY_CURRENCY[account?.currency ?? ""] ?? [],
                  )
                : z.record(z.string(), z.string()),
        })
        .superRefine((v, issue) => {
            if (ctx.kind !== "withdrawal" || !account) return;
            const amount = safeMinor(v.amount, decimals);
            if (!amount) return;
            const total = addMinor(
                amount,
                feeFromBps(amount, ctx.settings.fees.withdrawalBps),
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

function MovementFormInner({ kind, settings, accounts }: Context) {
    const t = useTranslations();
    const user = useCurrentUser();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const [createDeposit, deposit] = useCreateDepositMutation();
    const [createWithdrawal, withdrawal] = useCreateWithdrawalMutation();
    const mutation = kind === "deposit" ? deposit : withdrawal;

    const ctx = useMemo(
        () => ({ kind, settings, accounts }),
        [kind, settings, accounts],
    );
    const enabledAccounts = accounts.filter(
        (a) =>
            methodsFor(ctx, a).length > 0 &&
            settings.currencies.some((c) => c.code === a.currency && c.enabled),
    );

    const resolver: Resolver<MovementValues> = (values, context, options) =>
        zodResolver(buildSchema(ctx, values))(
            values,
            context,
            options,
        ) as ReturnType<Resolver<MovementValues>>;

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<MovementValues>({
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
    const methods = methodsFor(ctx, account);
    const method = methods.find((m) => m.id === methodId);
    const networks = NETWORKS_BY_CURRENCY[account?.currency ?? ""] ?? [];

    // A method may not support the newly selected account's currency.
    useEffect(() => {
        if (methodId && !methods.some((m) => m.id === methodId))
            setValue("methodId", "");
    }, [methodId, methods, setValue]);

    const amountMinor = currency
        ? safeMinor(amountInput, currency.decimals)
        : null;
    const fee =
        kind === "withdrawal" && amountMinor
            ? feeFromBps(amountMinor, settings.fees.withdrawalBps)
            : ZERO;

    const onSubmit = handleSubmit(async (values) => {
        const create = kind === "deposit" ? createDeposit : createWithdrawal;
        const result = await create({
            userId: user.id,
            methodId: values.methodId,
            accountId: values.accountId,
            amount: values.amount,
            fields: values.fields,
        });
        if ("data" in result) reset();
    });

    return (
        <Panel>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess
                    show={mutation.isSuccess}
                    message={t("payments.created")}
                />
                <FormError message={apiError(mutation.error)} />

                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        control={control}
                        name="accountId"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("payments.account")}
                                placeholder={t("payments.chooseAccount")}
                                options={enabledAccounts.map((a) => ({
                                    value: a.id,
                                    label: `${accountLabel(a)} — ${formatMoney(availableBalance(a), a.currency)}`,
                                }))}
                                error={fieldError(errors.accountId)}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="methodId"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("payments.method")}
                                placeholder={t("payments.chooseMethod")}
                                disabled={!account}
                                options={methods.map((m) => ({
                                    value: m.id,
                                    label: t(`methods.${m.id as "sepa-in"}`),
                                }))}
                                error={fieldError(errors.methodId)}
                            />
                        )}
                    />
                </div>

                {method && (
                    <fieldset className="grid gap-5 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2 sm:p-5">
                        <legend className="px-1 text-sm font-medium">
                            {t("payments.details")}
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
                                            ? t("payments.optional", { label })
                                            : label
                                    }
                                    autoComplete="off"
                                    spellCheck={false}
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
                    hint={
                        kind === "withdrawal" && account
                            ? t("payments.availableHint", {
                                  amount: formatMoney(
                                      availableBalance(account),
                                      account.currency,
                                  ),
                              })
                            : undefined
                    }
                    error={fieldError(errors.amount)}
                    {...register("amount")}
                />

                {kind === "withdrawal" && account && amountMinor && (
                    <SummaryList
                        items={[
                            [
                                t("payments.fee"),
                                formatMoney(fee, account.currency),
                            ],
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
                )}

                <p className="text-xs text-muted-foreground">
                    {t("payments.reviewNotice")}
                </p>
                <SubmitButton
                    pending={mutation.isLoading}
                    pendingLabel={t("common.loading")}
                    variant="gradient"
                >
                    {t(
                        kind === "deposit"
                            ? "payments.submitDeposit"
                            : "payments.submitWithdrawal",
                    )}
                </SubmitButton>
            </form>
        </Panel>
    );
}

export function MovementForm({ kind }: { kind: MethodKind }) {
    return (
        <WithWalletData>
            {(data) => <MovementFormInner kind={kind} {...data} />}
        </WithWalletData>
    );
}
