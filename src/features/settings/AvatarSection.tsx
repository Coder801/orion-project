"use client";

import { ImageUpIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getInitials } from "@/components/layout/AppSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { User } from "@/domain/types";
import { useApiErrorMessage } from "@/features/shared/errors";
import { Panel } from "@/features/shared/Panel";
import { useSetAvatarMutation } from "@/store/api";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const OUTPUT_PX = 256;
const PREVIEW_PX = 160;

/**
 * Centre square crop scaled by `zoom` and shifted by `offset` (−1…1 of the
 * free space on each axis), drawn into a `size`×`size` canvas.
 */
function drawCrop(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    zoom: number,
    offset: { x: number; y: number },
    size: number,
) {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const side = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const freeX = image.naturalWidth - side;
    const freeY = image.naturalHeight - side;
    const sx = (freeX / 2) * (1 + offset.x);
    const sy = (freeY / 2) * (1 + offset.y);
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
}

export function AvatarSection({ user }: { user: User }) {
    const t = useTranslations("settings.avatar");
    const tc = useTranslations("common");
    const tv = useTranslations("validation");
    const apiError = useApiErrorMessage();
    const input = useRef<HTMLInputElement>(null);
    const preview = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [fileError, setFileError] = useState<string>();
    const [setAvatar, { isLoading }] = useSetAvatarMutation();

    useEffect(() => {
        if (image && preview.current)
            drawCrop(preview.current, image, zoom, offset, PREVIEW_PX);
    }, [image, zoom, offset]);

    const pick = (file: File | undefined) => {
        setFileError(undefined);
        if (!file) return;
        if (!TYPES.includes(file.type)) return setFileError(tv("fileType"));
        if (file.size > MAX_BYTES) return setFileError(tv("fileTooLarge"));
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setImage(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            setFileError(tv("fileType"));
        };
        img.src = url;
    };

    const save = async () => {
        if (!image) return;
        const canvas = document.createElement("canvas");
        drawCrop(canvas, image, zoom, offset, OUTPUT_PX);
        const result = await setAvatar({
            userId: user.id,
            input: canvas.toDataURL("image/jpeg", 0.85),
        });
        if ("data" in result) {
            setImage(null);
            toast.success(t("saved"));
        } else toast.error(apiError(result.error));
    };

    const remove = async () => {
        const result = await setAvatar({ userId: user.id, input: null });
        if ("data" in result) toast.success(t("removed"));
        else toast.error(apiError(result.error));
    };

    return (
        <Panel title={t("title")} description={t("description")}>
            <input
                ref={input}
                type="file"
                accept={TYPES.join(",")}
                className="sr-only"
                aria-label={t("choose")}
                onChange={(event) => {
                    pick(event.target.files?.[0]);
                    event.target.value = "";
                }}
            />
            {image ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-5">
                        <canvas
                            ref={preview}
                            width={PREVIEW_PX}
                            height={PREVIEW_PX}
                            role="img"
                            aria-label={t("preview")}
                            className="size-40 rounded-full border bg-muted"
                        />
                        <div className="min-w-48 flex-1 space-y-4">
                            {(
                                [
                                    ["zoom", zoom, 1, 3, 0.05, setZoom],
                                    [
                                        "horizontal",
                                        offset.x,
                                        -1,
                                        1,
                                        0.05,
                                        (x: number) =>
                                            setOffset((o) => ({ ...o, x })),
                                    ],
                                    [
                                        "vertical",
                                        offset.y,
                                        -1,
                                        1,
                                        0.05,
                                        (y: number) =>
                                            setOffset((o) => ({ ...o, y })),
                                    ],
                                ] as const
                            ).map(([key, value, min, max, step, onChange]) => (
                                <div key={key} className="space-y-2">
                                    <Label id={`avatar-${key}`}>{t(key)}</Label>
                                    <Slider
                                        aria-labelledby={`avatar-${key}`}
                                        value={[value]}
                                        min={min}
                                        max={max}
                                        step={step}
                                        onValueChange={([next]) =>
                                            next !== undefined && onChange(next)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <SubmitButton
                            type="button"
                            pending={isLoading}
                            pendingLabel={tc("loading")}
                            onClick={save}
                        >
                            {t("save")}
                        </SubmitButton>
                        <Button variant="ghost" onClick={() => setImage(null)}>
                            {tc("cancel")}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-5">
                    <Avatar className="size-20 text-xl">
                        {user.avatar && (
                            <AvatarImage src={user.avatar} alt="" />
                        )}
                        <AvatarFallback>
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => input.current?.click()}
                        >
                            <ImageUpIcon aria-hidden />
                            {t(user.avatar ? "change" : "upload")}
                        </Button>
                        {user.avatar && (
                            <Button
                                variant="ghost"
                                disabled={isLoading}
                                onClick={remove}
                            >
                                <Trash2Icon aria-hidden />
                                {t("remove")}
                            </Button>
                        )}
                    </div>
                </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">{t("hint")}</p>
            <FieldError message={fileError} className="mt-2" />
        </Panel>
    );
}
