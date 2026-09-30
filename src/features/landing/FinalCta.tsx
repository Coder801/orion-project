import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/button-variants'
import { Link } from '@/i18n/navigation'

export function FinalCta() {
  const t = useTranslations('landing.cta')

  return (
    <section aria-labelledby="cta-title" className="px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-brand/40 bg-brand-soft px-6 py-14 text-center sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl"
        />
        <h2
          id="cta-title"
          className="relative text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {t('title')}
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-fg-muted">{t('text')}</p>
        <Link
          href="/register"
          className={buttonVariants({ size: 'lg', className: 'relative mt-8' })}
        >
          {t('button')}
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  )
}
