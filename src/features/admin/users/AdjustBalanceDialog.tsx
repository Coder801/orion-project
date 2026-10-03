"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    SelectField,
    TextareaField,
    TextField,
} from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { decimalToMinor, negMinor } from "@/domain/money";
import { availableBalance } from "@/domain/rules";
import type { Account, Currency } from "@/domain/types";
import {
    ADJUSTMENT_DIRECTIONS,
    adjustmentSchema,
    type AdjustmentValues,
} from "@/features/admin/users/schemas";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { useAdjustBalanceMutation } from "@/store/api";

export interface AdjustTarget {
    /** Preselected currency, e.g. from an account row. */
    currency?: string;
}

function AdjustForm({
    adminId,
    userId,
    accounts,
    currencies,
    initialCurrency,
    onDone,
}: {
    adminId: string;
    userId: string;
    accounts: Account[];
    currencies: Currency[];
    initialCurrency: string;
    onDone: () => void;
}) {
    const t = useTranslations("admin.users.adjust");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const [adjust, { isLoading }] = useAdjustBalanceMutation();
    const [error, setError] = useState<unknown>();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<AdjustmentValues>({
        resolver: zodResolver(adjustmentSchema(currencies, accounts)),
        defaultValues: {
            direction: "credit",
            currency: initialCurrency,
            amount: "",
            reason: "",
        },
    });
    const code = useWatch({ control, name: "currency" });
    const currency = currencies.find((c) => c.code === code);
    const account = accounts.find((a) => a.currency === code);

    const submit = async (values: AdjustmentValues) => {
        if (!currency) return;
        const minor = decimalToMinor(values.amount.trim(), currency.decimals);
        const result = await adjust({
            adminId,
            userId,
            currency: currency.code,
            amount: values.direction === "debit" ? negMinor(minor) : minor,
            reason: values.reason,
        });
        if ("error" in result) {
            setError(result.error);
            return;
        }
        toast.success(t("done"));
        onDone();
    };

    return (
        <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="space-y-4">
                <FormError message={apiError(error)} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Controller
                        control={control}
                        name="direction"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("direction")}
                                options={ADJUSTMENT_DIRECTIONS.map((d) => ({
                                    value: d,
                                    label: t(`directions.${d}`),
                                }))}
                                error={fieldError(errors.direction)}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="currency"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("currency")}
                                options={currencies.map((c) => ({
                                    value: c.code,
                                    label: c.code,
                                }))}
                                error={fieldError(errors.currency)}
                            />
                        )}
                    />
                </div>
                <TextField
                    label={t("amount")}
                    inputMode="decimal"
                    placeholder="0.00"
                    endAdornment={code}
                    hint={
                        currency &&
                        t("available", {
                            amount: formatMoney(
                                account ? availableBalance(account) : "0",
                                currency.code,
                            ),
                        })
                    }
                    error={fieldError(errors.amount)}
                    {...register("amount")}
                />
                <TextareaField
                    label={t("reason")}
                    hint={t("reasonHint")}
                    rows={3}
                    error={fieldError(errors.reason)}
                    {...register("reason")}
                />
            </div>
            <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onDone}>
                    {t("cancel")}
                </Button>
                <SubmitButton pending={isLoading} pendingLabel={tc("loading")}>
                    {t("submit")}
                </SubmitButton>
            </DialogFooter>
        </form>
    );
}

/** Manual credit / debit of one of the user's accounts. */
export function AdjustBalanceDialog({
    target,
    onClose,
    ...props
}: {
    target: AdjustTarget | null;
    onClose: () => void;
    adminId: string;
    userId: string;
    accounts: Account[];
    currencies: Currency[];
}) {
    const t = useTranslations("admin.users.adjust");
    const initialCurrency =
        target?.currency ??
        props.accounts[0]?.currency ??
        props.currencies[0]?.code ??
        "";

    return (
        <Dialog
            open={target !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                {/* Remounted per opening so the form starts clean. */}
                {target && (
                    <AdjustForm
                        {...props}
                        initialCurrency={initialCurrency}
                        onDone={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
