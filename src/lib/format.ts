import { minorToDecimal } from "@/domain/money";
import type { Currency, Minor } from "@/domain/types";
import { LOCALE_BY_LANGUAGE } from "@/i18n/languages";
import type { Language } from "@/types";

type SignDisplay = "auto" | "always" | "exceptZero" | "never";

export type CurrencyMeta = Pick<Currency, "code" | "type" | "decimals">;

// Intl formats decimal strings exactly, so minor units never pass through floats.
// Crypto has no ISO currency code: format the number and append the ticker.
export function formatMinor(
    amount: Minor,
    currency: CurrencyMeta,
    language: Language,
    { signDisplay = "auto" }: { signDisplay?: SignDisplay } = {},
): string {
    const decimal = minorToDecimal(
        amount,
        currency.decimals,
    ) as Intl.StringNumericLiteral;
    const locale = LOCALE_BY_LANGUAGE[language];
    if (currency.type === "fiat") {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency.code,
            signDisplay,
            minimumFractionDigits: currency.decimals,
            maximumFractionDigits: currency.decimals,
        }).format(decimal);
    }
    const value = new Intl.NumberFormat(locale, {
        signDisplay,
        minimumFractionDigits: 2,
        maximumFractionDigits: currency.decimals,
    }).format(decimal);
    return `${value} ${currency.code}`;
}

export function formatDecimal(
    value: string,
    language: Language,
    maxFractionDigits = 8,
): string {
    return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[language], {
        maximumFractionDigits: maxFractionDigits,
    }).format(value as Intl.StringNumericLiteral);
}

const DATE_STYLES = {
    short: { day: "numeric", month: "short", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    dateTime: {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateStyle = keyof typeof DATE_STYLES;

// A fixed time zone keeps server and client output identical (no hydration mismatch).
export function formatDate(
    value: string | Date,
    language: Language,
    style: DateStyle = "short",
    timeZone = "UTC",
): string {
    return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
        ...DATE_STYLES[style],
        timeZone,
    }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatBytes(bytes: number, language: Language): string {
    const units = ["byte", "kilobyte", "megabyte"] as const;
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[language], {
        style: "unit",
        unit: units[unit],
        unitDisplay: "short",
        maximumFractionDigits: 1,
    }).format(value);
}
