"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LifeBuoyIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import {
    SelectField,
    TextareaField,
    TextField,
} from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useCurrentUser } from "@/features/auth/session";
import {
    TICKET_CATEGORIES,
    ticketSchema,
    type TicketValues,
} from "@/features/products/schemas";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { useCreateTicketMutation, useTicketsQuery } from "@/store/api";

function TicketForm({ userId }: { userId: string }) {
    const t = useTranslations("support");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const [createTicket, { isLoading, isSuccess, error }] =
        useCreateTicketMutation();
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<TicketValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { subject: "", message: "" },
    });

    const onSubmit = handleSubmit(async (input) => {
        const result = await createTicket({ userId, input });
        if ("data" in result) reset();
    });

    return (
        <Panel title={t("formTitle")}>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess show={isSuccess} message={t("created")} />
                <FormError message={apiError(error)} />
                <TextField
                    label={t("fields.subject")}
                    error={fieldError(errors.subject)}
                    {...register("subject")}
                />
                <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            value={field.value ?? ""}
                            label={t("fields.category")}
                            placeholder={t("fields.choose")}
                            options={TICKET_CATEGORIES.map((c) => ({
                                value: c,
                                label: t(`categories.${c}`),
                            }))}
                            error={fieldError(errors.category)}
                        />
                    )}
                />
                <TextareaField
                    label={t("fields.message")}
                    rows={5}
                    error={fieldError(errors.message)}
                    {...register("message")}
                />
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

function TicketList({ userId }: { userId: string }) {
    const t = useTranslations("support");
    const language = useLocale();
    const { data = [], isLoading, isError, refetch } = useTicketsQuery(userId);

    return (
        <Panel title={t("listTitle")}>
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={data.length === 0}
                onRetry={refetch}
                loadingLabel={t("listTitle")}
                empty={{ title: t("empty"), icon: LifeBuoyIcon }}
            >
                <ul className="-my-3 divide-y">
                    {data.map((ticket) => (
                        <li key={ticket.id} className="py-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {ticket.subject}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t(`categories.${ticket.category}`)} ·{" "}
                                        {formatDate(
                                            ticket.createdAt,
                                            language,
                                            "dateTime",
                                        )}
                                    </p>
                                </div>
                                <StatusBadge status={ticket.status} />
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                {ticket.message}
                            </p>
                        </li>
                    ))}
                </ul>
            </AsyncContent>
        </Panel>
    );
}

export function Support() {
    const user = useCurrentUser();
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <TicketForm userId={user.id} />
            <TicketList userId={user.id} />
        </div>
    );
}
