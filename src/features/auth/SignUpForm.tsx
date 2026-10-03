"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ROUTES } from "@/config/routes";
import { AuthCard, authLinkClassName } from "@/features/auth/AuthCard";
import { PasswordField } from "@/features/auth/PasswordField";
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas";
import { useCompleteSignIn } from "@/features/auth/useCompleteSignIn";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { Link } from "@/i18n/navigation";
import { useSignUpMutation } from "@/store/api";

export function SignUpForm() {
    const t = useTranslations("auth");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const completeSignIn = useCompleteSignIn();
    const [signUp, { error, isLoading }] = useSignUpMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = handleSubmit(async ({ name, email, password }) => {
        const result = await signUp({ name, email, password });
        if ("data" in result && result.data) completeSignIn(result.data);
    });

    return (
        <AuthCard
            icon={UserPlusIcon}
            title={t("signUp.title")}
            description={t("signUp.description")}
            footer={
                <>
                    {t("signUp.haveAccount")}{" "}
                    <Link href={ROUTES.signIn} className={authLinkClassName}>
                        {t("signIn.title")}
                    </Link>
                </>
            }
        >
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormError message={apiError(error)} />
                <TextField
                    autoComplete="name"
                    label={t("fields.name")}
                    error={fieldError(errors.name)}
                    {...register("name")}
                />
                <TextField
                    type="email"
                    autoComplete="email"
                    placeholder={t("fields.emailPlaceholder")}
                    label={t("fields.email")}
                    error={fieldError(errors.email)}
                    {...register("email")}
                />
                <PasswordField
                    autoComplete="new-password"
                    label={t("fields.password")}
                    hint={t("fields.passwordHint")}
                    error={fieldError(errors.password)}
                    {...register("password")}
                />
                <PasswordField
                    autoComplete="new-password"
                    label={t("fields.confirmPassword")}
                    error={fieldError(errors.confirmPassword)}
                    {...register("confirmPassword")}
                />
                <SubmitButton
                    pending={isLoading}
                    pendingLabel={tc("loading")}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                >
                    {t("signUp.submit")}
                </SubmitButton>
            </form>
        </AuthCard>
    );
}
