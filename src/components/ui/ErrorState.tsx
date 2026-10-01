"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

function ErrorState({
    title,
    description,
    onRetry,
    className,
}: ErrorStateProps) {
    const t = useTranslations("errors");

    return (
        <div
            role="alert"
            className={cn(
                "flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
                className,
            )}
        >
            <span className="grid size-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
                <TriangleAlertIcon className="size-5.5" aria-hidden />
            </span>
            <h3 className="mt-4 font-heading text-sm font-semibold">
                {title ?? t("title")}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description ?? t("generic")}
            </p>
            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="mt-5"
                >
                    <RotateCcwIcon aria-hidden />
                    {t("retry")}
                </Button>
            )}
        </div>
    );
}

export { ErrorState };
