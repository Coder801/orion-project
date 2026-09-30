import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ThemeSync } from '@/components/layout/ThemeSync'
import { routing } from '@/i18n/routing'
import { initialAuthState } from '@/store/authSlice'
import {
  parseSessionCookie,
  parseThemeCookie,
  SESSION_COOKIE,
  THEME_COOKIE,
} from '@/store/persistence'
import { StoreProvider } from '@/store/StoreProvider'
import { initialUiState } from '@/store/uiSlice'
import '../globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  })
  return {
    title: { default: t('common.appName'), template: `%s · ${t('common.appName')}` },
    description: t('meta.description'),
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const cookieStore = await cookies()
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE)?.value)
  const user = parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value)

  return (
    <html lang={locale} className={`${inter.variable} ${theme}`}>
      <body>
        <NextIntlClientProvider>
          <StoreProvider
            preloadedState={{
              auth: { ...initialAuthState, user },
              ui: { ...initialUiState, theme },
            }}
          >
            <ThemeSync />
            {children}
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
