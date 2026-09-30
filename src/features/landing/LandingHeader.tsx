import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Logo } from '@/components/layout/Logo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { buttonVariants } from '@/components/ui/button-variants'
import { LANDING_SECTIONS } from '@/features/landing/content'
import { Link } from '@/i18n/navigation'

export function LandingHeader() {
  const t = useTranslations('landing.nav')

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Logo compact />
        <nav aria-label={t('label')} className="ml-6 hidden md:block">
          <ul className="flex items-center gap-1">
            {LANDING_SECTIONS.map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  className="rounded-md px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
                >
                  {t(section)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            {t('login')}
          </Link>
          <Link
            href="/register"
            className={buttonVariants({ size: 'sm', className: 'hidden sm:inline-flex' })}
          >
            {t('openAccount')}
          </Link>
        </div>
      </div>
    </header>
  )
}
