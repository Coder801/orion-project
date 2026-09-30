import { LOCALE_BY_LANGUAGE } from '@/i18n/languages'
import type { CryptoCurrency, Currency, FiatCurrency, Language } from '@/types'

const CRYPTO_CURRENCIES: readonly CryptoCurrency[] = ['BTC', 'ETH', 'USDT', 'SOL']

const CRYPTO_MAX_DECIMALS: Record<CryptoCurrency, number> = {
  BTC: 8,
  ETH: 6,
  USDT: 2,
  SOL: 4,
}

type SignDisplay = 'auto' | 'always' | 'exceptZero' | 'never'

interface MoneyFormatOptions {
  signDisplay?: SignDisplay
  /** Fixed number of fraction digits for fiat, e.g. 0 for whole prices. */
  fractionDigits?: number
}

export function isCryptoCurrency(currency: Currency): currency is CryptoCurrency {
  return (CRYPTO_CURRENCIES as readonly Currency[]).includes(currency)
}

export function formatFiat(
  amount: number,
  currency: FiatCurrency,
  language: Language,
  { signDisplay = 'auto', fractionDigits }: MoneyFormatOptions = {},
): string {
  return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[language], {
    style: 'currency',
    currency,
    signDisplay,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}

// Intl has no currency codes for crypto, so format the number and append the ticker.
export function formatCrypto(
  amount: number,
  currency: CryptoCurrency,
  language: Language,
  { signDisplay = 'auto' }: MoneyFormatOptions = {},
): string {
  const value = new Intl.NumberFormat(LOCALE_BY_LANGUAGE[language], {
    minimumFractionDigits: 2,
    maximumFractionDigits: CRYPTO_MAX_DECIMALS[currency],
    signDisplay,
  }).format(amount)
  return `${value} ${currency}`
}

export function formatMoney(
  amount: number,
  currency: Currency,
  language: Language,
  options?: MoneyFormatOptions,
): string {
  return isCryptoCurrency(currency)
    ? formatCrypto(amount, currency, language, options)
    : formatFiat(amount, currency, language, options)
}

export function formatPercent(value: number, language: Language): string {
  return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[language], {
    style: 'percent',
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value)
}

const DATE_STYLES = {
  short: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  dateTime: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>

export type DateStyle = keyof typeof DATE_STYLES

// A fixed time zone keeps server and client output identical (no hydration mismatch).
export function formatDate(
  value: string | Date,
  language: Language,
  style: DateStyle = 'short',
  timeZone = 'UTC',
): string {
  return new Intl.DateTimeFormat(LOCALE_BY_LANGUAGE[language], {
    ...DATE_STYLES[style],
    timeZone,
  }).format(typeof value === 'string' ? new Date(value) : value)
}
