'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@/i18n/languages'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

export function LanguageSwitcher() {
  const t = useTranslations('layout')
  const current = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div
      role="group"
      aria-label={t('language')}
      aria-busy={isPending}
      className="inline-flex rounded-md border border-border p-0.5"
    >
      {SUPPORTED_LANGUAGES.map((language) => {
        const isActive = language === current
        const { short, native } = LANGUAGE_LABELS[language]
        return (
          <button
            key={language}
            type="button"
            lang={language}
            aria-label={native}
            aria-pressed={isActive}
            disabled={isPending}
            onClick={() => startTransition(() => router.replace(pathname, { locale: language }))}
            className={cn(
              'rounded px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-60',
              isActive ? 'bg-brand-soft text-brand-strong' : 'text-fg-subtle hover:text-fg',
            )}
          >
            {short}
          </button>
        )
      })}
    </div>
  )
}
