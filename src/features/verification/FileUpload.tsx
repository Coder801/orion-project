"use client";

import { FileTextIcon, UploadIcon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Progress } from "@/components/ui/Progress";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

const UPLOAD_MS = 700;

/** Object URL for an image file, revoked when the file changes. */
function usePreview(file: File | undefined): string | null {
    const url = useMemo(
        () =>
            file && file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : null,
        [file],
    );
    useEffect(
        () => () => {
            if (url) URL.revokeObjectURL(url);
        },
        [url],
    );
    return url;
}

/**
 * Simulated upload progress: a real backend would PUT the file to a presigned
 * URL here. The demo keeps files in memory, so only the progress is faked.
 */
function useFakeUpload(file: File | undefined): number {
    const [progress, setProgress] = useState(100);
    useEffect(() => {
        if (!file) return;
        const started = performance.now();
        let frame = requestAnimationFrame(function tick(now) {
            const value = Math.min(100, ((now - started) / UPLOAD_MS) * 100);
            setProgress(value);
            if (value < 100) frame = requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(frame);
    }, [file]);
    return file ? progress : 0;
}

export function FileUpload({
    label,
    hint,
    accept,
    value,
    onChange,
    error,
    capture,
}: {
    label: string;
    hint?: string;
    accept: string[];
    value: File | undefined;
    onChange: (file: File | undefined) => void;
    error?: string;
    /** Opens the camera on mobile (selfies). */
    capture?: "user" | "environment";
}) {
    const t = useTranslations("verification.upload");
    const language = useLocale();
    const id = useId();
    const input = useRef<HTMLInputElement>(null);
    const preview = usePreview(value);
    const progress = useFakeUpload(value);
    const uploading = value !== undefined && progress < 100;

    return (
        <div className="space-y-2">
            <p id={`${id}-label`} className="text-sm font-medium">
                {label}
            </p>
            <input
                ref={input}
                id={id}
                type="file"
                accept={accept.join(",")}
                capture={capture}
                className="sr-only"
                aria-labelledby={`${id}-label`}
                aria-describedby={hint ? `${id}-hint` : undefined}
                aria-invalid={error ? true : undefined}
                onChange={(event) => {
                    onChange(event.target.files?.[0]);
                    event.target.value = "";
                }}
            />
            {value ? (
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-2xl border bg-muted/30 p-3",
                        error && "border-destructive",
                    )}
                >
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                        <img
                            src={preview}
                            alt={t("preview", { name: value.name })}
                            className="size-14 shrink-0 rounded-lg object-cover"
                        />
                    ) : (
                        <span className="grid size-14 shrink-0 place-items-center rounded-lg border bg-card text-muted-foreground">
                            <FileTextIcon className="size-6" aria-hidden />
                        </span>
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="truncate text-sm font-medium">
                            {value.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatBytes(value.size, language)} ·{" "}
                            {uploading ? t("uploading") : t("uploaded")}
                        </p>
                        <Progress
                            value={progress}
                            aria-label={t("progress", { name: value.name })}
                            className="h-1.5"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onChange(undefined)}
                        aria-label={t("remove", { name: value.name })}
                    >
                        <XIcon aria-hidden />
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className={cn(
                        "flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-hidden",
                        error && "border-destructive",
                    )}
                >
                    <UploadIcon className="size-5 text-primary" aria-hidden />
                    {t("choose")}
                </button>
            )}
            {hint && (
                <p id={`${id}-hint`} className="text-xs text-muted-foreground">
                    {hint}
                </p>
            )}
            <FieldError message={error} />
        </div>
    );
}
