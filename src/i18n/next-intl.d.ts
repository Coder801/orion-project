import type en from '@/i18n/messages/en.json'
import type ru from '@/i18n/messages/ru.json'
import type { Language } from '@/types'

declare module 'next-intl' {
  interface AppConfig {
    Locale: Language
    Messages: typeof en
  }
}

// en.json is the source of truth for keys: this fails to compile if ru.json misses any of them.
type AssertAssignable<T extends U, U> = T
export type RuMessagesMatchEn = AssertAssignable<typeof ru, typeof en>
