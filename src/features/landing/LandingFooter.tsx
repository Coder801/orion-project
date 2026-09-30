import { useTranslations } from 'next-intl'
import { Logo } from '@/components/layout/Logo'
import { LANDING_SECTIONS } from '@/features/landing/content'
import { Link } from '@/i18n/navigation'

const linkClassName = 'text-sm text-fg-muted transition-colors hover:text-fg'

export function LandingFooter() {
  const t = useTranslations('landing')

  return (
    <footer className="border-t border-border bg-surface-sunken/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-fg-muted">{t('footer.tagline')}</p>
        </div>
        <nav aria-labelledby="footer-product">
          <h2 id="footer-product" className="text-sm font-semibold">
            {t('footer.product')}
          </h2>
          <ul className="mt-4 space-y-3">
            {LANDING_SECTIONS.map((section) => (
              <li key={section}>
                <a href={`#${section}`} className={linkClassName}>
                  {t(`nav.${section}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-account">
          <h2 id="footer-account" className="text-sm font-semibold">
            {t('footer.account')}
          </h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link href="/login" className={linkClassName}>
                {t('nav.login')}
              </Link>
            </li>
            <li>
              <Link href="/register" className={linkClassName}>
                {t('nav.openAccount')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-fg-subtle sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl">{t('footer.disclaimer')}</p>
          <p className="shrink-0">{t('footer.rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
