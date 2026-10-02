"use client";

import { LaptopIcon, LogOutIcon, ShieldCheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { User } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { useSignOut } from "@/features/auth/useSignOut";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { CopyValue } from "@/features/shared/CopyValue";
import { useApiErrorMessage } from "@/features/shared/errors";
import { Panel } from "@/features/shared/Panel";
import { PlaceholderQr } from "@/features/shared/PlaceholderQr";
import { formatDate } from "@/lib/format";
import {
    useRevokeSessionMutation,
    useSessionsQuery,
    useSetTwoFactorMutation,
} from "@/store/api";

/** Placeholder TOTP secret: the demo never generates or checks real codes. */
function demoSecretFor(userId: string): string {
    const base = userId.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return `DEMO-${base.padEnd(12, "X").slice(0, 12).match(/.{4}/g)?.join("-")}`;
}

function TwoFactor({ user }: { user: User }) {
    const t = useTranslations("settings.twoFactor");
    const tc = useTranslations("common");
    const tv = useTranslations("validation");
    const apiError = useApiErrorMessage();
    const [setup, setSetup] = useState(false);
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState<string>();
    const [setTwoFactor, { isLoading }] = useSetTwoFactorMutation();
    const enabled = user.twoFactorEnabled === true;
    const secret = demoSecretFor(user.id);

    const submit = async (next: boolean) => {
        if (!/^\d{6}$/.test(code)) {
            setCodeError(tv("code"));
            return;
        }
        const result = await setTwoFactor({
            userId: user.id,
            input: { enabled: next, code },
        });
        if ("data" in result) {
            toast.success(t(next ? "enabledToast" : "disabledToast"));
            setSetup(false);
            setCode("");
        } else toast.error(apiError(result.error));
    };

    const codeField = (
        <TextField
            label={t("code")}
            hint={t("demoHint")}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            error={codeError}
            onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, ""));
                setCodeError(undefined);
            }}
        />
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="flex items-center gap-2 font-medium">
                        <ShieldCheckIcon
                            className="size-4 text-primary"
                            aria-hidden
                        />
                        {t("title")}
                        <Badge
                            variant={enabled ? "success" : "secondary"}
                            className="px-2 py-0 text-[10px]"
                        >
                            {t(enabled ? "on" : "off")}
                        </Badge>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("description")}
                    </p>
                </div>
                {!setup && (
                    <Button
                        variant={enabled ? "outline" : "gradient"}
                        size="sm"
                        onClick={() => setSetup(true)}
                    >
                        {t(enabled ? "disable" : "enable")}
                    </Button>
                )}
            </div>

            {setup && (
                <form
                    noValidate
                    className="space-y-4 rounded-2xl border bg-muted/30 p-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void submit(!enabled);
                    }}
                >
                    {!enabled && (
                        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                            <PlaceholderQr
                                value={`otpauth:${secret}`}
                                className="mx-auto"
                            />
                            <div className="space-y-2 text-sm">
                                <p className="text-muted-foreground">
                                    {t("scan")}
                                </p>
                                <dl>
                                    <CopyValue
                                        label={t("secret")}
                                        value={secret}
                                    />
                                </dl>
                            </div>
                        </div>
                    )}
                    {codeField}
                    <div className="flex gap-2">
                        <SubmitButton
                            pending={isLoading}
                            pendingLabel={tc("loading")}
                            variant={enabled ? "destructive" : "gradient"}
                        >
                            {t(enabled ? "confirmDisable" : "confirmEnable")}
                        </SubmitButton>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setSetup(false);
                                setCode("");
                                setCodeError(undefined);
                            }}
                        >
                            {tc("cancel")}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

function Sessions({ userId }: { userId: string }) {
    const t = useTranslations("settings.sessions");
    const language = useLocale();
    const session = useCurrentUser();
    const signOut = useSignOut();
    const apiError = useApiErrorMessage();
    const { data = [], isLoading, isError, refetch } = useSessionsQuery(userId);
    const [revoke, { isLoading: isRevoking, originalArgs }] =
        useRevokeSessionMutation();

    const end = async (id: string) => {
        if (id === session.sessionId) {
            signOut();
            return;
        }
        const result = await revoke({ userId, input: id });
        if ("data" in result) toast.success(t("ended"));
        else toast.error(apiError(result.error));
    };

    return (
        <div className="space-y-3">
            <p className="font-medium">{t("title")}</p>
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={data.length === 0}
                onRetry={refetch}
                loadingLabel={t("title")}
                empty={{ title: t("empty"), icon: LaptopIcon }}
            >
                <ul className="divide-y rounded-2xl border">
                    {data.map((s) => {
                        const current = s.id === session.sessionId;
                        return (
                            <li
                                key={s.id}
                                className="flex items-center gap-3 p-3"
                            >
                                <LaptopIcon
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 truncate text-sm font-medium">
                                        {s.device}
                                        {current && (
                                            <Badge
                                                variant="success"
                                                className="px-2 py-0 text-[10px]"
                                            >
                                                {t("current")}
                                            </Badge>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t("lastActive", {
                                            date: formatDate(
                                                s.lastActiveAt,
                                                language,
                                                "dateTime",
                                            ),
                                        })}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={
                                        isRevoking &&
                                        originalArgs?.input === s.id
                                    }
                                    onClick={() => end(s.id)}
                                >
                                    <LogOutIcon aria-hidden />
                                    {t("signOut")}
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            </AsyncContent>
        </div>
    );
}

export function SecuritySection({ user }: { user: User }) {
    const t = useTranslations("settings.security");
    return (
        <Panel title={t("title")} description={t("description")}>
            <div className="space-y-6">
                <TwoFactor user={user} />
                <Sessions userId={user.id} />
            </div>
        </Panel>
    );
}
