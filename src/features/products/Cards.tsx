"use client";

import {
    CheckIcon,
    GlobeIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ZapIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { SelectField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { canSelectPlan, currentPlan } from "@/domain/cards";
import { cmpMinor } from "@/domain/money";
import { availableBalance } from "@/domain/rules";
import type { AnyRequest, CardPlan } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import {
    CARD_SKINS,
    CardChip,
    CardShine,
    cardFaceClass,
    type CardSkin,
} from "@/features/shared/CardArt";
import { useApiErrorMessage } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/FormStatus";
import {
    WithWalletData,
    type WalletData,
} from "@/features/shared/WithWalletData";
import { formatDecimal } from "@/lib/format";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import { cn } from "@/lib/utils";
import {
    useMeQuery,
    useSelectCardPlanMutation,
    useUserRequestsQuery,
} from "@/store/api";

const BENEFITS = [
    { key: "security", icon: ShieldCheckIcon },
    { key: "global", icon: GlobeIcon },
    { key: "instant", icon: ZapIcon },
] as const;

function usePlanText() {
    const t = useTranslations("cards");
    const language = useLocale();
    const formatMoney = useFormatMoney();

    const price = (plan: CardPlan) =>
        plan.billing === "free"
            ? t("free")
            : t(`billing.${plan.billing}`, {
                  price: formatMoney(plan.price, plan.currency),
              });

    const features = (plan: CardPlan): [string, string][] => [
        [t("features.dailyLimit"), formatMoney(plan.dailyLimit, plan.currency)],
        [t("features.atmLimit"), formatMoney(plan.atmLimit, plan.currency)],
        [t("features.support"), t(`support.${plan.support}`)],
        [
            t("features.cashback"),
            `${formatDecimal(String(plan.cashbackBps / 100), language, 2)}%`,
        ],
    ];

    return {
        price,
        features,
        name: (plan: CardPlan) => t(`plans.${plan.id as "basic"}`),
    };
}

/** Card look per plan rank (plans come from the API, so map by rank, not id). */
const PLAN_SKINS: CardSkin[] = ["graphite", "nebula", "aurora", "obsidian"];

function skinFor(plan: CardPlan): CardSkin {
    return PLAN_SKINS[Math.min(plan.rank, PLAN_SKINS.length - 1)] ?? "graphite";
}

function CardTag({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase backdrop-blur-sm">
            {children}
        </span>
    );
}

function PlanCard({
    plan,
    current,
    pending,
    locked,
    onSelect,
}: {
    plan: CardPlan;
    current: boolean;
    pending: boolean;
    locked: boolean;
    onSelect: () => void;
}) {
    const t = useTranslations("cards");
    const text = usePlanText();
    const included = !current && locked;
    const skin = skinFor(plan);

    return (
        <article
            className="group flex h-full flex-col gap-4"
            aria-labelledby={`plan-${plan.id}`}
        >
            <div
                className={cn(
                    cardFaceClass,
                    CARD_SKINS[skin],
                    "flex flex-col justify-between transition-transform duration-300 motion-safe:group-hover:-translate-y-1",
                    plan.popular &&
                        "shadow-[0_12px_40px_-12px_var(--glow-primary)]",
                    current &&
                        "ring-2 ring-success ring-offset-2 ring-offset-background",
                )}
            >
                <CardShine />
                {skin === "obsidian" && (
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-linear-120 from-transparent via-white/10 to-transparent"
                    />
                )}
                <div className="relative flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[10px] tracking-widest text-white/70 uppercase">
                            {t("planLabel")}
                        </p>
                        <h3
                            id={`plan-${plan.id}`}
                            className="truncate font-heading text-xl font-bold"
                        >
                            {text.name(plan)}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {plan.popular && (
                            <CardTag>
                                <SparklesIcon aria-hidden className="size-3" />
                                {t("popular")}
                            </CardTag>
                        )}
                        {current && <CardTag>{t("current")}</CardTag>}
                        {pending && <CardTag>{t("pending")}</CardTag>}
                    </div>
                </div>
                <CardChip className="relative" />
                <div className="relative flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-heading text-2xl leading-tight font-bold tabular-nums">
                            {text.price(plan)}
                        </p>
                        <p className="text-[11px] text-white/75">
                            {t(`billingType.${plan.billing}`)}
                        </p>
                    </div>
                    <span
                        aria-hidden
                        className="font-heading text-lg font-black tracking-tight text-white/90 italic"
                    >
                        {t("networkMark")}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col rounded-2xl border bg-card p-4">
                <dl className="space-y-2 text-sm">
                    {text.features(plan).map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3">
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="font-medium tabular-nums">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
                <ul className="mt-4 mb-5 space-y-1.5 border-t pt-4 text-sm">
                    {plan.extras.map((extra) => (
                        <li key={extra} className="flex items-center gap-2">
                            <CheckIcon
                                className="size-4 shrink-0 text-success"
                                aria-hidden
                            />
                            {t(`extras.${extra as "virtualCard"}`)}
                        </li>
                    ))}
                </ul>
                <Button
                    className="mt-auto w-full"
                    variant={plan.popular ? "gradient" : "outline"}
                    disabled={current || included || pending || locked}
                    onClick={onSelect}
                >
                    {current
                        ? t("currentButton")
                        : included
                          ? t("included")
                          : t("select")}
                </Button>
            </div>
        </article>
    );
}

function PlanDialog({
    plan,
    current,
    data,
    onClose,
    onDone,
}: {
    plan: CardPlan | null;
    current: CardPlan | undefined;
    data: WalletData;
    onClose: () => void;
    onDone: (request: AnyRequest) => void;
}) {
    const t = useTranslations("cards");
    const tc = useTranslations("common");
    const user = useCurrentUser();
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const text = usePlanText();
    const [accountId, setAccountId] = useState("");
    const [select, { isLoading, error, reset }] = useSelectCardPlanMutation();
    const payable = plan
        ? data.accounts.filter(
              (a) =>
                  a.currency === plan.currency &&
                  cmpMinor(availableBalance(a), plan.price) >= 0,
          )
        : [];

    const close = () => {
        reset();
        setAccountId("");
        onClose();
    };

    const confirm = async () => {
        if (!plan || !accountId) return;
        const result = await select({
            userId: user.id,
            input: { plan: plan.id, accountId },
        });
        if ("data" in result && result.data) {
            setAccountId("");
            onDone(result.data);
        }
    };

    return (
        <Dialog open={plan !== null} onOpenChange={(open) => !open && close()}>
            <DialogContent className="sm:max-w-lg">
                {plan && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {t("dialog.title", { plan: text.name(plan) })}
                            </DialogTitle>
                            <DialogDescription>
                                {t("dialog.description")}
                            </DialogDescription>
                        </DialogHeader>
                        <FormError message={apiError(error)} />
                        <table className="w-full text-sm">
                            <caption className="sr-only">
                                {t("dialog.comparison")}
                            </caption>
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th
                                        scope="col"
                                        className="pb-2 font-medium"
                                    />
                                    <th
                                        scope="col"
                                        className="pb-2 font-medium"
                                    >
                                        {current ? text.name(current) : "—"}
                                    </th>
                                    <th
                                        scope="col"
                                        className="pb-2 font-medium text-foreground"
                                    >
                                        {text.name(plan)}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {text
                                    .features(plan)
                                    .map(([label, value], i) => (
                                        <tr key={label}>
                                            <th
                                                scope="row"
                                                className="py-2 pr-3 text-left font-normal text-muted-foreground"
                                            >
                                                {label}
                                            </th>
                                            <td className="py-2 pr-3 tabular-nums">
                                                {current
                                                    ? text.features(current)[
                                                          i
                                                      ]?.[1]
                                                    : "—"}
                                            </td>
                                            <td className="py-2 font-medium tabular-nums">
                                                {value}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
                            <span className="text-sm text-muted-foreground">
                                {t("dialog.total")}
                            </span>
                            <span className="font-heading text-xl font-bold tabular-nums">
                                {formatMoney(plan.price, plan.currency)}
                            </span>
                        </div>
                        <SelectField
                            label={t("dialog.payFrom")}
                            placeholder={t("dialog.chooseAccount")}
                            value={accountId}
                            onChange={setAccountId}
                            hint={
                                payable.length === 0
                                    ? t("dialog.noFunds", {
                                          currency: plan.currency,
                                      })
                                    : t("dialog.chargeNote")
                            }
                            options={payable.map((a) => ({
                                value: a.id,
                                label: `${accountLabel(a)} — ${formatMoney(availableBalance(a), a.currency)}`,
                            }))}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={close}>
                                {tc("cancel")}
                            </Button>
                            <SubmitButton
                                type="button"
                                pending={isLoading}
                                pendingLabel={tc("loading")}
                                variant="gradient"
                                disabled={!accountId}
                                onClick={confirm}
                            >
                                {t("dialog.confirm")}
                            </SubmitButton>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function CardsInner(data: WalletData) {
    const t = useTranslations("cards");
    const user = useCurrentUser();
    const me = useMeQuery(user.id);
    const requests = useUserRequestsQuery(user.id);
    const [selected, setSelected] = useState<CardPlan | null>(null);
    const [done, setDone] = useState(false);
    const plans = [...data.settings.cardPlans].sort((a, b) => a.rank - b.rank);
    const current = me.data ? currentPlan(plans, me.data) : undefined;
    const pendingPlan = (requests.data ?? []).find(
        (r) =>
            r.kind === "card" &&
            r.status === "pending" &&
            r.payload.product.kind === "plan",
    );
    const pendingPlanId =
        pendingPlan?.kind === "card" &&
        pendingPlan.payload.product.kind === "plan"
            ? pendingPlan.payload.product.plan
            : undefined;

    return (
        <div className="space-y-6">
            <FormSuccess show={done} message={t("created")} />
            <AsyncContent
                isLoading={me.isLoading}
                isError={me.isError}
                onRetry={me.refetch}
                loadingLabel={t("plansTitle")}
            >
                <section aria-label={t("plansTitle")}>
                    <ul className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-4">
                        {plans.map((plan) => (
                            <li key={plan.id}>
                                <PlanCard
                                    plan={plan}
                                    current={plan.id === current?.id}
                                    pending={plan.id === pendingPlanId}
                                    locked={
                                        !canSelectPlan(current, plan) ||
                                        pendingPlanId !== undefined
                                    }
                                    onSelect={() => {
                                        setDone(false);
                                        setSelected(plan);
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            </AsyncContent>

            <section aria-label={t("benefitsTitle")}>
                <ul className="grid gap-4 md:grid-cols-3">
                    {BENEFITS.map(({ key, icon: Icon }) => (
                        <li
                            key={key}
                            className="rounded-2xl border bg-card p-5"
                        >
                            <span
                                aria-hidden
                                className="grid size-10 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary"
                            >
                                <Icon className="size-5" />
                            </span>
                            <h3 className="mt-4 font-heading font-semibold">
                                {t(`benefits.${key}.title`)}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(`benefits.${key}.text`)}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            <PlanDialog
                plan={selected}
                current={current}
                data={data}
                onClose={() => setSelected(null)}
                onDone={() => {
                    setSelected(null);
                    setDone(true);
                }}
            />
        </div>
    );
}

export function Cards() {
    return (
        <WithWalletData>{(data) => <CardsInner {...data} />}</WithWalletData>
    );
}
