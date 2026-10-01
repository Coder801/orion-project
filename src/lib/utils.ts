import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    });
}

/**
 * Write `text` to the clipboard, returning whether it succeeded. Guards SSR and
 * contexts without the async Clipboard API (e.g. non-secure origins).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Permission denied or API unavailable — fall through to failure.
    }
    return false;
}
