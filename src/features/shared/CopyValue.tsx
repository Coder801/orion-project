"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/utils";

/** Label + monospace value with a copy-to-clipboard button (inside a <dl>). */
export function CopyValue({ label, value }: { label: string; value: string }) {
    const t = useTranslations("accountDetails");
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        // Clipboard can be blocked; the value stays selectable.
        if (await copyToClipboard(value)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 truncate font-mono text-sm">{value}</dd>
            </div>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={copy}
                aria-label={copied ? t("copied") : t("copy", { label })}
            >
                {copied ? (
                    <CheckIcon className="text-success" aria-hidden />
                ) : (
                    <CopyIcon aria-hidden />
                )}
            </Button>
        </div>
    );
}
