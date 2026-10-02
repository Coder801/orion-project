"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, LandmarkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useReducer, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { SelectField, TextField } from "@/components/ui/FormField";
import { Progress } from "@/components/ui/Progress";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { estimateMonthlyPayment } from "@/domain/credit";
import { decimalToMinor } from "@/domain/money";
import type { CreditSettings, ReviewStatus } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import {
    CREDIT_PURPOSES,
    EMPLOYMENT_STATUSES,
    financialInfoSchema,
    loanDetailsSchema,
    type FinancialInfoValues,
    type LoanDetailsValues,
} from "@/features/products/schemas";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { SummaryList } from "@/features/shared/SummaryList";
import { formatDate, formatDecimal } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import {
    useApplyForCreditMutation,
    useCreditsQuery,
    usePlatformSettingsQuery,
} from "@/store/api";

const STEPS = ["loan", "financial", "review"] as const;

// ─── Wizard state ───────────────────────────────────────────────────────────

interface WizardState {
    step: number;
    loan?: LoanDetailsValues;
    financial?: FinancialInfoValues;
}

type WizardAction =
    | { type: "loan"; values: LoanDetailsValues }
    | { type: "financial"; values: FinancialInfoValues }
    | { type: "back" }
    | { type: "reset" };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case "loan":
            return { ...state, loan: action.values, step: 1 };
        case "financial":
            return { ...state, financial: action.values, step: 2 };
        case "back":
            return { ...state, step: Math.max(0, state.step - 1) };
        case "reset":
            return { step: 0 };
    }
}

const draftKey = (userId: string) => `orion-credit-draft:${userId}`;

// The draft is a per-browser convenience; storage may be unavailable.
function readDraft(userId: string): WizardState | null {
    try {
        const raw = window.localStorage.getItem(draftKey(userId));
        return raw ? (JSON.parse(raw) as WizardState) : null;
    } catch {
        return null;
    }
}

function writeDraft(userId: string, state: WizardState | null): void {
    try {
        if (state)
            window.localStorage.setItem(
                draftKey(userId),
                JSON.stringify(state),
            );
        else window.localStorage.removeItem(draftKey(userId));
    } catch {
        // Ignore: the wizard keeps working without a saved draft.
    }
}

// ─── Steps ──────────────────────────────────────────────────────────────────

function LoanStep({
    credit,
    initial,
    onNext,
}: {
    credit: CreditSettings;
    initial?: LoanDetailsValues;
    onNext: (values: LoanDetailsValues) => void;
}) {
    const t = useTranslations("credit");
    const fieldError = useFieldError();
    const formatMoney = useFormatMoney();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<LoanDetailsValues>({
        resolver: zodResolver(loanDetailsSchema(credit)),
        defaultValues: initial ?? { amount: "", termMonths: "" },
    });
    const min = decimalToMinor(credit.limits.min, 2);
    const max = decimalToMinor(credit.limits.max, 2);

    return (
        <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                    label={t("fields.amount")}
                    inputMode="decimal"
                    placeholder="0.00"
                    endAdornment={credit.currency}
                    hint={t("amountHint", {
                        min: formatMoney(min, credit.currency),
                        max: formatMoney(max, credit.currency),
                    })}
                    error={fieldError(errors.amount)}
                    {...register("amount")}
                />
                <TextField
                    label={t("fields.term")}
                    inputMode="numeric"
                    hint={t("termHint", credit.termMonths)}
                    error={fieldError(errors.termMonths)}
                    {...register("termMonths")}
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
                            containerClassName="sm:col-span-2"
                            options={CREDIT_PURPOSES.map((p) => ({
                                value: p,
                                label: t(`purposes.${p}`),
                            }))}
                            error={fieldError(errors.purpose)}
                        />
                    )}
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit">{t("next")}</Button>
            </div>
        </form>
    );
}

function FinancialStep({
    initial,
    onBack,
    onNext,
}: {
    initial?: FinancialInfoValues;
    onBack: () => void;
    onNext: (values: FinancialInfoValues) => void;
}) {
    const t = useTranslations("credit");
    const fieldError = useFieldError();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FinancialInfoValues>({
        resolver: zodResolver(financialInfoSchema),
        defaultValues: initial ?? {
            monthlyIncome: "",
            monthlyObligations: "0",
        },
    });

    return (
        <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <Controller
                    control={control}
                    name="employment"
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            value={field.value ?? ""}
                            label={t("fields.employment")}
                            placeholder={t("fields.choose")}
                            containerClassName="sm:col-span-2"
                            options={EMPLOYMENT_STATUSES.map((e) => ({
                                value: e,
                                label: t(`employment.${e}`),
                            }))}
                            error={fieldError(errors.employment)}
                        />
                    )}
                />
                <TextField
                    label={t("fields.income")}
                    inputMode="decimal"
                    placeholder="0.00"
                    error={fieldError(errors.monthlyIncome)}
                    {...register("monthlyIncome")}
                />
                <TextField
                    label={t("fields.obligations")}
                    inputMode="decimal"
                    placeholder="0.00"
                    hint={t("obligationsHint")}
                    error={fieldError(errors.monthlyObligations)}
                    {...register("monthlyObligations")}
                />
            </div>
            <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={onBack}>
                    {t("back")}
                </Button>
                <Button type="submit">{t("next")}</Button>
            </div>
        </form>
    );
}

function ReviewStep({
    credit,
    loan,
    financial,
    pending,
    onBack,
    onSubmit,
}: {
    credit: CreditSettings;
    loan: LoanDetailsValues;
    financial: FinancialInfoValues;
    pending: boolean;
    onBack: () => void;
    onSubmit: () => void;
}) {
    const t = useTranslations("credit");
    const tv = useTranslations("validation");
    const tc = useTranslations("common");
    const language = useLocale();
    const formatMoney = useFormatMoney();
    const [consent, setConsent] = useState(false);
    const [consentError, setConsentError] = useState(false);
    const months = Number(loan.termMonths);
    const principal = decimalToMinor(loan.amount, 2);
    const payment = estimateMonthlyPayment(principal, credit.aprBps, months);
    const apr = formatDecimal(String(credit.aprBps / 100), language, 2);
    const money = (value: string) =>
        formatMoney(decimalToMinor(value, 2), credit.currency);

    return (
        <form
            noValidate
            className="space-y-5"
            onSubmit={(event) => {
                event.preventDefault();
                if (!consent) {
                    setConsentError(true);
                    return;
                }
                onSubmit();
            }}
        >
            <SummaryList
                items={[
                    [t("fields.amount"), money(loan.amount), true],
                    [t("fields.term"), t("months", { count: months })],
                    [t("fields.purpose"), t(`purposes.${loan.purpose}`)],
                    [
                        t("fields.employment"),
                        t(`employment.${financial.employment}`),
                    ],
                    [t("fields.income"), money(financial.monthlyIncome)],
                    [
                        t("fields.obligations"),
                        money(financial.monthlyObligations),
                    ],
                ]}
            />
            <section
                aria-labelledby="credit-estimate"
                className="rounded-2xl border border-accent/25 bg-accent/5 p-4"
            >
                <h3
                    id="credit-estimate"
                    className="flex items-center gap-2 text-sm font-medium"
                >
                    <InfoIcon className="size-4 text-accent" aria-hidden />
                    {t("estimate.title")}
                </h3>
                <p className="mt-2 font-heading text-2xl font-bold tabular-nums">
                    {t("estimate.perMonth", {
                        amount: formatMoney(payment, credit.currency),
                    })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t("estimate.note", { apr })}
                </p>
            </section>
            <div className="space-y-1.5">
                <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                        checked={consent}
                        onCheckedChange={(checked) => {
                            setConsent(checked === true);
                            setConsentError(false);
                        }}
                        aria-invalid={consentError || undefined}
                        className="mt-0.5"
                    />
                    {t("consent")}
                </label>
                {consentError && (
                    <p
                        role="alert"
                        className="text-xs font-medium text-destructive"
                    >
                        {tv("consent")}
                    </p>
                )}
            </div>
            <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={onBack}>
                    {t("back")}
                </Button>
                <SubmitButton
                    pending={pending}
                    pendingLabel={tc("loading")}
                    variant="gradient"
                >
                    {t("submit")}
                </SubmitButton>
            </div>
        </form>
    );
}

function CreditWizard({
    userId,
    credit,
}: {
    userId: string;
    credit: CreditSettings;
}) {
    const t = useTranslations("credit");
    const apiError = useApiErrorMessage();
    // The wizard renders only after settings load on the client, so the
    // draft can be read in the initializer without a hydration mismatch.
    const [state, dispatchRaw] = useReducer(
        wizardReducer,
        userId,
        (id) => readDraft(id) ?? { step: 0 },
    );
    const [apply, { isLoading, isSuccess, error, reset }] =
        useApplyForCreditMutation();

    // Every change is saved as a draft right away.
    const dispatch = (action: WizardAction) => {
        const next = wizardReducer(state, action);
        writeDraft(userId, next.step === 0 && !next.loan ? null : next);
        dispatchRaw(action);
    };

    const submit = async () => {
        if (!state.loan || !state.financial) return;
        const result = await apply({
            userId,
            input: {
                amount: state.loan.amount,
                termMonths: Number(state.loan.termMonths),
                purpose: state.loan.purpose,
                employment: state.financial.employment,
                monthlyIncome: state.financial.monthlyIncome,
                monthlyObligations: state.financial.monthlyObligations,
            },
        });
        if ("data" in result) dispatch({ type: "reset" });
    };

    const step = STEPS[state.step] ?? "loan";
    return (
        <Panel title={t("formTitle")}>
            <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                    <span>
                        {t("stepOf", {
                            n: state.step + 1,
                            total: STEPS.length,
                        })}
                    </span>
                    <span className="text-muted-foreground">
                        {t(`steps.${step}`)}
                    </span>
                </div>
                <Progress
                    value={((state.step + 1) * 100) / STEPS.length}
                    aria-label={t("stepOf", {
                        n: state.step + 1,
                        total: STEPS.length,
                    })}
                />
            </div>
            <div className="space-y-5">
                <FormSuccess
                    show={isSuccess && state.step === 0}
                    message={t("created")}
                />
                <FormError message={apiError(error)} />
                {step === "loan" && (
                    <LoanStep
                        credit={credit}
                        initial={state.loan}
                        onNext={(values) => {
                            reset();
                            dispatch({ type: "loan", values });
                        }}
                    />
                )}
                {step === "financial" && (
                    <FinancialStep
                        initial={state.financial}
                        onBack={() => dispatch({ type: "back" })}
                        onNext={(values) =>
                            dispatch({ type: "financial", values })
                        }
                    />
                )}
                {step === "review" && state.loan && state.financial && (
                    <ReviewStep
                        credit={credit}
                        loan={state.loan}
                        financial={state.financial}
                        pending={isLoading}
                        onBack={() => dispatch({ type: "back" })}
                        onSubmit={submit}
                    />
                )}
            </div>
        </Panel>
    );
}

const CREDIT_STATUS_KEY: Record<
    ReviewStatus,
    "underReview" | "approved" | "declined"
> = {
    pending: "underReview",
    approved: "approved",
    rejected: "declined",
};

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
                            <TableHead>{t("fields.purpose")}</TableHead>
                            <TableHead>{t("fields.term")}</TableHead>
                            <TableHead className="pr-5 lg:pr-6">
                                {t("fields.status")}
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
                                    {t(`purposes.${c.purpose}`)}
                                </TableCell>
                                <TableCell>
                                    {t("months", { count: c.termMonths })}
                                </TableCell>
                                <TableCell className="pr-5 lg:pr-6">
                                    <StatusBadge
                                        status={c.status}
                                        label={t(
                                            `statuses.${CREDIT_STATUS_KEY[c.status]}`,
                                        )}
                                    />
                                    {c.reason && (
                                        <p className="mt-1 max-w-56 text-xs whitespace-normal text-muted-foreground">
                                            {c.reason}
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

export function Credit() {
    const user = useCurrentUser();
    const t = useTranslations("common");
    const settings = usePlatformSettingsQuery();
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <AsyncContent
                isLoading={settings.isLoading}
                isError={settings.isError}
                onRetry={settings.refetch}
                loadingLabel={t("loading")}
            >
                {settings.data && (
                    <CreditWizard
                        userId={user.id}
                        credit={settings.data.credit}
                    />
                )}
            </AsyncContent>
            <CreditList userId={user.id} />
        </div>
    );
}
