import { ArrowDown, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/button-variants'
import { ASSET_POINTS, EXCHANGE_EXAMPLE } from '@/features/landing/content'
import { SectionHeading } from '@/features/landing/SectionHeading'
import { Link } from '@/i18n/navigation'
import { formatCrypto, formatFiat } from '@/lib/format'

function ExchangeWidget() {
  const t = useTranslations('landing.assets.exchange')
  const language = useLocale()
  const { pay, payCurrency, btcRate, fee } = EXCHANGE_EXAMPLE
  const receive = (pay - fee) / btcRate

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-overlay">
      <p className="text-sm font-semibold">{t('label')}</p>
      <dl className="mt-5 space-y-2">
        <div className="rounded-lg border border-border bg-surface-sunken px-4 py-3">
          <dt className="text-xs text-fg-subtle">{t('from')}</dt>
          <dd className="mt-1 flex items-baseline justify-between gap-4">
            <span className="text-2xl font-semibold tabular-nums">
              {formatFiat(pay, payCurrency, language)}
            </span>
            <span className="text-sm font-medium text-fg-muted">{payCurrency}</span>
          </dd>
        </div>
        <div aria-hidden className="flex justify-center">
          <span className="-my-4 grid size-9 place-items-center rounded-full border border-border bg-surface-raised text-fg-muted">
            <ArrowDown className="size-4" />
          </span>
        </div>
        <div className="rounded-lg border border-border bg-surface-sunken px-4 py-3">
          <dt className="text-xs text-fg-subtle">{t('to')}</dt>
          <dd className="mt-1 flex items-baseline justify-between gap-4">
            <span className="text-2xl font-semibold tabular-nums">
              {formatCrypto(receive, 'BTC', language)}
            </span>
            <span className="text-sm font-medium text-accent">BTC</span>
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-fg-subtle">
        <span>{t('rate', { rate: formatFiat(btcRate, payCurrency, language) })}</span>
        <span>{t('fee', { fee: formatFiat(fee, payCurrency, language) })}</span>
      </div>
    </div>
  )
}

export function FiatAndCrypto() {
  const t = useTranslations('landing.assets')

  return (
    <section
      id="assets"
      aria-labelledby="assets-title"
      className="scroll-mt-16 border-t border-border/60 bg-surface-sunken/40 py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="assets-title"
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('text')}
            align="left"
          />
          <ul className="mt-8 space-y-3">
            {ASSET_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <span>{t(`points.${point}`)}</span>
              </li>
            ))}
          </ul>
          <Link href="/register" className={buttonVariants({ className: 'mt-8' })}>
            {t('cta')}
            <ArrowRight aria-hidden />
          </Link>
        </div>
        <ExchangeWidget />
      </div>
    </section>
  )
}
