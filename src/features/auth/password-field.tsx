"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";

import { TextField } from "@/components/ui/form-field";

/** Password input with a show/hide toggle. */
export function PasswordField(
    props: Omit<ComponentProps<typeof TextField>, "type" | "endAdornment">,
) {
    const t = useTranslations("auth.fields");
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <TextField
                {...props}
                type={visible ? "text" : "password"}
                className="pr-11"
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? t("hidePassword") : t("showPassword")}
                aria-pressed={visible}
                className="absolute top-[1.375rem] right-3.5 flex h-10 cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground"
            >
                {visible ? (
                    <EyeOffIcon className="size-4" aria-hidden />
                ) : (
                    <EyeIcon className="size-4" aria-hidden />
                )}
            </button>
        </div>
    );
}
