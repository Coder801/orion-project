import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/button-variants'
import { HERO_POINTS } from '@/features/landing/content'
import { DashboardPreview } from '@/features/landing/DashboardPreview'
import { Link } from '@/i18n/navigation'

export function Hero() {
  const t = useTranslations('landing.hero')

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute -right-32 top-40 size-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border)/0.5)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised/70 px-3 py-1 text-xs font-medium text-fg-muted">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            {t('eyebrow')}
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t('title')}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg text-fg-muted">{t('subtitle')}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className={buttonVariants({ size: 'lg' })}>
              {t('primaryCta')}
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/login" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              {t('secondaryCta')}
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted">
            {HERO_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden />
                {t(`points.${point}`)}
              </li>
            ))}
          </ul>
        </div>

        <DashboardPreview />
      </div>
    </section>
  )
}
