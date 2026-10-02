import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const SIZE = 25;

function bits(seed: string): boolean[] {
    let h = 2166136261;
    const out: boolean[] = [];
    for (let i = 0; i < SIZE * SIZE; i += 1) {
        for (const char of `${seed}:${i}`) {
            h ^= char.charCodeAt(0);
            h = Math.imul(h, 16777619) >>> 0;
        }
        out.push((h & 1) === 1);
    }
    return out;
}

function inFinder(x: number, y: number): boolean {
    const corner = (cx: number, cy: number) =>
        x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    return corner(0, 0) || corner(SIZE - 7, 0) || corner(0, SIZE - 7);
}

function finderCell(x: number, y: number): boolean {
    const lx = x >= SIZE - 7 ? x - (SIZE - 7) : x;
    const ly = y >= SIZE - 7 ? y - (SIZE - 7) : y;
    const ring = Math.max(Math.abs(lx - 3), Math.abs(ly - 3));
    return ring !== 2;
}

/**
 * Deterministic QR-like pattern for a demo address. It is NOT a scannable code:
 * real QR encoding would need a library, and the demo addresses are fake anyway.
 */
export function PlaceholderQr({
    value,
    className,
}: {
    value: string;
    className?: string;
}) {
    const t = useTranslations("common");
    const cells = bits(value);
    return (
        <figure
            className={cn("inline-flex flex-col items-center gap-2", className)}
        >
            <svg
                viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
                role="img"
                aria-label={t("qrPlaceholder")}
                className="size-40 rounded-xl bg-white p-1"
                shapeRendering="crispEdges"
            >
                {cells.map((on, i) => {
                    const x = i % SIZE;
                    const y = Math.floor(i / SIZE);
                    const filled = inFinder(x, y) ? finderCell(x, y) : on;
                    return filled ? (
                        <rect
                            key={i}
                            x={x}
                            y={y}
                            width={1}
                            height={1}
                            fill="#0b0b0f"
                        />
                    ) : null;
                })}
            </svg>
            <figcaption className="text-[11px] text-muted-foreground">
                {t("qrPlaceholder")}
            </figcaption>
        </figure>
    );
}
