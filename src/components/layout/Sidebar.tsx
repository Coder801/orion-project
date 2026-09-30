'use client'

import { LogOut, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Logo } from '@/components/layout/Logo'
import { isNavItemActive, navItems, SIDEBAR_ID } from '@/components/layout/navigation'
import { Button } from '@/components/ui/Button'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { loggedOut } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectIsSidebarOpen, sidebarClosed } from '@/store/uiSlice'

export function Sidebar() {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = useAppSelector(selectIsSidebarOpen)
  // Assume desktop during SSR so the sidebar is never rendered `inert` on large screens.
  const isDesktop = useMediaQuery('(min-width: 1024px)', true)
  const isDrawerOpen = !isDesktop && isOpen

  useEffect(() => {
    dispatch(sidebarClosed())
  }, [pathname, dispatch])

  useEffect(() => {
    if (!isDrawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(sidebarClosed())
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isDrawerOpen, dispatch])

  const handleLogout = () => {
    dispatch(loggedOut())
    router.replace('/')
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => dispatch(sidebarClosed())}
        className={cn(
          'fixed inset-0 z-30 bg-surface-sunken/70 backdrop-blur-sm transition-opacity lg:hidden',
          isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        id={SIDEBAR_ID}
        aria-label={t('layout.mainNavigation')}
        // Off-screen drawer must not be reachable by keyboard or screen readers.
        inert={!isDesktop && !isOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface-raised transition-transform duration-200 ease-out lg:translate-x-0',
          isOpen ? 'translate-x-0 shadow-overlay' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo href="/app" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch(sidebarClosed())}
            aria-label={t('layout.closeMenu')}
            className="lg:hidden"
          >
            <X aria-hidden />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item, pathname)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-soft text-fg'
                        : 'text-fg-muted hover:bg-surface-overlay hover:text-fg',
                    )}
                  >
                    <Icon
                      className={cn('size-5', isActive ? 'text-brand-strong' : 'text-fg-subtle')}
                      aria-hidden
                    />
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-overlay hover:text-fg"
          >
            <LogOut className="size-5 text-fg-subtle" aria-hidden />
            {t('layout.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
