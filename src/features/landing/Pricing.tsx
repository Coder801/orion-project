import { Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { PLAN_FEATURES, PLANS } from '@/features/landing/content'
import { SectionHeading } from '@/features/landing/SectionHeading'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { formatFiat } from '@/lib/format'

export function Pricing() {
  const t = useTranslations('landing.pricing')
  const language = useLocale()

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="scroll-mt-16 border-t border-border/60 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="pricing-title" title={t('title')} subtitle={t('subtitle')} />
        <ul className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const name = t(`plans.${plan.id}.name`)
            return (
              <li
                key={plan.id}
                className={cn(
                  'relative flex h-full flex-col rounded-2xl border bg-surface-raised p-7 shadow-card',
                  plan.highlighted ? 'border-brand shadow-glow' : 'border-border',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  {plan.highlighted && <Badge variant="brand">{t('popular')}</Badge>}
                </div>
                <p className="mt-1 text-sm text-fg-muted">{t(`plans.${plan.id}.description`)}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tabular-nums tracking-tight">
                    {formatFiat(plan.monthlyPrice, 'EUR', language, { fractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-fg-subtle">{t('perMonth')}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {PLAN_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      {t(`plans.${plan.id}.features.${feature}`)}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={buttonVariants({
                    variant: plan.highlighted ? 'primary' : 'outline',
                    fullWidth: true,
                    className: 'mt-8',
                  })}
                >
                  {t('choose', { plan: name })}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
