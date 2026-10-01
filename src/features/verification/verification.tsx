"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    BadgeCheckIcon,
    ClockIcon,
    FileUpIcon,
    ShieldXIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { putBlob } from "@/data/blobStore";
import type { KycStatus } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/async-content";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError } from "@/features/shared/form-status";
import { Panel } from "@/features/shared/panel";
import { StatusBadge } from "@/features/shared/status-badge";
import {
    ACCEPTED_FILE_TYPES,
    COUNTRIES,
    DOCUMENT_TYPES,
    KYC_STEPS,
    kycSchema,
    type KycValues,
} from "@/features/verification/schemas";
import { formatBytes, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useKycQuery, useMeQuery, useSubmitKycMutation } from "@/store/api";

const STATUS_ICON = {
    none: FileUpIcon,
    pending: ClockIcon,
    approved: BadgeCheckIcon,
    rejected: ShieldXIcon,
};

function StatusCard({
    status,
    reason,
    date,
}: {
    status: KycStatus;
    reason?: string;
    date?: string;
}) {
    const t = useTranslations("verification");
    const language = useLocale();
    const Icon = STATUS_ICON[status];
    return (
        <Panel>
            <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_-6px_var(--glow-primary)]">
                    <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading font-semibold">
                            {t("statusTitle")}
                        </h2>
                        <StatusBadge status={status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(`statusText.${status}`)}
                    </p>
                    {reason && (
                        <p className="mt-2 text-sm text-destructive">
                            {t("rejectionReason", { reason })}
                        </p>
                    )}
                    {date && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t("submittedAt", {
                                date: formatDate(date, language, "dateTime"),
                            })}
                        </p>
                    )}
                </div>
            </div>
        </Panel>
    );
}

function KycWizard({ userId }: { userId: string }) {
    const t = useTranslations("verification");
    const tc = useTranslations("common");
    const language = useLocale();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const [step, setStep] = useState(0);
    const [submitKyc, { isLoading, error }] = useSubmitKycMutation();
    const {
        register,
        handleSubmit,
        trigger,
        setValue,
        control,
        formState: { errors },
    } = useForm<KycValues>({
        resolver: zodResolver(kycSchema),
        mode: "onTouched",
    });
    const files = useWatch({ control, name: "document.files" }) ?? [];
    const current = KYC_STEPS[step] ?? "personal";
    const isLast = step === KYC_STEPS.length - 1;

    const next = async () => {
        if (await trigger(current)) setStep((s) => s + 1);
    };

    const onSubmit = handleSubmit(async (values) => {
        // Files go to the in-memory blob store; only their metadata is submitted.
        const stored = values.document.files.map(putBlob);
        await submitKyc({
            userId,
            input: {
                ...values,
                document: { ...values.document, files: stored },
            },
        });
    });

    const filesError = errors.document?.files;
    return (
        <Panel title={t("formTitle")}>
            <ol
                className="mb-6 grid grid-cols-3 gap-2"
                aria-label={t("stepsLabel")}
            >
                {KYC_STEPS.map((key, index) => (
                    <li
                        key={key}
                        aria-current={index === step ? "step" : undefined}
                        className={cn(
                            "text-xs font-medium",
                            index <= step
                                ? "text-foreground"
                                : "text-muted-foreground",
                        )}
                    >
                        <span
                            aria-hidden
                            className={cn(
                                "mb-2 block h-1 rounded-full transition-colors",
                                index <= step
                                    ? "bg-linear-to-r from-primary to-secondary"
                                    : "bg-muted",
                            )}
                        />
                        {t("stepN", { n: index + 1 })} · {t(`steps.${key}`)}
                    </li>
                ))}
            </ol>

            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormError message={apiError(error)} />

                {current === "personal" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            label={t("fields.firstName")}
                            autoComplete="given-name"
                            error={fieldError(errors.personal?.firstName)}
                            {...register("personal.firstName")}
                        />
                        <TextField
                            label={t("fields.lastName")}
                            autoComplete="family-name"
                            error={fieldError(errors.personal?.lastName)}
                            {...register("personal.lastName")}
                        />
                        <TextField
                            type="date"
                            label={t("fields.birthDate")}
                            autoComplete="bday"
                            error={fieldError(errors.personal?.birthDate)}
                            {...register("personal.birthDate")}
                        />
                        <Controller
                            control={control}
                            name="personal.country"
                            render={({ field }) => (
                                <SelectField
                                    {...field}
                                    value={field.value ?? ""}
                                    label={t("fields.country")}
                                    placeholder={t("fields.choose")}
                                    options={COUNTRIES.map((c) => ({
                                        value: c,
                                        label: t(`countries.${c}`),
                                    }))}
                                    error={fieldError(errors.personal?.country)}
                                />
                            )}
                        />
                    </div>
                )}

                {current === "address" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            label={t("fields.line1")}
                            autoComplete="address-line1"
                            containerClassName="sm:col-span-2"
                            error={fieldError(errors.address?.line1)}
                            {...register("address.line1")}
                        />
                        <TextField
                            label={t("fields.city")}
                            autoComplete="address-level2"
                            error={fieldError(errors.address?.city)}
                            {...register("address.city")}
                        />
                        <TextField
                            label={t("fields.postalCode")}
                            autoComplete="postal-code"
                            error={fieldError(errors.address?.postalCode)}
                            {...register("address.postalCode")}
                        />
                    </div>
                )}

                {current === "document" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Controller
                            control={control}
                            name="document.type"
                            render={({ field }) => (
                                <SelectField
                                    {...field}
                                    value={field.value ?? ""}
                                    label={t("fields.documentType")}
                                    placeholder={t("fields.choose")}
                                    options={DOCUMENT_TYPES.map((d) => ({
                                        value: d,
                                        label: t(`documentTypes.${d}`),
                                    }))}
                                    error={fieldError(errors.document?.type)}
                                />
                            )}
                        />
                        <TextField
                            label={t("fields.documentNumber")}
                            autoComplete="off"
                            error={fieldError(errors.document?.number)}
                            {...register("document.number")}
                        />
                        <TextField
                            type="file"
                            multiple
                            accept={ACCEPTED_FILE_TYPES.join(",")}
                            label={t("fields.files")}
                            hint={t("fields.filesHint")}
                            containerClassName="sm:col-span-2"
                            className="h-auto py-2 file:mr-3 file:rounded-full file:bg-muted file:px-3"
                            error={fieldError(
                                filesError?.message
                                    ? filesError
                                    : filesError?.[0],
                            )}
                            onChange={(event) =>
                                setValue(
                                    "document.files",
                                    Array.from(event.target.files ?? []),
                                    { shouldValidate: true },
                                )
                            }
                        />
                        {files.length > 0 && (
                            <ul className="space-y-1 text-sm text-muted-foreground sm:col-span-2">
                                {files.map((file) => (
                                    <li key={`${file.name}-${file.size}`}>
                                        {file.name} ·{" "}
                                        {formatBytes(file.size, language)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div className="flex justify-between gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={step === 0}
                        onClick={() => setStep((s) => s - 1)}
                    >
                        {t("back")}
                    </Button>
                    {isLast ? (
                        <SubmitButton
                            pending={isLoading}
                            pendingLabel={tc("loading")}
                            variant="gradient"
                        >
                            {t("submit")}
                        </SubmitButton>
                    ) : (
                        <Button type="button" onClick={next}>
                            {t("next")}
                        </Button>
                    )}
                </div>
            </form>
        </Panel>
    );
}

export function Verification() {
    const t = useTranslations("common");
    const user = useCurrentUser();
    const me = useMeQuery(user.id);
    const kyc = useKycQuery(user.id);
    const status = me.data?.kycStatus ?? "none";
    const canSubmit = status === "none" || status === "rejected";

    return (
        <AsyncContent
            isLoading={me.isLoading || kyc.isLoading}
            isError={me.isError || kyc.isError}
            onRetry={() => {
                me.refetch();
                kyc.refetch();
            }}
            loadingLabel={t("loading")}
        >
            <div className="space-y-6">
                <StatusCard
                    status={status}
                    reason={
                        status === "rejected" ? kyc.data?.reason : undefined
                    }
                    date={kyc.data?.createdAt}
                />
                {canSubmit && <KycWizard userId={user.id} />}
            </div>
        </AsyncContent>
    );
}
