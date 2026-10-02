"use client";

import { ArrowDownUpIcon, RefreshCwIcon, TimerIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { SelectField, TextField } from "@/components/ui/FormField";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { QUOTE_TTL_MS } from "@/config/currencies";
import {
    addMinor,
    cmpMinor,
    crossRate,
    decimalToMinor,
    feeFromBps,
    maxAmountWithFee,
    minorToDecimal,
} from "@/domain/money";
import { convertVia } from "@/domain/portfolio";
import type { LockedQuote } from "@/domain/rates";
import { availableBalance } from "@/domain/rules";
import type { AnyRequest, Currency, CurrencyType, Minor } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { useApiErrorMessage } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { useGroupedOptions } from "@/features/shared/options";
import { Panel } from "@/features/shared/Panel";
import { RequestResult } from "@/features/shared/RequestResult";
import { SummaryList } from "@/features/shared/SummaryList";
import { useRates } from "@/features/shared/useWallet";
import {
    WithWalletData,
    type WalletData,
} from "@/features/shared/WithWalletData";
import { formatDate, formatDecimal } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { amountSchema, type ValidationKey } from "@/lib/validation";
import { useCreateConversionMutation, useLockQuoteMutation } from "@/store/api";

const MODES = [
    ["fiat", "fiat"],
    ["fiat", "crypto"],
    ["crypto", "fiat"],
    ["crypto", "crypto"],
] as const satisfies readonly (readonly [CurrencyType, CurrencyType])[];

type Mode = `${CurrencyType}-${CurrencyType}`;
type Side = "send" | "receive";

const modeKey = (from: CurrencyType, to: CurrencyType): Mode => `${from}-${to}`;

function trimDecimal(value: string): string {
    return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
}

function toMinor(value: string, decimals: number): Minor | null {
    if (!amountSchema(decimals).safeParse(value).success) return null;
    return decimalToMinor(value, decimals);
}

/** Seconds left until `expiresAt`, ticking while the quote is shown. */
function useSecondsLeft(expiresAt: string | undefined): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!expiresAt) return;
        const id = window.setInterval(() => setNow(Date.now()), 250);
        return () => window.clearInterval(id);
    }, [expiresAt]);
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
}

function QuoteDialog({
    quote,
    relocking,
    onRelock,
    onClose,
    onConfirmed,
}: {
    quote: LockedQuote | null;
    relocking: boolean;
    onRelock: () => void;
    onClose: () => void;
    onConfirmed: (request: AnyRequest) => void;
}) {
    const t = useTranslations("convert");
    const tc = useTranslations("common");
    const language = useLocale();
    const user = useCurrentUser();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const [createConversion, mutation] = useCreateConversionMutation();
    const secondsLeft = useSecondsLeft(quote?.expiresAt);
    const expired = quote !== null && secondsLeft === 0;

    // An expired quote is replaced with a fresh one automatically.
    useEffect(() => {
        if (expired && !relocking && !mutation.isLoading) onRelock();
    }, [expired, relocking, mutation.isLoading, onRelock]);

    const confirm = async () => {
        if (!quote) return;
        const result = await createConversion({
            userId: user.id,
            quoteId: quote.id,
        });
        if ("data" in result && result.data) onConfirmed(result.data);
        else if ("error" in result) onRelock();
    };

    return (
        <Dialog
            open={quote !== null}
            onOpenChange={(open) => {
                if (!open) {
                    mutation.reset();
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("quoteTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("quoteDescription")}
                    </DialogDescription>
                </DialogHeader>
                <FormError message={apiError(mutation.error)} />
                {quote && (
                    <div className="space-y-4" aria-busy={relocking}>
                        <SummaryList
                            items={[
                                [
                                    t("rate"),
                                    `1 ${quote.from} = ${formatDecimal(quote.rate, language)} ${quote.to}`,
                                ],
                                [
                                    t("youSend"),
                                    formatMoney(quote.amount, quote.from),
                                ],
                                [t("fee"), formatMoney(quote.fee, quote.from)],
                                [
                                    t("totalDebit"),
                                    formatMoney(
                                        addMinor(quote.amount, quote.fee),
                                        quote.from,
                                    ),
                                ],
                                [
                                    t("youReceive"),
                                    formatMoney(quote.toAmount, quote.to),
                                    true,
                                ],
                            ]}
                        />
                        <div className="space-y-1.5">
                            <p
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                                aria-live="polite"
                            >
                                <TimerIcon className="size-4" aria-hidden />
                                {relocking || expired
                                    ? t("quoteRefreshing")
                                    : t("quoteExpiresIn", {
                                          seconds: secondsLeft,
                                      })}
                            </p>
                            <Progress
                                value={
                                    (secondsLeft * 1000 * 100) / QUOTE_TTL_MS
                                }
                                aria-label={t("quoteTimer")}
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            mutation.reset();
                            onClose();
                        }}
                    >
                        {tc("cancel")}
                    </Button>
                    <SubmitButton
                        type="button"
                        pending={mutation.isLoading}
                        pendingLabel={tc("loading")}
                        variant="gradient"
                        disabled={relocking || expired}
                        onClick={confirm}
                    >
                        {t("confirm")}
                    </SubmitButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ConvertFormInner({ settings, accounts }: WalletData) {
    const t = useTranslations("convert");
    const tv = useTranslations("validation");
    const tc = useTranslations("common");
    const language = useLocale();
    const user = useCurrentUser();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const { accountOptions, currencyOptions } = useGroupedOptions();
    const rates = useRates({ live: true });
    const [lockQuote, lock] = useLockQuoteMutation();

    const enabled = settings.currencies.filter((c) => c.enabled);
    const typeOf = (code: string) => enabled.find((c) => c.code === code)?.type;

    const [mode, setMode] = useState<Mode>("fiat-crypto");
    const [fromType, toType] = mode.split("-") as [CurrencyType, CurrencyType];
    const [fromAccountId, setFromAccountId] = useState("");
    const [to, setTo] = useState("");
    const [sendInput, setSendInput] = useState("");
    const [receiveInput, setReceiveInput] = useState("");
    const [edited, setEdited] = useState<Side>("send");
    const [errors, setErrors] = useState<
        Partial<Record<"from" | "to" | "send", ValidationKey>>
    >({});
    const [quote, setQuote] = useState<LockedQuote | null>(null);
    const [result, setResult] = useState<AnyRequest | null>(null);

    // Stale selections (after a mode/source change) simply resolve to nothing.
    const sources = accounts.filter((a) => typeOf(a.currency) === fromType);
    const from = sources.find((a) => a.id === fromAccountId);
    const fromCurrency = enabled.find((c) => c.code === from?.currency);
    const targets = enabled.filter(
        (c) => c.type === toType && c.code !== from?.currency,
    );
    const toCurrency = targets.find((c) => c.code === to);
    const bps = settings.fees.conversionBps;
    const source = rates.source;

    const convert = (amount: Minor, a: Currency, b: Currency) =>
        source ? convertVia(source, amount, a.code, b.code) : null;

    /** Indicative amount received for the typed send amount. */
    const receiveFor = (value: string): string => {
        if (!fromCurrency || !toCurrency) return "";
        const amount = toMinor(value, fromCurrency.decimals);
        const out = amount && convert(amount, fromCurrency, toCurrency);
        return out ? trimDecimal(minorToDecimal(out, toCurrency.decimals)) : "";
    };

    /** Smallest send amount whose conversion covers the typed receive amount. */
    const sendFor = (value: string): string => {
        if (!fromCurrency || !toCurrency) return "";
        const wanted = toMinor(value, toCurrency.decimals);
        let amount = wanted && convert(wanted, toCurrency, fromCurrency);
        if (!wanted || !amount) return "";
        for (let i = 0; i < 10; i += 1) {
            const out = convert(amount, fromCurrency, toCurrency);
            if (!out || cmpMinor(out, wanted) >= 0) break;
            amount = addMinor(amount, "1");
        }
        return trimDecimal(minorToDecimal(amount, fromCurrency.decimals));
    };

    // Two-way input: the side the user typed in drives the other one.
    const send = edited === "send" ? sendInput : sendFor(receiveInput);
    const receive = edited === "receive" ? receiveInput : receiveFor(sendInput);

    const sendMinor = fromCurrency
        ? toMinor(send, fromCurrency.decimals)
        : null;
    const fee = sendMinor ? feeFromBps(sendMinor, bps) : null;
    const rate =
        source && fromCurrency && toCurrency
            ? crossRate(
                  source.usdPrices[fromCurrency.code] ?? "0",
                  source.usdPrices[toCurrency.code] ?? "1",
              )
            : null;

    const swap = () => {
        if (!fromCurrency || !toCurrency) {
            setMode(modeKey(toType, fromType));
            return;
        }
        const nextFrom = accounts.find((a) => a.currency === toCurrency.code);
        setMode(modeKey(toType, fromType));
        setFromAccountId(nextFrom?.id ?? "");
        setTo(fromCurrency.code);
        setSendInput(receive);
        setEdited("send");
    };

    const fillMax = () => {
        if (!from || !fromCurrency) return;
        setEdited("send");
        setSendInput(
            trimDecimal(
                minorToDecimal(
                    maxAmountWithFee(availableBalance(from), bps),
                    fromCurrency.decimals,
                ),
            ),
        );
    };

    const requestQuote = async () => {
        if (!from) return;
        const response = await lockQuote({
            userId: user.id,
            fromAccountId: from.id,
            to,
            amount: send,
        });
        setQuote("data" in response && response.data ? response.data : null);
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const next: typeof errors = {};
        if (!from) next.from = "required";
        if (!toCurrency) next.to = "required";
        if (fromCurrency) {
            const parsed = amountSchema(fromCurrency.decimals).safeParse(send);
            if (!parsed.success) {
                next.send =
                    (parsed.error.issues[0]?.message as ValidationKey) ??
                    "amountFormat";
            } else if (
                from &&
                sendMinor &&
                fee &&
                cmpMinor(addMinor(sendMinor, fee), availableBalance(from)) > 0
            ) {
                next.send = "insufficientFunds";
            }
        }
        setErrors(next);
        if (Object.keys(next).length === 0) await requestQuote();
    };

    if (result && result.kind === "conversion") {
        const { payload } = result;
        return (
            <RequestResult
                request={result}
                title={t("resultTitle")}
                items={[
                    [t("youSend"), formatMoney(payload.amount, payload.from)],
                    [
                        t("youReceive"),
                        formatMoney(payload.toAmount, payload.to),
                        true,
                    ],
                    [
                        t("rate"),
                        `1 ${payload.from} = ${formatDecimal(payload.rate, language)} ${payload.to}`,
                    ],
                ]}
                onReset={() => {
                    setResult(null);
                    setSendInput("");
                    setReceiveInput("");
                }}
                resetLabel={t("again")}
            />
        );
    }

    return (
        <Panel>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormError message={quote ? undefined : apiError(lock.error)} />

                <div className="space-y-3">
                    <Label id="convert-mode-label">{t("mode")}</Label>
                    <Tabs
                        value={mode}
                        onValueChange={(value) => setMode(value as Mode)}
                    >
                        <TabsList
                            aria-labelledby="convert-mode-label"
                            className="flex-wrap"
                        >
                            {MODES.map(([a, b]) => (
                                <TabsTrigger
                                    key={modeKey(a, b)}
                                    value={modeKey(a, b)}
                                >
                                    {t("modeLabel", { from: tc(a), to: tc(b) })}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <fieldset className="grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-[2fr_3fr] sm:p-5">
                    <legend className="px-1 text-sm font-medium">
                        {t("youSend")}
                    </legend>
                    <SelectField
                        label={t("from")}
                        placeholder={t("chooseAccount")}
                        value={from ? fromAccountId : ""}
                        onChange={(value) => {
                            setFromAccountId(value);
                            setErrors((e) => ({ ...e, from: undefined }));
                        }}
                        options={accountOptions(sources)}
                        hint={sources.length === 0 ? t("noSource") : undefined}
                        error={errors.from && tv(errors.from)}
                    />
                    <TextField
                        label={t("amount")}
                        inputMode="decimal"
                        placeholder="0.00"
                        value={send}
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
                                    {t("max")}
                                </Button>
                            )
                        }
                        error={errors.send && tv(errors.send)}
                        onChange={(event) => {
                            setEdited("send");
                            setSendInput(event.target.value.trim());
                            setErrors((e) => ({ ...e, send: undefined }));
                        }}
                    />
                </fieldset>

                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-full shadow-[0_0_20px_-6px_var(--glow-primary)]"
                        onClick={swap}
                        aria-label={t("swap")}
                    >
                        <ArrowDownUpIcon aria-hidden />
                    </Button>
                </div>

                <fieldset className="grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-[2fr_3fr] sm:p-5">
                    <legend className="px-1 text-sm font-medium">
                        {t("youReceive")}
                    </legend>
                    <SelectField
                        label={t("to")}
                        placeholder={t("chooseCurrency")}
                        value={toCurrency ? to : ""}
                        onChange={(value) => {
                            setTo(value);
                            setErrors((e) => ({ ...e, to: undefined }));
                        }}
                        options={currencyOptions(targets)}
                        error={errors.to && tv(errors.to)}
                    />
                    <TextField
                        label={t("estimated")}
                        inputMode="decimal"
                        placeholder="0.00"
                        value={receive}
                        endAdornment={toCurrency?.code}
                        onChange={(event) => {
                            setEdited("receive");
                            setReceiveInput(event.target.value.trim());
                        }}
                    />
                </fieldset>

                <section aria-live="polite" aria-label={t("rateInfo")}>
                    {rates.isLoading ? (
                        <div
                            className="space-y-2 rounded-xl border p-4"
                            aria-busy="true"
                        >
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : rates.isError ? (
                        <div className="flex items-center justify-between gap-3 rounded-xl border p-4 text-sm">
                            {t("ratesError")}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={rates.refetch}
                            >
                                <RefreshCwIcon aria-hidden />
                                {t("retry")}
                            </Button>
                        </div>
                    ) : rate && fromCurrency && toCurrency ? (
                        <SummaryList
                            items={[
                                [
                                    t("rate"),
                                    `1 ${fromCurrency.code} = ${formatDecimal(rate, language)} ${toCurrency.code}`,
                                ],
                                [
                                    t("fee"),
                                    fee
                                        ? `${formatMoney(fee, fromCurrency.code)} (${formatDecimal(String(bps / 100), language)}%)`
                                        : `${formatDecimal(String(bps / 100), language)}%`,
                                ],
                                ...(sendMinor && fee
                                    ? [
                                          [
                                              t("totalDebit"),
                                              formatMoney(
                                                  addMinor(sendMinor, fee),
                                                  fromCurrency.code,
                                              ),
                                              true,
                                          ] as [string, string, boolean],
                                      ]
                                    : []),
                                [
                                    t("source"),
                                    rates.updatedAt
                                        ? t("sourceValue", {
                                              time: formatDate(
                                                  rates.updatedAt,
                                                  language,
                                                  "dateTime",
                                              ),
                                          })
                                        : t("sourceName"),
                                ],
                            ]}
                        />
                    ) : (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                            {t("quoteHint")}
                        </p>
                    )}
                </section>

                <p className="text-xs text-muted-foreground">
                    {t("reviewNotice")}
                </p>
                <SubmitButton
                    pending={lock.isLoading && !quote}
                    pendingLabel={tc("loading")}
                    variant="gradient"
                >
                    {t("submit")}
                </SubmitButton>
            </form>

            <QuoteDialog
                quote={quote}
                relocking={lock.isLoading}
                onRelock={requestQuote}
                onClose={() => setQuote(null)}
                onConfirmed={(request) => {
                    setQuote(null);
                    setResult(request);
                }}
            />
        </Panel>
    );
}

export function ConvertForm() {
    return (
        <WithWalletData>
            {(data) => <ConvertFormInner {...data} />}
        </WithWalletData>
    );
}
