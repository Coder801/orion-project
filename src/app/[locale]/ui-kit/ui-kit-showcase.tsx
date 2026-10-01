"use client";

import type { VariantProps } from "class-variance-authority";
import {
    ArrowDownToLineIcon,
    ArrowUpFromLineIcon,
    MailIcon,
    PlusIcon,
    SearchIcon,
    SendIcon,
    Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
    SelectField,
    SwitchField,
    TextField,
} from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmitButton } from "@/components/ui/submit-button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_CURRENCIES } from "@/config/currencies";
import type { CurrencyCode, Minor } from "@/domain/types";
import { Panel } from "@/features/shared/panel";
import { SummaryList } from "@/features/shared/summary-list";
import { Link } from "@/i18n/navigation";
import { formatDate, formatMinor } from "@/lib/format";
import { cn } from "@/lib/utils";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
type BadgeKey = "neutral" | "brand" | "success" | "warning" | "danger";
type RowKey = "coffee" | "salary" | "btc" | "refund";
type StatusKey = Extract<BadgeKey, "success" | "warning" | "danger">;

const BADGES: Record<BadgeKey, BadgeVariant> = {
    neutral: "secondary",
    brand: "glow",
    success: "success",
    warning: "warning",
    danger: "destructive",
};

const STATE_DEMOS = ["skeleton", "empty", "error"] as const;
type StateDemo = (typeof STATE_DEMOS)[number];

interface DemoRow {
    id: string;
    date: string;
    key: RowKey;
    status: StatusKey;
    amount: Minor;
    currency: CurrencyCode;
}

const DEMO_ROWS: DemoRow[] = [
    {
        id: "tx-1",
        date: "2026-09-28T09:12:00Z",
        key: "coffee",
        status: "success",
        amount: "-450",
        currency: "EUR",
    },
    {
        id: "tx-2",
        date: "2026-09-25T08:00:00Z",
        key: "salary",
        status: "success",
        amount: "420000",
        currency: "EUR",
    },
    {
        id: "tx-3",
        date: "2026-09-24T16:40:00Z",
        key: "btc",
        status: "warning",
        amount: "1250000",
        currency: "BTC",
    },
    {
        id: "tx-4",
        date: "2026-09-20T11:05:00Z",
        key: "refund",
        status: "danger",
        amount: "1999",
        currency: "EUR",
    },
];

function currency(code: CurrencyCode) {
    return (
        DEFAULT_CURRENCIES.find((c) => c.code === code) ?? {
            code,
            type: "fiat" as const,
            decimals: 2,
        }
    );
}

const CURRENCY_OPTIONS = ["EUR", "USD", "GBP", "BTC", "ETH"].map((code) => ({
    value: code,
    label: code,
}));

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-4">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
                {title}
            </h2>
            {children}
        </section>
    );
}

export function UiKitShowcase() {
    const t = useTranslations("uiKit");
    const tCommon = useTranslations("common");
    const language = useLocale();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);
    const [notifications, setNotifications] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [stateDemo, setStateDemo] = useState<StateDemo>("skeleton");

    return (
        <div className="space-y-12">
            <Section title={t("sections.buttons")}>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="gradient">{t("buttons.primary")}</Button>
                    <Button>{t("buttons.primary")}</Button>
                    <Button variant="secondary">
                        {t("buttons.secondary")}
                    </Button>
                    <Button variant="outline">{t("buttons.outline")}</Button>
                    <Button variant="ghost">{t("buttons.ghost")}</Button>
                    <Button variant="destructive">
                        <Trash2Icon aria-hidden />
                        {t("buttons.danger")}
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">{t("buttons.small")}</Button>
                    <Button size="lg" variant="glass">
                        <SendIcon aria-hidden />
                        {t("buttons.withIcon")}
                    </Button>
                    <SubmitButton
                        type="button"
                        pending
                        pendingLabel={t("buttons.loading")}
                    >
                        {t("buttons.loading")}
                    </SubmitButton>
                    <Button disabled>{t("buttons.disabled")}</Button>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={t("buttons.iconLabel")}
                    >
                        <PlusIcon aria-hidden />
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/app">{t("buttons.asLink")}</Link>
                    </Button>
                </div>
            </Section>

            <Section title={t("sections.badges")}>
                <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(BADGES) as BadgeKey[]).map((key) => (
                        <Badge key={key} variant={BADGES[key]}>
                            {t(`badges.${key}`)}
                        </Badge>
                    ))}
                </div>
            </Section>

            <Section title={t("sections.forms")}>
                <div className="grid gap-5 md:grid-cols-2">
                    <TextField
                        type="email"
                        label={t("forms.emailLabel")}
                        placeholder={t("forms.emailPlaceholder")}
                        hint={t("forms.emailHint")}
                        startAdornment={<MailIcon />}
                        autoComplete="email"
                    />
                    <TextField
                        type="search"
                        label={t("forms.searchLabel")}
                        placeholder={t("forms.searchPlaceholder")}
                        startAdornment={<SearchIcon />}
                    />
                    <TextField
                        inputMode="decimal"
                        label={t("forms.amountLabel")}
                        defaultValue="12500"
                        error={t("forms.amountError")}
                        endAdornment="EUR"
                    />
                    <SelectField
                        label={t("forms.currencyLabel")}
                        placeholder={t("forms.currencyPlaceholder")}
                        options={CURRENCY_OPTIONS}
                        value={selectedCurrency}
                        onChange={setSelectedCurrency}
                    />
                    <TextField
                        label={t("forms.disabledLabel")}
                        value="DE89 3704 0044 0532 0130 00"
                        disabled
                        readOnly
                    />
                </div>
            </Section>

            <Section title={t("sections.switches")}>
                <Panel className="max-w-lg">
                    <div className="space-y-5">
                        <SwitchField
                            checked={twoFactor}
                            onCheckedChange={setTwoFactor}
                            label={t("switches.twoFactor")}
                            description={t("switches.twoFactorHint")}
                        />
                        <SwitchField
                            checked={notifications}
                            onCheckedChange={setNotifications}
                            label={t("switches.notifications")}
                        />
                    </div>
                </Panel>
            </Section>

            <Section title={t("sections.cards")}>
                <div className="grid gap-5 md:grid-cols-2">
                    <Panel
                        title={t("cards.balanceTitle")}
                        description={t("cards.balanceDescription")}
                        actions={
                            <Badge variant="success">
                                {t("cards.change", { value: "+2.4%" })}
                            </Badge>
                        }
                    >
                        <p className="font-heading text-3xl font-bold tracking-tight tabular-nums">
                            {formatMinor("4825032", currency("EUR"), language)}
                        </p>
                    </Panel>
                    <Panel
                        title={t("cards.actionsTitle")}
                        description={t("cards.actionsDescription")}
                    >
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="gradient">
                                <ArrowDownToLineIcon aria-hidden />
                                {t("cards.topUp")}
                            </Button>
                            <Button size="sm" variant="outline">
                                <ArrowUpFromLineIcon aria-hidden />
                                {t("cards.withdraw")}
                            </Button>
                        </div>
                    </Panel>
                </div>
            </Section>

            <Section title={t("sections.table")}>
                <Panel flush>
                    <Table>
                        <TableCaption className="mb-4">
                            {t("table.caption")}
                        </TableCaption>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-5 lg:pl-6">
                                    {t("table.date")}
                                </TableHead>
                                <TableHead>{t("table.description")}</TableHead>
                                <TableHead>{t("table.status")}</TableHead>
                                <TableHead className="pr-5 text-right lg:pr-6">
                                    {t("table.amount")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {DEMO_ROWS.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                        {formatDate(row.date, language)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {t(`table.rows.${row.key}`)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={BADGES[row.status]}>
                                            {t(`badges.${row.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "pr-5 text-right font-medium tabular-nums lg:pr-6",
                                            !row.amount.startsWith("-") &&
                                                "text-success",
                                        )}
                                    >
                                        {formatMinor(
                                            row.amount,
                                            currency(row.currency),
                                            language,
                                            { signDisplay: "always" },
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            </Section>

            <Section title={t("sections.modal")}>
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                    {t("modal.open")}
                </Button>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("modal.title")}</DialogTitle>
                            <DialogDescription>
                                {t("modal.description")}
                            </DialogDescription>
                        </DialogHeader>
                        <SummaryList
                            items={[
                                [
                                    t("modal.recipientLabel"),
                                    t("modal.recipient"),
                                ],
                                [
                                    t("modal.amountLabel"),
                                    formatMinor(
                                        "25000",
                                        currency("EUR"),
                                        language,
                                    ),
                                ],
                                [
                                    t("modal.feeLabel"),
                                    formatMinor(
                                        "125",
                                        currency("EUR"),
                                        language,
                                    ),
                                ],
                            ]}
                        />
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                            >
                                {tCommon("cancel")}
                            </Button>
                            <Button
                                variant="gradient"
                                onClick={() => setIsModalOpen(false)}
                            >
                                {tCommon("confirm")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Section>

            <Section title={t("sections.states")}>
                <Tabs
                    value={stateDemo}
                    onValueChange={(value) => setStateDemo(value as StateDemo)}
                >
                    <TabsList aria-label={t("sections.states")}>
                        {STATE_DEMOS.map((demo) => (
                            <TabsTrigger key={demo} value={demo}>
                                {t(`states.${demo}`)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                {stateDemo === "skeleton" && (
                    <Panel>
                        <div
                            aria-busy="true"
                            aria-label={t("states.loadingLabel")}
                            className="space-y-4"
                        >
                            {Array.from({ length: 4 }, (_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4"
                                >
                                    <Skeleton className="size-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-1/3" />
                                        <Skeleton className="h-3 w-1/5" />
                                    </div>
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </Panel>
                )}
                {stateDemo === "empty" && (
                    <EmptyState
                        title={t("states.emptyTitle")}
                        description={t("states.emptyDescription")}
                        action={
                            <Button asChild size="sm" variant="gradient">
                                <Link href="/app/transfer">
                                    <SendIcon aria-hidden />
                                    {t("states.emptyAction")}
                                </Link>
                            </Button>
                        }
                    />
                )}
                {stateDemo === "error" && (
                    <ErrorState
                        description={t("states.errorDescription")}
                        onRetry={() => setStateDemo("skeleton")}
                    />
                )}
            </Section>
        </div>
    );
}
