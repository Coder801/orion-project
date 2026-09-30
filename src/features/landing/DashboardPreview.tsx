import { useLocale, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { PREVIEW_ACCOUNTS, PREVIEW_SERIES, PREVIEW_TOTAL } from '@/features/landing/content'
import { cn } from '@/lib/cn'
import { formatFiat, formatMoney, formatPercent, isCryptoCurrency } from '@/lib/format'

const CHART_WIDTH = 320
const CHART_HEIGHT = 88

function buildSparkline(values: number[]): { line: string; area: string } {
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const step = CHART_WIDTH / (values.length - 1)
  const points = values.map((value, index) => {
    const x = index * step
    const y = CHART_HEIGHT - ((value - min) / range) * (CHART_HEIGHT - 8) - 4
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = `M${points.join(' L')}`
  return { line, area: `${line} L${CHART_WIDTH},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z` }
}

export function DashboardPreview() {
  const t = useTranslations('landing.preview')
  const language = useLocale()
  const { line, area } = buildSparkline(PREVIEW_SERIES)

  return (
    <figure aria-label={t('label')} className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand/25 via-transparent to-accent/20 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-overlay">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-fg-muted">{t('totalBalance')}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {formatFiat(PREVIEW_TOTAL.amount, PREVIEW_TOTAL.currency, language)}
              </p>
            </div>
            <Badge variant="success">
              {t('thisMonth', { value: formatPercent(PREVIEW_TOTAL.change, language) })}
            </Badge>
          </div>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="mt-6 h-20 w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="hero-sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="[stop-color:rgb(var(--brand))] [stop-opacity:0.35]" />
                <stop offset="100%" className="[stop-color:rgb(var(--brand))] [stop-opacity:0]" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#hero-sparkline-fill)" />
            <path
              d={line}
              fill="none"
              className="stroke-brand-strong"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <ul className="divide-y divide-border border-t border-border">
          {PREVIEW_ACCOUNTS.map((account) => {
            const isCrypto = isCryptoCurrency(account.currency)
            return (
              <li key={account.id} className="flex items-center gap-3 px-6 py-3.5">
                <span
                  aria-hidden
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold',
                    isCrypto ? 'bg-accent/15 text-accent' : 'bg-brand-soft text-brand-strong',
                  )}
                >
                  {account.symbol}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {t(`accounts.${account.id}`)}
                  </span>
                  <span className="block text-xs text-fg-subtle">{account.currency}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-medium tabular-nums">
                    {formatMoney(account.balance, account.currency, language)}
                  </span>
                  <span
                    className={cn(
                      'block text-xs tabular-nums',
                      account.change >= 0 ? 'text-success' : 'text-danger',
                    )}
                  >
                    {formatPercent(account.change, language)}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </figure>
  )
}
