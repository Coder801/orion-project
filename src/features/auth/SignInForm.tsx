"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/routes";
import { DEMO_EMAILS } from "@/data/seed";
import { AuthCard, authLinkClassName } from "@/features/auth/AuthCard";
import { PasswordField } from "@/features/auth/PasswordField";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";
import { useCompleteSignIn } from "@/features/auth/useCompleteSignIn";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { Link } from "@/i18n/navigation";
import { useSignInMutation } from "@/store/api";

export function SignInForm() {
    const t = useTranslations("auth");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const completeSignIn = useCompleteSignIn();
    const [signIn, { error, isLoading }] = useSignInMutation();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = handleSubmit(async ({ email }) => {
        const result = await signIn(email);
        if ("data" in result && result.data) completeSignIn(result.data);
    });

    return (
        <AuthCard
            icon={LockIcon}
            title={t("signIn.title")}
            description={t("signIn.description")}
            footer={
                <>
                    {t("signIn.noAccount")}{" "}
                    <Link href={ROUTES.signUp} className={authLinkClassName}>
                        {t("signUp.title")}
                    </Link>
                </>
            }
        >
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormError message={apiError(error)} />
                <TextField
                    type="email"
                    autoComplete="email"
                    placeholder={t("fields.emailPlaceholder")}
                    label={t("fields.email")}
                    error={fieldError(errors.email)}
                    {...register("email")}
                />
                <PasswordField
                    autoComplete="current-password"
                    placeholder="••••••••"
                    label={t("fields.password")}
                    error={fieldError(errors.password)}
                    {...register("password")}
                />
                <div className="-mt-2 flex justify-end">
                    <Link
                        href={ROUTES.forgotPassword}
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        {t("forgot.link")}
                    </Link>
                </div>
                <SubmitButton
                    pending={isLoading}
                    pendingLabel={tc("loading")}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                >
                    {t("signIn.submit")}
                </SubmitButton>
            </form>

            <div className="mt-8 rounded-2xl border border-dashed p-4">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {t("demoAccounts.title")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t("demoAccounts.hint")}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(DEMO_EMAILS).map(([key, email]) => (
                        <li key={key}>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setValue("email", email, {
                                        shouldValidate: true,
                                    });
                                    setValue("password", "demo-password", {
                                        shouldValidate: true,
                                    });
                                }}
                            >
                                {t(
                                    `demoAccounts.${key as keyof typeof DEMO_EMAILS}`,
                                )}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </AuthCard>
    );
}
