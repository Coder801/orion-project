import { BarChart3, Coins, ShieldCheck, Zap, type LucideIcon } from 'lucide-react'
import type { Currency, FiatCurrency } from '@/types'

export const LANDING_SECTIONS = ['features', 'assets', 'pricing', 'faq'] as const

export const HERO_POINTS = ['fast', 'fees', 'support'] as const

export const FEATURES: {
  id: 'transfers' | 'security' | 'multicurrency' | 'analytics'
  icon: LucideIcon
}[] = [
  { id: 'transfers', icon: Zap },
  { id: 'security', icon: ShieldCheck },
  { id: 'multicurrency', icon: Coins },
  { id: 'analytics', icon: BarChart3 },
]

export const ASSET_POINTS = ['balance', 'exchange', 'history'] as const

// Illustrative numbers for the marketing preview only — not the app's mock data.
export const PREVIEW_TOTAL = {
  amount: 48250.32,
  currency: 'EUR',
  change: 0.024,
} as const satisfies { amount: number; currency: FiatCurrency; change: number }

export const PREVIEW_SERIES = [31, 34, 33, 38, 36, 42, 41, 47, 45, 52, 55, 53, 60]

export interface PreviewAccount {
  id: 'eur' | 'usd' | 'btc' | 'eth'
  symbol: string
  currency: Currency
  balance: number
  change: number
}

export const PREVIEW_ACCOUNTS: PreviewAccount[] = [
  { id: 'eur', symbol: '€', currency: 'EUR', balance: 18420.5, change: 0.012 },
  { id: 'usd', symbol: '$', currency: 'USD', balance: 6310.0, change: -0.004 },
  { id: 'btc', symbol: '₿', currency: 'BTC', balance: 0.3125, change: 0.051 },
  { id: 'eth', symbol: 'Ξ', currency: 'ETH', balance: 2.84, change: 0.032 },
]

export const EXCHANGE_EXAMPLE = {
  pay: 1000,
  payCurrency: 'EUR',
  btcRate: 63450,
  fee: 2.5,
} as const satisfies { pay: number; payCurrency: FiatCurrency; btcRate: number; fee: number }

export interface Plan {
  id: 'start' | 'plus' | 'pro'
  monthlyPrice: number
  highlighted?: boolean
}

export const PLANS: Plan[] = [
  { id: 'start', monthlyPrice: 0 },
  { id: 'plus', monthlyPrice: 8, highlighted: true },
  { id: 'pro', monthlyPrice: 20 },
]

export const PLAN_FEATURES = ['f1', 'f2', 'f3'] as const

export const FAQ_ITEMS = ['demo', 'open', 'crypto', 'security', 'fees'] as const
