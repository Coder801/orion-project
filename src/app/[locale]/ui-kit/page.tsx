import type { Metadata } from 'next'
import { hasLocale, useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Logo } from '@/components/layout/Logo'
import { PageHeader } from '@/components/layout/PageHeader'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { routing } from '@/i18n/routing'
import { UiKitShowcase } from './UiKitShowcase'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/ui-kit'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: 'uiKit',
  })
  return { title: t('title'), robots: { index: false } }
}

export default function UiKitPage() {
  const t = useTranslations('uiKit')

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PageHeader title={t('title')} description={t('description')} />
        <UiKitShowcase />
      </main>
    </div>
  )
}
