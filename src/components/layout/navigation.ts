import {
  ArrowLeftRight,
  LayoutDashboard,
  Send,
  Settings,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type en from '@/i18n/messages/en.json'

export interface NavItem {
  href: string
  labelKey: keyof typeof en.nav
  icon: LucideIcon
  /** Active only on an exact match (otherwise nested paths count too). */
  exact?: boolean
}

export const SIDEBAR_ID = 'app-sidebar'

export const navItems: NavItem[] = [
  { href: '/app', labelKey: 'dashboard', icon: LayoutDashboard, exact: true },
  { href: '/app/accounts', labelKey: 'accounts', icon: Wallet },
  { href: '/app/transactions', labelKey: 'transactions', icon: ArrowLeftRight },
  { href: '/app/transfer', labelKey: 'transfer', icon: Send },
  { href: '/app/settings', labelKey: 'settings', icon: Settings },
]

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true
  return !item.exact && pathname.startsWith(`${item.href}/`)
}
