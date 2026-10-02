"use client";

import { ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { TextField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/features/shared/FormStatus";
import { useCurrentUser } from "@/features/auth/session";
import { useMeQuery } from "@/store/api";

const CODE_RE = /^\d{6}$/;

/**
 * Step-up confirmation before a money operation: the summary of what is about
 * to happen plus a 6-digit code (authenticator app with 2FA, email otherwise).
 */
export function ConfirmCodeDialog({
    open,
    onOpenChange,
    title,
    summary,
    pending,
    error,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    summary?: ReactNode;
    pending: boolean;
    /** Translated API error of the last attempt. */
    error?: string;
    onConfirm: (code: string) => void;
}) {
    const t = useTranslations("confirmCode");
    const tc = useTranslations("common");
    const tv = useTranslations("validation");
    const user = useCurrentUser();
    const { data: me } = useMeQuery(user.id);
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState<string>();
    const channel = me?.twoFactorEnabled ? "app" : "email";

    const close = (next: boolean) => {
        if (!next) {
            setCode("");
            setCodeError(undefined);
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <form
                    noValidate
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!CODE_RE.test(code)) {
                            setCodeError(tv("code"));
                            return;
                        }
                        onConfirm(code);
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {t(`description.${channel}`)}
                        </DialogDescription>
                    </DialogHeader>
                    <FormError message={error} />
                    {summary}
                    <TextField
                        label={t("label")}
                        hint={t("demoHint")}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        startAdornment={<ShieldCheckIcon aria-hidden />}
                        value={code}
                        error={codeError}
                        onChange={(event) => {
                            setCode(event.target.value.replace(/\D/g, ""));
                            setCodeError(undefined);
                        }}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => close(false)}
                        >
                            {tc("cancel")}
                        </Button>
                        <SubmitButton
                            pending={pending}
                            pendingLabel={tc("loading")}
                            variant="gradient"
                        >
                            {t("submit")}
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
