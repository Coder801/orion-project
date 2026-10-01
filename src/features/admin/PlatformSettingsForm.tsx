"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { SwitchField, TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { PlatformSettings } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import {
    usePlatformSettingsQuery,
    useResetDemoMutation,
    useUpdatePlatformSettingsMutation,
} from "@/store/api";

const priceSchema = z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,8})?$/, { error: "price" })
    .refine((v) => /[1-9]/.test(v), { error: "price" });

const bpsSchema = z.coerce
    .number<string>()
    .int({ error: "bps" })
    .min(0, { error: "bps" })
    .max(10_000, { error: "bps" });

const settingsSchema = z.object({
    currencies: z.record(z.string(), z.boolean()),
    methods: z.record(z.string(), z.boolean()),
    prices: z.record(z.string(), priceSchema),
    fees: z.object({
        conversionBps: bpsSchema,
        withdrawalBps: bpsSchema,
        transferBps: bpsSchema,
    }),
});

type SettingsInput = z.input<typeof settingsSchema>;
type SettingsOutput = z.output<typeof settingsSchema>;

function toForm(settings: PlatformSettings): SettingsInput {
    return {
        currencies: Object.fromEntries(
            settings.currencies.map((c) => [c.code, c.enabled]),
        ),
        methods: Object.fromEntries(
            settings.methods.map((m) => [m.id, m.enabled]),
        ),
        prices: { ...settings.usdPrices },
        fees: {
            conversionBps: String(settings.fees.conversionBps),
            withdrawalBps: String(settings.fees.withdrawalBps),
            transferBps: String(settings.fees.transferBps),
        },
    };
}

function toPatch(
    settings: PlatformSettings,
    values: SettingsOutput,
): Partial<PlatformSettings> {
    return {
        currencies: settings.currencies.map((c) => ({
            ...c,
            enabled: values.currencies[c.code] ?? c.enabled,
        })),
        methods: settings.methods.map((m) => ({
            ...m,
            enabled: values.methods[m.id] ?? m.enabled,
        })),
        usdPrices: { ...settings.usdPrices, ...values.prices },
        fees: values.fees,
    };
}

const FEE_KEYS = ["conversionBps", "withdrawalBps", "transferBps"] as const;

function SettingsForm({
    settings,
    adminId,
}: {
    settings: PlatformSettings;
    adminId: string;
}) {
    const t = useTranslations("admin.settings");
    const tm = useTranslations("methods");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const [save, { isLoading, isSuccess, error }] =
        useUpdatePlatformSettingsMutation();
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<SettingsInput, unknown, SettingsOutput>({
        resolver: zodResolver(settingsSchema),
        defaultValues: toForm(settings),
    });

    const onSubmit = handleSubmit(async (values) => {
        const result = await save({
            adminId,
            patch: toPatch(settings, values),
        });
        if ("data" in result && result.data) reset(toForm(result.data));
    });

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-6">
            <FormError message={apiError(error)} />
            <div className="grid gap-6 xl:grid-cols-2">
                <Panel
                    title={t("currencies")}
                    description={t("currenciesHint")}
                >
                    <div className="space-y-5">
                        {settings.currencies.map((currency) => (
                            <div
                                key={currency.code}
                                className="grid items-start gap-3 sm:grid-cols-[1fr_12rem]"
                            >
                                <Controller
                                    control={control}
                                    name={`currencies.${currency.code}`}
                                    render={({ field }) => (
                                        <SwitchField
                                            label={currency.code}
                                            description={t(
                                                `types.${currency.type}`,
                                            )}
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <TextField
                                    aria-label={t("priceFor", {
                                        code: currency.code,
                                    })}
                                    inputMode="decimal"
                                    startAdornment="$"
                                    error={fieldError(
                                        errors.prices?.[currency.code],
                                    )}
                                    {...register(`prices.${currency.code}`)}
                                />
                            </div>
                        ))}
                    </div>
                </Panel>

                <div className="space-y-6">
                    <Panel title={t("methods")} description={t("methodsHint")}>
                        <div className="space-y-5">
                            {settings.methods.map((method) => (
                                <Controller
                                    key={method.id}
                                    control={control}
                                    name={`methods.${method.id}`}
                                    render={({ field }) => (
                                        <SwitchField
                                            label={tm(method.id as "sepa-in")}
                                            description={`${t(`kinds.${method.kind}`)} · ${method.currencies.join(", ")}`}
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            ))}
                        </div>
                    </Panel>

                    <Panel title={t("fees")} description={t("feesHint")}>
                        <div className="grid gap-5 sm:grid-cols-3">
                            {FEE_KEYS.map((key) => (
                                <TextField
                                    key={key}
                                    label={t(`feeLabels.${key}`)}
                                    inputMode="numeric"
                                    endAdornment={t("bps")}
                                    error={fieldError(errors.fees?.[key])}
                                    {...register(`fees.${key}`)}
                                />
                            ))}
                        </div>
                    </Panel>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <SubmitButton
                    pending={isLoading}
                    pendingLabel={tc("loading")}
                    disabled={!isDirty}
                    variant="gradient"
                >
                    {t("save")}
                </SubmitButton>
                <FormSuccess
                    show={isSuccess && !isDirty}
                    message={t("saved")}
                />
            </div>
        </form>
    );
}

function ResetDemo({ adminId }: { adminId: string }) {
    const t = useTranslations("admin.settings");
    const tc = useTranslations("common");
    const [open, setOpen] = useState(false);
    const [resetDemo, { isLoading }] = useResetDemoMutation();

    return (
        <>
            <Panel
                title={
                    <>
                        {t("resetTitle")}
                        <Badge
                            variant="warning"
                            className="px-2 py-0 text-[10px]"
                        >
                            {t("demoOnly")}
                        </Badge>
                    </>
                }
                description={t("resetHint")}
                actions={
                    <Button variant="outline" onClick={() => setOpen(true)}>
                        <RotateCcwIcon aria-hidden />
                        {t("reset")}
                    </Button>
                }
            />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("resetTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("resetConfirm")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            {t("cancel")}
                        </Button>
                        <SubmitButton
                            type="button"
                            pending={isLoading}
                            pendingLabel={tc("loading")}
                            variant="destructive"
                            onClick={async () => {
                                await resetDemo(adminId);
                                setOpen(false);
                            }}
                        >
                            {t("reset")}
                        </SubmitButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function PlatformSettingsForm() {
    const t = useTranslations("common");
    const admin = useCurrentUser();
    const { data, isLoading, isError, refetch, fulfilledTimeStamp } =
        usePlatformSettingsQuery();

    return (
        <AsyncContent
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            loadingLabel={t("loading")}
        >
            {data && (
                <div className="space-y-6">
                    {/* Remount after a reset so the form picks up the fresh defaults. */}
                    <SettingsForm
                        key={fulfilledTimeStamp}
                        settings={data}
                        adminId={admin.id}
                    />
                    <ResetDemo adminId={admin.id} />
                </div>
            )}
        </AsyncContent>
    );
}
