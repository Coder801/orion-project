"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeftRightIcon,
    CreditCardIcon,
    GlobeIcon,
    LandmarkIcon,
    type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { SelectField, TextField } from "@/components/ui/FormField";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
    addMinor,
    cmpMinor,
    decimalToMinor,
    feeFromBps,
    maxAmountWithFee,
    minorToDecimal,
} from "@/domain/money";
import { availableBalance, railSupports } from "@/domain/rules";
import type {
    Account,
    AnyRequest,
    Beneficiary,
    PlatformSettings,
} from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import {
    isValidBic,
    isValidCardNumber,
    isValidIban,
} from "@/features/payments/fieldSchema";
import { amountLimitsSchema, limitsOf } from "@/features/payments/limits";
import type { TransferTargetInput } from "@/features/payments/service";
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
import { COUNTRIES } from "@/features/verification/schemas";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { cn } from "@/lib/utils";
import { amountSchema, emailSchema, requiredString } from "@/lib/validation";
import { useBeneficiariesQuery, useCreateTransferMutation } from "@/store/api";

const TRANSFER_TYPES = ["sepa", "wire", "card", "internal"] as const;
type TransferType = (typeof TRANSFER_TYPES)[number];

const TYPE_ICON: Record<TransferType, LucideIcon> = {
    sepa: LandmarkIcon,
    wire: GlobeIcon,
    card: CreditCardIcon,
    internal: ArrowLeftRightIcon,
};

const INTERNAL_KINDS = ["own", "user"] as const;
type InternalKind = (typeof INTERNAL_KINDS)[number];

const NEW_BENEFICIARY = "new";

interface TransferValues {
    type: TransferType;
    fromAccountId: string;
    internalKind: InternalKind;
    toAccountId: string;
    email: string;
    beneficiaryId: string;
    name: string;
    iban: string;
    bic: string;
    bankAddress: string;
    bankCountry: string;
    cardNumber: string;
    reference: string;
    amount: string;
    save: boolean;
}

const DEFAULTS: TransferValues = {
    type: "sepa",
    fromAccountId: "",
    internalKind: "own",
    toAccountId: "",
    email: "",
    beneficiaryId: NEW_BENEFICIARY,
    name: "",
    iban: "",
    bic: "",
    bankAddress: "",
    bankCountry: "",
    cardNumber: "",
    reference: "",
    amount: "",
    save: false,
};

const holderName = requiredString()
    .max(70)
    .refine((v) => /^[\p{L}][\p{L} .'&-]{1,69}$/u.test(v), {
        error: "holderName",
    });

function sourceAccounts(
    settings: PlatformSettings,
    accounts: Account[],
    type: TransferType,
): Account[] {
    return accounts.filter((a) => {
        const currency = settings.currencies.find(
            (c) => c.code === a.currency && c.enabled,
        );
        if (!currency) return false;
        return type === "internal" || railSupports(type, currency);
    });
}

function buildSchema(
    { settings, accounts }: WalletData,
    beneficiaries: Beneficiary[],
    values: TransferValues,
) {
    const from = accounts.find((a) => a.id === values.fromAccountId);
    const currency = settings.currencies.find((c) => c.code === from?.currency);
    const decimals = currency?.decimals ?? 2;
    const external = values.type !== "internal";
    const saved = beneficiaries.find((b) => b.id === values.beneficiaryId);
    const needsDetails = external && !saved;
    const text = z.string().trim();

    return z
        .object({
            type: z.enum(TRANSFER_TYPES),
            fromAccountId: requiredString(),
            internalKind: z.enum(INTERNAL_KINDS),
            toAccountId:
                !external && values.internalKind === "own"
                    ? requiredString()
                    : z.string(),
            email:
                !external && values.internalKind === "user"
                    ? emailSchema
                    : z.string(),
            beneficiaryId: z.string(),
            name: needsDetails ? holderName : z.string(),
            iban:
                needsDetails && values.type !== "card"
                    ? requiredString().refine(isValidIban, { error: "iban" })
                    : z.string(),
            bic:
                needsDetails && values.type === "wire"
                    ? requiredString().refine(isValidBic, { error: "bic" })
                    : needsDetails && values.type === "sepa"
                      ? text.refine((v) => v === "" || isValidBic(v), {
                            error: "bic",
                        })
                      : z.string(),
            bankAddress:
                needsDetails && values.type === "wire"
                    ? requiredString().max(140)
                    : z.string(),
            bankCountry:
                needsDetails && values.type === "wire"
                    ? requiredString()
                    : z.string(),
            cardNumber:
                needsDetails && values.type === "card"
                    ? requiredString().refine(isValidCardNumber, {
                          error: "cardNumber",
                      })
                    : z.string(),
            reference: text.max(140),
            amount: external
                ? amountLimitsSchema(settings, currency)
                : amountSchema(decimals),
            save: z.boolean(),
        })
        .superRefine((v, ctx) => {
            if (
                !external &&
                v.internalKind === "own" &&
                v.toAccountId &&
                v.toAccountId === v.fromAccountId
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: "sameAccount",
                    path: ["toAccountId"],
                });
            }
            if (!from) return;
            let amount: string;
            try {
                amount = decimalToMinor(v.amount, decimals);
            } catch {
                return;
            }
            const total = addMinor(
                amount,
                feeFromBps(amount, settings.fees.transferBps),
            );
            if (cmpMinor(total, availableBalance(from)) > 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "insufficientFunds",
                    path: ["amount"],
                });
            }
        });
}

function targetOf(
    values: TransferValues,
    saved: Beneficiary | undefined,
): TransferTargetInput {
    if (values.type === "internal") {
        return values.internalKind === "own"
            ? { kind: "own", accountId: values.toAccountId }
            : { kind: "user", email: values.email };
    }
    const reference = values.reference.trim() || undefined;
    if (saved) {
        return {
            kind: "external",
            rail: values.type,
            reference,
            beneficiary: {
                name: saved.name,
                iban: saved.iban,
                bic: saved.bic,
                bankAddress: saved.bankAddress,
                bankCountry: saved.bankCountry,
                cardToken: saved.cardToken,
                cardLast4: saved.cardLast4,
            },
        };
    }
    return {
        kind: "external",
        rail: values.type,
        reference,
        save: values.save,
        beneficiary: {
            name: values.name,
            iban: values.iban || undefined,
            bic: values.bic || undefined,
            bankAddress: values.bankAddress || undefined,
            bankCountry: values.bankCountry || undefined,
            cardNumber: values.cardNumber || undefined,
        },
    };
}

function beneficiaryLabel(b: Beneficiary): string {
    if (b.cardLast4) return `${b.name} · •••• ${b.cardLast4}`;
    return `${b.name} · ${b.iban?.slice(0, 4)} ···· ${b.iban?.slice(-4)}`;
}

function TypeCards({
    value,
    onChange,
}: {
    value: TransferType;
    onChange: (value: TransferType) => void;
}) {
    const t = useTranslations("transfer");
    return (
        <RadioGroup
            aria-label={t("typeLabel")}
            value={value}
            onValueChange={(next) => onChange(next as TransferType)}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
            {TRANSFER_TYPES.map((type) => {
                const Icon = TYPE_ICON[type];
                return (
                    <label
                        key={type}
                        className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                            value === type
                                ? "border-primary/50 bg-primary/10 shadow-[0_0_24px_-10px_var(--glow-primary)]"
                                : "hover:border-primary/30",
                        )}
                    >
                        <RadioGroupItem value={type} className="sr-only" />
                        <span
                            aria-hidden
                            className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary"
                        >
                            <Icon className="size-4" />
                        </span>
                        <span>
                            <span className="block font-medium">
                                {t(`types.${type}.title`)}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                {t(`types.${type}.text`)}
                            </span>
                        </span>
                    </label>
                );
            })}
        </RadioGroup>
    );
}

function TransferFormInner(
    data: WalletData & { beneficiaries: Beneficiary[] },
) {
    const { settings, accounts, beneficiaries } = data;
    const t = useTranslations("transfer");
    const tr = useTranslations();
    const user = useCurrentUser();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const { accountOptions } = useGroupedOptions();
    const [createTransfer, mutation] = useCreateTransferMutation();
    const [pending, setPending] = useState<TransferValues | null>(null);
    const [result, setResult] = useState<AnyRequest | null>(null);
    const bps = settings.fees.transferBps;

    const resolver: Resolver<TransferValues> = (values, context, options) =>
        zodResolver(buildSchema(data, beneficiaries, values))(
            values,
            context,
            options,
        ) as ReturnType<Resolver<TransferValues>>;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm<TransferValues>({ resolver, defaultValues: DEFAULTS });
    const [type, fromAccountId, internalKind, beneficiaryId, amountInput] =
        useWatch({
            control,
            name: [
                "type",
                "fromAccountId",
                "internalKind",
                "beneficiaryId",
                "amount",
            ],
        });
    const external = type !== "internal";
    const sources = sourceAccounts(settings, accounts, type);
    const from = accounts.find((a) => a.id === fromAccountId);
    const currency = settings.currencies.find((c) => c.code === from?.currency);
    const ownTargets = accounts.filter(
        (a) => a.id !== fromAccountId && a.currency === from?.currency,
    );
    const savedForRail = beneficiaries.filter((b) => b.rail === type);
    const saved = savedForRail.find((b) => b.id === beneficiaryId);
    const limits = external ? limitsOf(settings, currency) : null;

    // A source account may not support the newly selected rail.
    useEffect(() => {
        if (fromAccountId && !sources.some((a) => a.id === fromAccountId))
            setValue("fromAccountId", "");
    }, [fromAccountId, sources, setValue]);
    useEffect(() => {
        setValue("beneficiaryId", NEW_BENEFICIARY);
    }, [type, setValue]);

    const amountMinor = (() => {
        if (!currency) return null;
        try {
            return decimalToMinor(amountInput, currency.decimals);
        } catch {
            return null;
        }
    })();
    const fee = amountMinor ? feeFromBps(amountMinor, bps) : null;

    const fillMax = () => {
        if (!from || !currency) return;
        setValue(
            "amount",
            minorToDecimal(
                maxAmountWithFee(availableBalance(from), bps),
                currency.decimals,
            ),
            { shouldValidate: true },
        );
    };

    const onSubmit = handleSubmit((values) => {
        mutation.reset();
        setPending(values);
    });

    const confirm = async (code: string) => {
        if (!pending) return;
        const response = await createTransfer({
            userId: user.id,
            fromAccountId: pending.fromAccountId,
            amount: pending.amount,
            target: targetOf(pending, saved),
            code,
        });
        if ("data" in response && response.data) {
            setPending(null);
            setResult(response.data);
            reset({ ...DEFAULTS, type: pending.type });
        }
    };

    const recipientOf = (values: TransferValues): string => {
        if (values.type === "internal") {
            if (values.internalKind === "user") return values.email;
            const target = accounts.find((a) => a.id === values.toAccountId);
            return target ? accountLabel(target) : "";
        }
        if (saved) return beneficiaryLabel(saved);
        return values.type === "card"
            ? `${values.name} · •••• ${values.cardNumber.replace(/\D/g, "").slice(-4)}`
            : `${values.name} · ${values.iban.replace(/\s+/g, "").toUpperCase()}`;
    };

    const summaryItems = (
        values: TransferValues,
    ): [string, ReactNode, boolean?][] => {
        if (!from || !amountMinor || !fee) return [];
        return [
            [t("summary.type"), t(`types.${values.type}.title`)],
            [t("summary.from"), accountLabel(from)],
            [t("summary.recipient"), recipientOf(values)],
            ...(values.reference.trim()
                ? [
                      [t("fields.reference"), values.reference.trim()] as [
                          string,
                          string,
                      ],
                  ]
                : []),
            [t("summary.amount"), formatMoney(amountMinor, from.currency)],
            [t("summary.fee"), formatMoney(fee, from.currency)],
            [t("summary.rate"), t("summary.noConversion")],
            [
                t("summary.total"),
                formatMoney(addMinor(amountMinor, fee), from.currency),
                true,
            ],
        ];
    };

    if (result && result.kind === "transfer") {
        const { payload } = result;
        return (
            <RequestResult
                request={result}
                title={t("resultTitle")}
                items={[
                    [
                        t("summary.amount"),
                        formatMoney(payload.amount, payload.currency),
                        true,
                    ],
                    [
                        t("summary.fee"),
                        formatMoney(payload.fee, payload.currency),
                    ],
                ]}
                onReset={() => setResult(null)}
                resetLabel={t("again")}
            />
        );
    }

    return (
        <>
            <form onSubmit={onSubmit} noValidate className="space-y-6">
                <TypeCards
                    value={type}
                    onChange={(value) => setValue("type", value)}
                />

                <Panel>
                    <div className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Controller
                                control={control}
                                name="fromAccountId"
                                render={({ field }) => (
                                    <SelectField
                                        {...field}
                                        label={t("from")}
                                        placeholder={t("chooseAccount")}
                                        hint={
                                            type === "sepa"
                                                ? t("sepaEurOnly")
                                                : undefined
                                        }
                                        options={accountOptions(sources)}
                                        error={fieldError(errors.fromAccountId)}
                                    />
                                )}
                            />
                            <TextField
                                label={t("sender")}
                                value={user.name}
                                readOnly
                                disabled
                            />
                        </div>

                        {external ? (
                            <fieldset className="grid gap-5 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2 sm:p-5">
                                <legend className="px-1 text-sm font-medium">
                                    {t("recipient")}
                                </legend>
                                {savedForRail.length > 0 && (
                                    <Controller
                                        control={control}
                                        name="beneficiaryId"
                                        render={({ field }) => (
                                            <SelectField
                                                {...field}
                                                label={t("savedBeneficiaries")}
                                                containerClassName="sm:col-span-2"
                                                options={[
                                                    {
                                                        value: NEW_BENEFICIARY,
                                                        label: t(
                                                            "newBeneficiary",
                                                        ),
                                                    },
                                                    ...savedForRail.map(
                                                        (b) => ({
                                                            value: b.id,
                                                            label: beneficiaryLabel(
                                                                b,
                                                            ),
                                                        }),
                                                    ),
                                                ]}
                                            />
                                        )}
                                    />
                                )}
                                {!saved && (
                                    <>
                                        <TextField
                                            label={t("fields.name")}
                                            autoComplete="off"
                                            containerClassName={
                                                type === "card"
                                                    ? undefined
                                                    : "sm:col-span-2"
                                            }
                                            error={fieldError(errors.name)}
                                            {...register("name")}
                                        />
                                        {type === "card" ? (
                                            <TextField
                                                label={t("fields.cardNumber")}
                                                hint={t("cardTokenHint")}
                                                inputMode="numeric"
                                                autoComplete="off"
                                                error={fieldError(
                                                    errors.cardNumber,
                                                )}
                                                {...register("cardNumber")}
                                            />
                                        ) : (
                                            <>
                                                <TextField
                                                    label={t("fields.iban")}
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    error={fieldError(
                                                        errors.iban,
                                                    )}
                                                    {...register("iban")}
                                                />
                                                <TextField
                                                    label={
                                                        type === "wire"
                                                            ? t("fields.bic")
                                                            : tr(
                                                                  "payments.optional",
                                                                  {
                                                                      label: t(
                                                                          "fields.bic",
                                                                      ),
                                                                  },
                                                              )
                                                    }
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    error={fieldError(
                                                        errors.bic,
                                                    )}
                                                    {...register("bic")}
                                                />
                                            </>
                                        )}
                                        {type === "wire" && (
                                            <>
                                                <TextField
                                                    label={t(
                                                        "fields.bankAddress",
                                                    )}
                                                    autoComplete="off"
                                                    error={fieldError(
                                                        errors.bankAddress,
                                                    )}
                                                    {...register("bankAddress")}
                                                />
                                                <Controller
                                                    control={control}
                                                    name="bankCountry"
                                                    render={({ field }) => (
                                                        <SelectField
                                                            {...field}
                                                            label={t(
                                                                "fields.bankCountry",
                                                            )}
                                                            placeholder={t(
                                                                "chooseCountry",
                                                            )}
                                                            options={COUNTRIES.map(
                                                                (c) => ({
                                                                    value: c,
                                                                    label: tr(
                                                                        `verification.countries.${c}`,
                                                                    ),
                                                                }),
                                                            )}
                                                            error={fieldError(
                                                                errors.bankCountry,
                                                            )}
                                                        />
                                                    )}
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                                {type !== "card" && (
                                    <TextField
                                        label={tr("payments.optional", {
                                            label: t("fields.reference"),
                                        })}
                                        maxLength={140}
                                        containerClassName="sm:col-span-2"
                                        error={fieldError(errors.reference)}
                                        {...register("reference")}
                                    />
                                )}
                                {!saved && (
                                    <Controller
                                        control={control}
                                        name="save"
                                        render={({ field }) => (
                                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        field.onChange(
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                                {t("saveBeneficiary")}
                                            </label>
                                        )}
                                    />
                                )}
                            </fieldset>
                        ) : (
                            <div className="space-y-3">
                                <Label id="transfer-target-label">
                                    {t("to")}
                                </Label>
                                <Tabs
                                    value={internalKind}
                                    onValueChange={(value) =>
                                        setValue(
                                            "internalKind",
                                            value as InternalKind,
                                        )
                                    }
                                >
                                    <TabsList aria-labelledby="transfer-target-label">
                                        {INTERNAL_KINDS.map((kind) => (
                                            <TabsTrigger
                                                key={kind}
                                                value={kind}
                                            >
                                                {t(`targets.${kind}`)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                                {internalKind === "own" ? (
                                    <Controller
                                        control={control}
                                        name="toAccountId"
                                        render={({ field }) => (
                                            <SelectField
                                                {...field}
                                                label={t("toAccount")}
                                                placeholder={t("chooseAccount")}
                                                disabled={!from}
                                                hint={
                                                    from &&
                                                    ownTargets.length === 0
                                                        ? t("noOwnTargets")
                                                        : undefined
                                                }
                                                options={ownTargets.map(
                                                    (a) => ({
                                                        value: a.id,
                                                        label: accountLabel(a),
                                                    }),
                                                )}
                                                error={fieldError(
                                                    errors.toAccountId,
                                                )}
                                            />
                                        )}
                                    />
                                ) : (
                                    <TextField
                                        type="email"
                                        label={t("recipientEmail")}
                                        hint={t("recipientHint")}
                                        error={fieldError(errors.email)}
                                        {...register("email")}
                                    />
                                )}
                            </div>
                        )}

                        <TextField
                            label={t("amount")}
                            inputMode="decimal"
                            placeholder="0.00"
                            endAdornment={from?.currency}
                            endAction={
                                from && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs"
                                        onClick={fillMax}
                                    >
                                        {tr("payments.max")}
                                    </Button>
                                )
                            }
                            hint={
                                from
                                    ? [
                                          tr("payments.availableHint", {
                                              amount: formatMoney(
                                                  availableBalance(from),
                                                  from.currency,
                                              ),
                                          }),
                                          limits &&
                                              tr("payments.limitsHint", {
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
                        <p className="text-xs text-muted-foreground">
                            {t("reviewNotice")}
                        </p>
                        <SubmitButton
                            pending={false}
                            pendingLabel={tr("common.loading")}
                            variant="gradient"
                        >
                            {t("continue")}
                        </SubmitButton>
                    </div>
                </Panel>
            </form>

            <ConfirmCodeDialog
                open={pending !== null}
                onOpenChange={(open) => {
                    if (!open) setPending(null);
                }}
                title={t("confirmTitle")}
                summary={
                    pending && <SummaryList items={summaryItems(pending)} />
                }
                pending={mutation.isLoading}
                error={apiError(mutation.error)}
                onConfirm={confirm}
            />
        </>
    );
}

export function TransferForm() {
    const user = useCurrentUser();
    const beneficiaries = useBeneficiariesQuery(user.id);
    return (
        <WithWalletData>
            {(data) => (
                <TransferFormInner
                    {...data}
                    beneficiaries={beneficiaries.data ?? []}
                />
            )}
        </WithWalletData>
    );
}
