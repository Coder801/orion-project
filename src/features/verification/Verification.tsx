"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    BadgeCheckIcon,
    ClockIcon,
    FileUpIcon,
    ShieldXIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { putBlob } from "@/data/blobStore";
import type { KycStatus } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { FileUpload } from "@/features/verification/FileUpload";
import {
    ACCEPTED_FILE_TYPES,
    COUNTRIES,
    DOCUMENT_TYPES,
    IMAGE_FILE_TYPES,
    KYC_STEPS,
    kycSchema,
    type KycValues,
} from "@/features/verification/schemas";
import { formatDate } from "@/lib/format";
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
    action,
}: {
    status: KycStatus;
    reason?: string;
    date?: string;
    action?: ReactNode;
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
                    {status === "pending" && (
                        <p className="mt-2 text-sm">{t("expectedTime")}</p>
                    )}
                    {date && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t("submittedAt", {
                                date: formatDate(date, language, "dateTime"),
                            })}
                        </p>
                    )}
                    {action && <div className="mt-4">{action}</div>}
                </div>
            </div>
        </Panel>
    );
}

function KycWizard({ userId }: { userId: string }) {
    const t = useTranslations("verification");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const [step, setStep] = useState(0);
    const [submitKyc, { isLoading, error }] = useSubmitKycMutation();
    const {
        register,
        handleSubmit,
        trigger,
        control,
        formState: { errors },
    } = useForm<KycValues>({
        resolver: zodResolver(kycSchema),
        mode: "onTouched",
    });
    const documentType = useWatch({ control, name: "document.type" });
    const current = KYC_STEPS[step] ?? "personal";
    const isLast = step === KYC_STEPS.length - 1;

    const next = async () => {
        if (await trigger(current)) setStep((s) => s + 1);
    };

    const onSubmit = handleSubmit(async (values) => {
        // Files go to the in-memory blob store; only their metadata is submitted.
        const { front, back, ...document } = values.document;
        await submitKyc({
            userId,
            input: {
                personal: values.personal,
                document: {
                    ...document,
                    files: [front, ...(back ? [back] : [])].map(putBlob),
                },
                selfie: putBlob(values.selfie),
                address: {
                    line1: values.address.line1,
                    city: values.address.city,
                    postalCode: values.address.postalCode,
                    proof: [putBlob(values.address.proof)],
                },
            },
        });
    });

    return (
        <Panel title={t("formTitle")} description={t("providerNote")}>
            <ol
                className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
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
                        <Controller
                            control={control}
                            name="document.front"
                            render={({ field }) => (
                                <FileUpload
                                    label={t(
                                        documentType === "passport"
                                            ? "fields.photoPage"
                                            : "fields.front",
                                    )}
                                    hint={t("fields.filesHint")}
                                    accept={ACCEPTED_FILE_TYPES}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldError(errors.document?.front)}
                                />
                            )}
                        />
                        {documentType !== "passport" && (
                            <Controller
                                control={control}
                                name="document.back"
                                render={({ field }) => (
                                    <FileUpload
                                        label={t("fields.back")}
                                        hint={t("fields.filesHint")}
                                        accept={ACCEPTED_FILE_TYPES}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={fieldError(
                                            errors.document?.back,
                                        )}
                                    />
                                )}
                            />
                        )}
                    </div>
                )}

                {current === "selfie" && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t("selfieText")}
                        </p>
                        <Controller
                            control={control}
                            name="selfie"
                            render={({ field }) => (
                                <FileUpload
                                    label={t("fields.selfie")}
                                    hint={t("fields.selfieHint")}
                                    accept={IMAGE_FILE_TYPES}
                                    capture="user"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldError(errors.selfie)}
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
                        <div className="sm:col-span-2">
                            <Controller
                                control={control}
                                name="address.proof"
                                render={({ field }) => (
                                    <FileUpload
                                        label={t("fields.proof")}
                                        hint={t("fields.proofHint")}
                                        accept={ACCEPTED_FILE_TYPES}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={fieldError(
                                            errors.address?.proof,
                                        )}
                                    />
                                )}
                            />
                        </div>
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
    const tv = useTranslations("verification");
    const user = useCurrentUser();
    const me = useMeQuery(user.id);
    const kyc = useKycQuery(user.id);
    const [resubmitting, setResubmitting] = useState(false);
    const status = me.data?.kycStatus ?? "none";

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
                    date={status === "none" ? undefined : kyc.data?.createdAt}
                    action={
                        status === "rejected" &&
                        !resubmitting && (
                            <Button
                                variant="gradient"
                                onClick={() => setResubmitting(true)}
                            >
                                {tv("resubmit")}
                            </Button>
                        )
                    }
                />
                {(status === "none" ||
                    (status === "rejected" && resubmitting)) && (
                    <KycWizard userId={user.id} />
                )}
            </div>
        </AsyncContent>
    );
}
