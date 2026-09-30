'use client'

import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Logo } from '@/components/layout/Logo'
import { SIDEBAR_ID } from '@/components/layout/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { selectUser } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectIsSidebarOpen, sidebarOpened } from '@/store/uiSlice'

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Topbar() {
  const t = useTranslations('layout')
  const dispatch = useAppDispatch()
  const isSidebarOpen = useAppSelector(selectIsSidebarOpen)
  const user = useAppSelector(selectUser)
  const displayName = user?.name ?? t('guest')

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => dispatch(sidebarOpened())}
        aria-label={t('openMenu')}
        aria-expanded={isSidebarOpen}
        aria-controls={SIDEBAR_ID}
        className="-ml-2 lg:hidden"
      >
        <Menu aria-hidden />
      </Button>
      <Logo href="/app" compact className="lg:hidden" />

      <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="flex items-center gap-3 rounded-full py-1 pl-1 pr-1 sm:pr-3">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-strong"
          >
            {getInitials(displayName)}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-medium leading-tight">{displayName}</span>
            {user && (
              <span className="block truncate text-xs leading-tight text-fg-subtle">
                {user.email}
              </span>
            )}
          </span>
        </div>
      </div>
    </header>
  )
}
