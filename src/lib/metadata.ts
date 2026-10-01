import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type en from "@/i18n/messages/en.json";

export type PageKey = keyof typeof en.pages;

/** `export const generateMetadata = pageMetadata('dashboard')` in a page file. */
export function pageMetadata(key: PageKey) {
    return async function generateMetadata(): Promise<Metadata> {
        const t = await getTranslations("pages");
        return { title: t(`${key}.title`) };
    };
}
