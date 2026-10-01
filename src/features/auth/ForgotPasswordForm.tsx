"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, MailCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ROUTES } from "@/config/routes";
import { AuthCard, authLinkClassName } from "@/features/auth/AuthCard";
import {
    forgotPasswordSchema,
    type ForgotPasswordValues,
} from "@/features/auth/schemas";
import { useFieldError } from "@/features/shared/errors";
import { Link } from "@/i18n/navigation";
import { useRequestPasswordResetMutation } from "@/store/api";

export function ForgotPasswordForm() {
    const t = useTranslations("auth");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const [requestReset, { isLoading, isSuccess }] =
        useRequestPasswordResetMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    return (
        <AuthCard
            icon={KeyRoundIcon}
            title={t("forgot.title")}
            description={t("forgot.description")}
            footer={
                <Link href={ROUTES.signIn} className={authLinkClassName}>
                    {t("forgot.back")}
                </Link>
            }
        >
            {isSuccess ? (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm"
                >
                    <MailCheckIcon
                        className="size-5 shrink-0 text-success"
                        aria-hidden
                    />
                    {t("forgot.sent")}
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit(({ email }) => requestReset(email))}
                    noValidate
                    className="space-y-5"
                >
                    <TextField
                        type="email"
                        autoComplete="email"
                        placeholder={t("fields.emailPlaceholder")}
                        label={t("fields.email")}
                        error={fieldError(errors.email)}
                        {...register("email")}
                    />
                    <SubmitButton
                        pending={isLoading}
                        pendingLabel={tc("loading")}
                        variant="gradient"
                        size="lg"
                        className="w-full"
                    >
                        {t("forgot.submit")}
                    </SubmitButton>
                </form>
            )}
        </AuthCard>
    );
}
