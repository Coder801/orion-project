"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SwitchField, TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useCurrentUser } from "@/features/auth/session";
import { PasswordField } from "@/features/auth/PasswordField";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError, FormSuccess } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import { useResolvedTheme } from "@/lib/hooks/useResolvedTheme";
import { passwordSchema, requiredString } from "@/lib/validation";
import {
    useChangePasswordMutation,
    useUpdateProfileMutation,
} from "@/store/api";
import { sessionUpdated } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

const profileSchema = z.object({ name: requiredString().max(70) });
type ProfileValues = z.infer<typeof profileSchema>;

const passwordFormSchema = z
    .object({
        currentPassword: requiredString(),
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        error: "passwordMismatch",
        path: ["confirmPassword"],
    });
type PasswordValues = z.infer<typeof passwordFormSchema>;

function ProfileForm() {
    const t = useTranslations("settings");
    const tc = useTranslations("common");
    const user = useCurrentUser();
    const dispatch = useAppDispatch();
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const [updateProfile, { isLoading, isSuccess, error }] =
        useUpdateProfileMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user.name },
    });

    const onSubmit = handleSubmit(async (input) => {
        const result = await updateProfile({ userId: user.id, input });
        if ("data" in result && result.data)
            dispatch(sessionUpdated({ name: result.data.name }));
    });

    return (
        <Panel
            title={t("profile.title")}
            description={t("profile.description")}
        >
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess show={isSuccess} message={t("saved")} />
                <FormError message={apiError(error)} />
                <TextField
                    label={t("profile.name")}
                    autoComplete="name"
                    error={fieldError(errors.name)}
                    {...register("name")}
                />
                <TextField
                    label={t("profile.email")}
                    value={user.email}
                    readOnly
                    disabled
                />
                <SubmitButton pending={isLoading} pendingLabel={tc("loading")}>
                    {t("save")}
                </SubmitButton>
            </form>
        </Panel>
    );
}

function PasswordForm() {
    const t = useTranslations("settings");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const [changePassword, { isLoading, isSuccess }] =
        useChangePasswordMutation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = handleSubmit(async () => {
        const result = await changePassword();
        if ("data" in result) reset();
    });

    return (
        <Panel
            title={t("password.title")}
            description={t("password.description")}
        >
            <form onSubmit={onSubmit} noValidate className="space-y-5">
                <FormSuccess show={isSuccess} message={t("password.changed")} />
                <PasswordField
                    autoComplete="current-password"
                    label={t("password.current")}
                    error={fieldError(errors.currentPassword)}
                    {...register("currentPassword")}
                />
                <PasswordField
                    autoComplete="new-password"
                    label={t("password.new")}
                    error={fieldError(errors.newPassword)}
                    {...register("newPassword")}
                />
                <PasswordField
                    autoComplete="new-password"
                    label={t("password.confirm")}
                    error={fieldError(errors.confirmPassword)}
                    {...register("confirmPassword")}
                />
                <SubmitButton pending={isLoading} pendingLabel={tc("loading")}>
                    {t("password.submit")}
                </SubmitButton>
            </form>
        </Panel>
    );
}

function Preferences() {
    const t = useTranslations("settings");
    const { theme, setTheme } = useResolvedTheme();

    return (
        <Panel title={t("preferences.title")}>
            <div className="space-y-6">
                <SwitchField
                    label={t("preferences.darkTheme")}
                    description={t("preferences.darkThemeHint")}
                    checked={theme !== "light"}
                    onCheckedChange={(checked) =>
                        setTheme(checked ? "dark" : "light")
                    }
                />
            </div>
        </Panel>
    );
}

export function Settings() {
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
                <ProfileForm />
                <Preferences />
            </div>
            <PasswordForm />
        </div>
    );
}
