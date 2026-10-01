"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { SelectField, TextField } from "@/components/ui/FormField";
import { Label } from "@/components/ui/Label";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { addMinor, cmpMinor, decimalToMinor, feeFromBps } from "@/domain/money";
import { availableBalance } from "@/domain/rules";
import type { Account, PlatformSettings } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import {
    WithWalletData,
    type WalletData,
} from "@/features/shared/WithWalletData";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { amountSchema, emailSchema, requiredString } from "@/lib/validation";
import { useCreateTransferMutation } from "@/store/api";

const TARGET_KINDS = ["own", "user"] as const;
type TargetKind = (typeof TARGET_KINDS)[number];

interface TransferValues {
    fromAccountId: string;
    targetKind: TargetKind;
    toAccountId: string;
    email: string;
    amount: string;
}

function buildSchema(
    settings: PlatformSettings,
    accounts: Account[],
    values: TransferValues,
) {
    const from = accounts.find((a) => a.id === values.fromAccountId);
    const decimals =
        settings.currencies.find((c) => c.code === from?.currency)?.decimals ??
        2;

    return z
        .object({
            fromAccountId: requiredString(),
            targetKind: z.enum(TARGET_KINDS),
            toAccountId:
                values.targetKind === "own" ? requiredString() : z.string(),
            email: values.targetKind === "user" ? emailSchema : z.string(),
            amount: amountSchema(decimals),
        })
        .superRefine((v, ctx) => {
            if (
                v.targetKind === "own" &&
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

function TransferFormInner({ settings, accounts }: WalletData) {
    const t = useTranslations("transfer");
    const tc = useTranslations("common");
    const user = useCurrentUser();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const [createTransfer, { isLoading, isSuccess, error }] =
        useCreateTransferMutation();

    const resolver: Resolver<TransferValues> = (values, context, options) =>
        zodResolver(buildSchema(settings, accounts, values))(
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
    } = useForm<TransferValues>({
        resolver,
        defaultValues: {
            fromAccountId: "",
            targetKind: "own",
            toAccountId: "",
            email: "",
            amount: "",
        },
    });
    const [fromAccountId, targetKind] = useWatch({
        control,
        name: ["fromAccountId", "targetKind"],
    });
    const from = accounts.find((a) => a.id === fromAccountId);
    const ownTargets = accounts.filter(
        (a) => a.id !== fromAccountId && a.currency === from?.currency,
    );

    const onSubmit = handleSubmit(async (values) => {
        const result = await createTransfer({
            userId: user.id,
            fromAccountId: values.fromAccountId,
            amount: values.amount,
            target:
                values.targetKind === "own"
                    ? { kind: "own", accountId: values.toAccountId }
                    : { kind: "user", email: values.email },
        });
        if ("data" in result) reset();
    });

    return (
        <Panel>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess show={isSuccess} message={t("created")} />
                <FormError message={apiError(error)} />

                <Controller
                    control={control}
                    name="fromAccountId"
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            label={t("from")}
                            placeholder={t("chooseAccount")}
                            options={accounts.map((a) => ({
                                value: a.id,
                                label: `${accountLabel(a)} — ${formatMoney(availableBalance(a), a.currency)}`,
                            }))}
                            error={fieldError(errors.fromAccountId)}
                        />
                    )}
                />

                <div className="space-y-3">
                    <Label id="transfer-target-label">{t("to")}</Label>
                    <Tabs
                        value={targetKind}
                        onValueChange={(value) =>
                            setValue("targetKind", value as TargetKind)
                        }
                    >
                        <TabsList aria-labelledby="transfer-target-label">
                            {TARGET_KINDS.map((kind) => (
                                <TabsTrigger key={kind} value={kind}>
                                    {t(`targets.${kind}`)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    {targetKind === "own" ? (
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
                                        from && ownTargets.length === 0
                                            ? t("noOwnTargets")
                                            : undefined
                                    }
                                    options={ownTargets.map((a) => ({
                                        value: a.id,
                                        label: accountLabel(a),
                                    }))}
                                    error={fieldError(errors.toAccountId)}
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

                <TextField
                    label={t("amount")}
                    inputMode="decimal"
                    placeholder="0.00"
                    endAdornment={from?.currency}
                    error={fieldError(errors.amount)}
                    {...register("amount")}
                />
                <p className="text-xs text-muted-foreground">
                    {t("reviewNotice")}
                </p>
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

export function TransferForm() {
    return (
        <WithWalletData>
            {(data) => <TransferFormInner {...data} />}
        </WithWalletData>
    );
}
