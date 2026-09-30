import type { Language } from '@/types'

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const satisfies readonly Language[]
export const DEFAULT_LANGUAGE: Language = 'en'

/** BCP 47 locale used by Intl formatters for each UI language. */
export const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  ru: 'ru-RU',
  en: 'en-US',
}

export const LANGUAGE_LABELS: Record<Language, { short: string; native: string }> = {
  ru: { short: 'RU', native: 'Русский' },
  en: { short: 'EN', native: 'English' },
}
