"use client";

import { PaletteIcon, RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { convertVia, totalBalance } from "@/domain/portfolio";
import type { Account, User } from "@/domain/types";
import { cardLast4For } from "@/features/accounts/identifiers";
import { useDisplayCurrency, useRates } from "@/features/shared/useWallet";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import {
    CARD_SKINS,
    CardChip,
    CardShine,
    cardFaceClass,
    type CardSkin,
} from "@/features/shared/CardArt";
import { cn } from "@/lib/utils";

const SKINS: Record<Skin, string> = {
    aurora: CARD_SKINS.aurora,
    nebula: CARD_SKINS.nebula,
    ember: CARD_SKINS.ember,
    graphite: CARD_SKINS.graphite,
};

type Skin = Exclude<CardSkin, "obsidian">;
const SKIN_KEYS = Object.keys(SKINS) as Skin[];
const SKIN_STORAGE_KEY = "orion-card-skin";
/** Crypto equivalent of the total is shown in this asset. */
const CRYPTO_EQUIVALENT = "BTC";

// Per-browser preference kept in localStorage and read as an external store,
// so the server render (no storage) and the client agree on first paint.
const skinListeners = new Set<() => void>();

function readSkin(): Skin {
    try {
        const value = window.localStorage.getItem(SKIN_STORAGE_KEY);
        return value && value in SKINS ? (value as Skin) : "aurora";
    } catch {
        return "aurora";
    }
}

function writeSkin(skin: Skin): void {
    try {
        window.localStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch {
        // Storage blocked: the skin just won't persist.
    }
    skinListeners.forEach((listener) => listener());
}

function subscribeSkin(listener: () => void): () => void {
    skinListeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
        skinListeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
}

/** MM/YY four years after the account was opened (placeholder). */
function expiryOf(createdAt: string): string {
    const date = new Date(createdAt);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String((date.getUTCFullYear() + 4) % 100).padStart(2, "0");
    return `${month}/${year}`;
}

/**
 * Card-shaped balance widget. Only the last four digits are ever known to the
 * app; the full number never reaches the frontend.
 */
export function CardWidget({
    user,
    accounts,
}: {
    user: User;
    accounts: Account[];
}) {
    const t = useTranslations("dashboard.card");
    const display = useDisplayCurrency();
    const formatMoney = useFormatMoney();
    const { source, isLoading } = useRates();
    const [flipped, setFlipped] = useState(false);
    const skin = useSyncExternalStore(
        subscribeSkin,
        readSkin,
        () => "aurora" as Skin,
    );

    const nextSkin = () =>
        writeSkin(
            SKIN_KEYS[(SKIN_KEYS.indexOf(skin) + 1) % SKIN_KEYS.length] ??
                "aurora",
        );

    const total = source ? totalBalance(source, accounts, display) : null;
    const inCrypto =
        source && total
            ? convertVia(source, total, display, CRYPTO_EQUIVALENT)
            : null;
    const face = cn(
        cardFaceClass,
        "absolute inset-0 aspect-auto [backface-visibility:hidden]",
    );

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                aria-pressed={flipped}
                aria-label={flipped ? t("showFront") : t("showBack")}
                className="block w-full rounded-2xl [perspective:1200px] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-hidden"
            >
                <div
                    className={cn(
                        "relative aspect-[1.586] w-full transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none",
                        flipped && "[transform:rotateY(180deg)]",
                    )}
                >
                    <div
                        className={cn(face, SKINS[skin])}
                        aria-hidden={flipped}
                    >
                        <CardShine />
                        <div className="relative flex h-full flex-col justify-between text-left">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[11px] tracking-wide text-white/70 uppercase">
                                        {t("totalBalance")}
                                    </p>
                                    {isLoading || total === null ? (
                                        <Skeleton className="mt-1 h-7 w-32 bg-white/20" />
                                    ) : (
                                        <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums">
                                            {formatMoney(total, display)}
                                        </p>
                                    )}
                                    {inCrypto && (
                                        <p className="text-xs text-white/80 tabular-nums">
                                            ≈{" "}
                                            {formatMoney(
                                                inCrypto,
                                                CRYPTO_EQUIVALENT,
                                            )}
                                        </p>
                                    )}
                                </div>
                                <span className="rounded-md border border-white/30 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase">
                                    {t("demo")}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <CardChip />
                                <p className="font-mono text-lg tracking-[0.2em] tabular-nums">
                                    •••• •••• •••• {cardLast4For(user.id)}
                                </p>
                            </div>
                            <div className="flex items-end justify-between gap-3 text-xs">
                                <div className="min-w-0">
                                    <p className="text-[10px] text-white/70 uppercase">
                                        {t("holder")}
                                    </p>
                                    <p className="truncate font-medium tracking-wide uppercase">
                                        {user.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/70 uppercase">
                                        {t("expires")}
                                    </p>
                                    <p className="font-medium tabular-nums">
                                        {expiryOf(user.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className={cn(
                            face,
                            SKINS[skin],
                            "[transform:rotateY(180deg)]",
                        )}
                        aria-hidden={!flipped}
                    >
                        <div className="absolute inset-x-0 top-6 h-10 bg-black/70" />
                        <div className="relative mt-16 flex items-center gap-3">
                            <div className="h-8 flex-1 rounded bg-white/80" />
                            <span className="rounded bg-white px-2 py-1 font-mono text-sm text-black">
                                •••
                            </span>
                        </div>
                        <p className="relative mt-4 text-left text-[11px] text-white/80">
                            {t("backNote")}
                        </p>
                    </div>
                </div>
            </button>
            <div className="flex justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={nextSkin}>
                    <PaletteIcon aria-hidden />
                    {t("skin", { skin: t(`skins.${skin}`) })}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlipped((f) => !f)}
                >
                    <RotateCcwIcon aria-hidden />
                    {t("flip")}
                </Button>
            </div>
        </div>
    );
}
