export type Theme = 'dark' | 'light'
export type Language = 'ru' | 'en'

export type FiatCurrency = 'USD' | 'EUR' | 'GBP'
export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'SOL'
export type Currency = FiatCurrency | CryptoCurrency

export interface User {
  id: string
  name: string
  email: string
  baseCurrency: FiatCurrency
}
