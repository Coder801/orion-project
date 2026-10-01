"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LandmarkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import { SelectField, TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { useCurrentUser } from "@/features/auth/session";
import {
    CREDIT_PURPOSES,
    CREDIT_TERMS,
    creditSchema,
    type CreditFormInput,
    type CreditValues,
} from "@/features/products/schemas";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import {
    useApplyForCreditMutation,
    useCreditsQuery,
    usePlatformSettingsQuery,
} from "@/store/api";

function CreditForm({ userId }: { userId: string }) {
    const t = useTranslations("credit");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const { data: settings } = usePlatformSettingsQuery();
    const [apply, { isLoading, isSuccess, error }] =
        useApplyForCreditMutation();
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<CreditFormInput, unknown, CreditValues>({
        resolver: zodResolver(creditSchema),
        defaultValues: {
            currency: "",
            amount: "",
            termMonths: "",
            monthlyIncome: "",
        },
    });
    const fiat = (settings?.currencies ?? []).filter(
        (c) => c.enabled && c.type === "fiat",
    );

    const onSubmit = handleSubmit(async (input) => {
        const result = await apply({ userId, input });
        if ("data" in result) reset();
    });

    return (
        <Panel title={t("formTitle")}>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess show={isSuccess} message={t("created")} />
                <FormError message={apiError(error)} />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        control={control}
                        name="currency"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("fields.currency")}
                                placeholder={t("fields.choose")}
                                options={fiat.map((c) => ({
                                    value: c.code,
                                    label: c.code,
                                }))}
                                error={fieldError(errors.currency)}
                            />
                        )}
                    />
                    <TextField
                        label={t("fields.amount")}
                        inputMode="decimal"
                        placeholder="0.00"
                        error={fieldError(errors.amount)}
                        {...register("amount")}
                    />
                    <Controller
                        control={control}
                        name="termMonths"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label={t("fields.term")}
                                placeholder={t("fields.choose")}
                                options={CREDIT_TERMS.map((m) => ({
                                    value: String(m),
                                    label: t("months", { count: m }),
                                }))}
                                error={fieldError(errors.termMonths)}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="purpose"
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                value={field.value ?? ""}
                                label={t("fields.purpose")}
                                placeholder={t("fields.choose")}
                                options={CREDIT_PURPOSES.map((p) => ({
                                    value: p,
                                    label: t(`purposes.${p}`),
                                }))}
                                error={fieldError(errors.purpose)}
                            />
                        )}
                    />
                    <TextField
                        label={t("fields.income")}
                        inputMode="decimal"
                        placeholder="0.00"
                        containerClassName="sm:col-span-2"
                        error={fieldError(errors.monthlyIncome)}
                        {...register("monthlyIncome")}
                    />
                </div>
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

function CreditList({ userId }: { userId: string }) {
    const t = useTranslations("credit");
    const language = useLocale();
    const formatMoney = useFormatMoney();
    const { data = [], isLoading, isError, refetch } = useCreditsQuery(userId);
    const isEmpty = data.length === 0;

    return (
        <Panel
            title={t("listTitle")}
            flush={!isLoading && !isError && !isEmpty}
        >
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={isEmpty}
                onRetry={refetch}
                loadingLabel={t("listTitle")}
                empty={{ title: t("empty"), icon: LandmarkIcon }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-5 lg:pl-6">
                                {t("fields.date")}
                            </TableHead>
                            <TableHead>{t("fields.amount")}</TableHead>
                            <TableHead>{t("fields.term")}</TableHead>
                            <TableHead>{t("fields.status")}</TableHead>
                            <TableHead className="pr-5 lg:pr-6">
                                {t("fields.reason")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                    {formatDate(c.createdAt, language)}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {formatMoney(c.amount, c.currency)}
                                </TableCell>
                                <TableCell>
                                    {t("months", { count: c.termMonths })}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={c.status} />
                                </TableCell>
                                <TableCell className="pr-5 text-muted-foreground lg:pr-6">
                                    {c.reason ?? "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AsyncContent>
        </Panel>
    );
}

export function Credit() {
    const user = useCurrentUser();
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <CreditForm userId={user.id} />
            <CreditList userId={user.id} />
        </div>
    );
}
