import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default function AppLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('layout')

  return (
    <div className="min-h-screen lg:pl-64">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
      >
        {t('skipToContent')}
      </a>
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
