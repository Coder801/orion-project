"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCardIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";

import { SelectField, TextareaField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SubmitButton } from "@/components/ui/submit-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import {
    CARD_TIERS,
    CARD_TYPES,
    cardOrderSchema,
    type CardOrderValues,
} from "@/features/products/schemas";
import { AsyncContent } from "@/features/shared/async-content";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/form-status";
import { Panel } from "@/features/shared/panel";
import { StatusBadge } from "@/features/shared/status-badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
    useAccountsQuery,
    useCardOrdersQuery,
    useOrderCardMutation,
} from "@/store/api";

function CardOrderForm({ userId }: { userId: string }) {
    const t = useTranslations("cards");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const { data: accounts = [] } = useAccountsQuery(userId);
    const [orderCard, { isLoading, isSuccess, error }] = useOrderCardMutation();
    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors },
    } = useForm<CardOrderValues>({
        resolver: zodResolver(cardOrderSchema),
        defaultValues: {
            type: "virtual",
            tier: "standard",
            accountId: "",
            deliveryAddress: "",
        },
    });
    const type = useWatch({ control, name: "type" });

    const onSubmit = handleSubmit(async (input) => {
        const result = await orderCard({ userId, input });
        if ("data" in result) reset();
    });

    return (
        <Panel title={t("formTitle")}>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess show={isSuccess} message={t("created")} />
                <FormError message={apiError(error)} />

                <div className="space-y-3">
                    <Label id="card-type-label">{t("fields.type")}</Label>
                    <Tabs
                        value={type}
                        onValueChange={(value) =>
                            setValue("type", value as CardOrderValues["type"])
                        }
                    >
                        <TabsList aria-labelledby="card-type-label">
                            {CARD_TYPES.map((value) => (
                                <TabsTrigger key={value} value={value}>
                                    {t(`types.${value}`)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="space-y-3">
                    <Label id="card-tier-label">{t("fields.tier")}</Label>
                    <Controller
                        control={control}
                        name="tier"
                        render={({ field }) => (
                            <RadioGroup
                                aria-labelledby="card-tier-label"
                                value={field.value}
                                onValueChange={(value) => field.onChange(value)}
                                className="grid gap-3 sm:grid-cols-2"
                            >
                                {CARD_TIERS.map((value) => (
                                    <label
                                        key={value}
                                        className={cn(
                                            "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                                            field.value === value
                                                ? "border-primary/50 bg-primary/10 shadow-[0_0_24px_-10px_var(--glow-primary)]"
                                                : "hover:border-primary/30",
                                        )}
                                    >
                                        <RadioGroupItem
                                            value={value}
                                            className="mt-0.5"
                                        />
                                        <span>
                                            <span className="block font-medium">
                                                {t(`tiers.${value}.name`)}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                                {t(`tiers.${value}.text`)}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </RadioGroup>
                        )}
                    />
                </div>

                <Controller
                    control={control}
                    name="accountId"
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            label={t("fields.account")}
                            placeholder={t("fields.choose")}
                            options={accounts.map((a) => ({
                                value: a.id,
                                label: accountLabel(a),
                            }))}
                            error={fieldError(errors.accountId)}
                        />
                    )}
                />
                {type === "physical" && (
                    <TextareaField
                        label={t("fields.deliveryAddress")}
                        rows={3}
                        autoComplete="street-address"
                        error={fieldError(errors.deliveryAddress)}
                        {...register("deliveryAddress")}
                    />
                )}
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

function CardOrderList({ userId }: { userId: string }) {
    const t = useTranslations("cards");
    const language = useLocale();
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useCardOrdersQuery(userId);
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
                empty={{ title: t("empty"), icon: CreditCardIcon }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-5 lg:pl-6">
                                {t("fields.date")}
                            </TableHead>
                            <TableHead>{t("fields.type")}</TableHead>
                            <TableHead>{t("fields.tier")}</TableHead>
                            <TableHead className="pr-5 lg:pr-6">
                                {t("fields.status")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                    {formatDate(order.createdAt, language)}
                                </TableCell>
                                <TableCell>
                                    {t(`types.${order.type}`)}
                                </TableCell>
                                <TableCell>
                                    {t(`tiers.${order.tier}.name`)}
                                </TableCell>
                                <TableCell className="pr-5 lg:pr-6">
                                    <StatusBadge status={order.status} />
                                    {order.reason && (
                                        <p className="mt-1 text-xs whitespace-normal text-muted-foreground">
                                            {order.reason}
                                        </p>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AsyncContent>
        </Panel>
    );
}

export function Cards() {
    const user = useCurrentUser();
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <CardOrderForm userId={user.id} />
            <CardOrderList userId={user.id} />
        </div>
    );
}
