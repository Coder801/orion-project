import type { Language } from "@/types";

export const SUPPORTED_LANGUAGES = [
    "en",
] as const satisfies readonly Language[];
export const DEFAULT_LANGUAGE: Language = "en";

/** BCP 47 locale used by Intl formatters for each UI language. */
export const LOCALE_BY_LANGUAGE: Record<Language, string> = {
    en: "en-US",
};

export const LANGUAGE_LABELS: Record<
    Language,
    { short: string; native: string }
> = {
    en: { short: "EN", native: "English" },
};
