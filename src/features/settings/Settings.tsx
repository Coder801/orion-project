"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, CircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SelectField, SwitchField, TextField } from "@/components/ui/FormField";
import { Progress } from "@/components/ui/Progress";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DISPLAY_CURRENCIES } from "@/config/currencies";
import { ROUTES } from "@/config/routes";
import type { User } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { PasswordField } from "@/features/auth/PasswordField";
import { AvatarSection } from "@/features/settings/AvatarSection";
import { SecuritySection } from "@/features/settings/SecuritySection";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { Panel } from "@/features/shared/Panel";
import { useDisplayCurrency } from "@/features/shared/useWallet";
import { Link } from "@/i18n/navigation";
import { useResolvedTheme } from "@/lib/hooks/useResolvedTheme";
import { cn } from "@/lib/utils";
import {
    PASSWORD_RULES,
    passwordChecks,
    requiredString,
    strongPasswordSchema,
    type PasswordRule,
} from "@/lib/validation";
import {
    useChangePasswordMutation,
    useMeQuery,
    useSetDisplayCurrencyMutation,
} from "@/store/api";

const passwordFormSchema = z
    .object({
        currentPassword: requiredString(),
        newPassword: strongPasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        error: "passwordMismatch",
        path: ["confirmPassword"],
    });
type PasswordValues = z.infer<typeof passwordFormSchema>;

const RULES = Object.keys(PASSWORD_RULES) as PasswordRule[];

function PasswordStrength({ value }: { value: string }) {
    const t = useTranslations("settings.password");
    const checks = passwordChecks(value);
    const passed = RULES.filter((rule) => checks[rule]).length;
    const level =
        passed <= 1 ? "weak" : passed < RULES.length ? "fair" : "strong";

    return (
        <div className="space-y-2" aria-live="polite">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("strength")}</span>
                <span className="font-medium">{t(`levels.${level}`)}</span>
            </div>
            <Progress
                value={(passed * 100) / RULES.length}
                aria-label={t("strength")}
                indicatorClassName={cn(
                    level === "weak" && "from-destructive to-destructive",
                    level === "fair" && "from-warning to-warning",
                )}
            />
            <ul className="grid gap-1 text-xs sm:grid-cols-2">
                {RULES.map((rule) => (
                    <li
                        key={rule}
                        className={cn(
                            "flex items-center gap-1.5",
                            checks[rule]
                                ? "text-success"
                                : "text-muted-foreground",
                        )}
                    >
                        {checks[rule] ? (
                            <CheckIcon className="size-3.5" aria-hidden />
                        ) : (
                            <CircleIcon className="size-3" aria-hidden />
                        )}
                        {t(`rules.${rule}`)}
                        <span className="sr-only">
                            {t(checks[rule] ? "met" : "notMet")}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function PasswordForm() {
    const t = useTranslations("settings.password");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<PasswordValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });
    const newPassword = useWatch({ control, name: "newPassword" });

    const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
        const result = await changePassword({ currentPassword, newPassword });
        if ("data" in result) {
            reset();
            toast.success(t("changed"));
        } else toast.error(apiError(result.error));
    });

    return (
        <Panel title={t("title")} description={t("description")}>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <PasswordField
                    autoComplete="current-password"
                    label={t("current")}
                    error={fieldError(errors.currentPassword)}
                    {...register("currentPassword")}
                />
                <PasswordField
                    autoComplete="new-password"
                    label={t("new")}
                    error={fieldError(errors.newPassword)}
                    {...register("newPassword")}
                />
                <PasswordStrength value={newPassword} />
                <PasswordField
                    autoComplete="new-password"
                    label={t("confirm")}
                    error={fieldError(errors.confirmPassword)}
                    {...register("confirmPassword")}
                />
                <SubmitButton pending={isLoading} pendingLabel={tc("loading")}>
                    {t("submit")}
                </SubmitButton>
            </form>
        </Panel>
    );
}

function DisplayCurrency({ user }: { user: User }) {
    const t = useTranslations("settings.displayCurrency");
    const apiError = useApiErrorMessage();
    const current = useDisplayCurrency();
    const [save, { isLoading }] = useSetDisplayCurrencyMutation();

    return (
        <Panel title={t("title")} description={t("description")}>
            <SelectField
                label={t("label")}
                value={current}
                disabled={isLoading}
                onChange={async (value) => {
                    const result = await save({
                        userId: user.id,
                        input: value,
                    });
                    if ("data" in result)
                        toast.success(t("saved", { currency: value }));
                    else toast.error(apiError(result.error));
                }}
                options={DISPLAY_CURRENCIES.map((c) => ({
                    value: c,
                    label: c,
                }))}
            />
        </Panel>
    );
}

function AccountInfo({ user }: { user: User }) {
    const t = useTranslations("settings.accountInfo");
    const tv = useTranslations("verification.countries");
    const country =
        user.country && tv.has(user.country as "DE")
            ? tv(user.country as "DE")
            : (user.country ?? "—");

    return (
        <Panel title={t("title")} description={t("description")}>
            <div className="grid gap-5 sm:grid-cols-2">
                {(
                    [
                        ["name", user.name],
                        ["email", user.email],
                        ["phone", user.phone ?? "—"],
                        ["country", country],
                    ] as const
                ).map(([key, value]) => (
                    <TextField
                        key={key}
                        label={t(key)}
                        value={value}
                        readOnly
                        disabled
                    />
                ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
                {t.rich("changeNote", {
                    link: (chunks) => (
                        <Link
                            href={ROUTES.support}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                            {chunks}
                        </Link>
                    ),
                })}
            </p>
        </Panel>
    );
}

function Preferences() {
    const t = useTranslations("settings.preferences");
    const { theme, setTheme } = useResolvedTheme();

    return (
        <Panel title={t("title")}>
            <SwitchField
                label={t("darkTheme")}
                description={t("darkThemeHint")}
                checked={theme !== "light"}
                onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                }
            />
        </Panel>
    );
}

export function Settings() {
    const tc = useTranslations("common");
    const session = useCurrentUser();
    const me = useMeQuery(session.id);

    return (
        <AsyncContent
            isLoading={me.isLoading}
            isError={me.isError}
            onRetry={me.refetch}
            loadingLabel={tc("loading")}
        >
            {me.data && (
                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="space-y-6">
                        <AvatarSection user={me.data} />
                        <AccountInfo user={me.data} />
                        <DisplayCurrency user={me.data} />
                        <Preferences />
                    </div>
                    <div className="space-y-6">
                        <PasswordForm />
                        <SecuritySection user={me.data} />
                    </div>
                </div>
            )}
        </AsyncContent>
    );
}
