import { NfcIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Card gradients built from theme tokens; the zinc skins stay dark in both
// themes so the white card text always reads.
export const CARD_SKINS = {
    aurora: "from-primary via-secondary to-accent",
    nebula: "from-secondary via-primary to-primary",
    ember: "from-accent via-secondary to-secondary",
    graphite: "from-zinc-700 via-zinc-800 to-zinc-950",
    obsidian: "from-zinc-950 via-zinc-800 to-zinc-950",
} as const;

export type CardSkin = keyof typeof CARD_SKINS;

/** Base classes of a card face: ISO card ratio, gradient, white text. */
export const cardFaceClass =
    "relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-linear-135 p-5 text-white shadow-xl";

/** EMV chip + contactless mark, purely decorative. */
export function CardChip({ className }: { className?: string }) {
    return (
        <div aria-hidden className={cn("flex items-center gap-2", className)}>
            <span className="relative h-7 w-9 overflow-hidden rounded-md bg-linear-135 from-amber-200 via-amber-400 to-amber-600 shadow-inner">
                <span className="absolute inset-x-0 top-1/2 h-px bg-black/25" />
                <span className="absolute inset-y-0 left-1/3 w-px bg-black/25" />
                <span className="absolute inset-y-0 right-1/3 w-px bg-black/25" />
            </span>
            <NfcIcon className="size-5 rotate-90 text-white/80" />
        </div>
    );
}

/** Soft light blobs that give the flat gradient some depth. */
export function CardShine() {
    return (
        <>
            <span
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/15 blur-2xl"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-10 size-40 rounded-full bg-black/20 blur-2xl"
            />
        </>
    );
}
