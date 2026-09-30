'use client'

import { ArrowDownToLine, ArrowUpFromLine, Mail, Plus, Search, Send, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Select,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type BadgeVariant,
} from '@/components/ui'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { formatDate, formatFiat, formatMoney, formatPercent } from '@/lib/format'
import type { Currency } from '@/types'

type RowKey = 'coffee' | 'salary' | 'btc' | 'refund'
type StatusKey = Extract<BadgeVariant, 'success' | 'warning' | 'danger'>
type StateDemo = 'skeleton' | 'empty' | 'error'

interface DemoRow {
  id: string
  date: string
  key: RowKey
  status: StatusKey
  amount: number
  currency: Currency
}

const DEMO_ROWS: DemoRow[] = [
  {
    id: 'tx-1',
    date: '2026-09-28T09:12:00Z',
    key: 'coffee',
    status: 'success',
    amount: -4.5,
    currency: 'EUR',
  },
  {
    id: 'tx-2',
    date: '2026-09-25T08:00:00Z',
    key: 'salary',
    status: 'success',
    amount: 4200,
    currency: 'EUR',
  },
  {
    id: 'tx-3',
    date: '2026-09-24T16:40:00Z',
    key: 'btc',
    status: 'warning',
    amount: 0.0125,
    currency: 'BTC',
  },
  {
    id: 'tx-4',
    date: '2026-09-20T11:05:00Z',
    key: 'refund',
    status: 'danger',
    amount: 19.99,
    currency: 'EUR',
  },
]

const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'BTC', 'ETH'].map((code) => ({
  value: code,
  label: code,
}))

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

export function UiKitShowcase() {
  const t = useTranslations('uiKit')
  const tCommon = useTranslations('common')
  const language = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [twoFactor, setTwoFactor] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [stateDemo, setStateDemo] = useState<StateDemo>('skeleton')

  return (
    <div className="space-y-12">
      <Section title={t('sections.buttons')}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t('buttons.primary')}</Button>
          <Button variant="secondary">{t('buttons.secondary')}</Button>
          <Button variant="outline">{t('buttons.outline')}</Button>
          <Button variant="ghost">{t('buttons.ghost')}</Button>
          <Button variant="danger">
            <Trash2 aria-hidden />
            {t('buttons.danger')}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">{t('buttons.small')}</Button>
          <Button size="lg">
            <Send aria-hidden />
            {t('buttons.withIcon')}
          </Button>
          <Button isLoading>{t('buttons.loading')}</Button>
          <Button disabled>{t('buttons.disabled')}</Button>
          <Button variant="outline" size="icon" aria-label={t('buttons.iconLabel')}>
            <Plus aria-hidden />
          </Button>
          <Link href="/app" className={buttonVariants({ variant: 'outline' })}>
            {t('buttons.asLink')}
          </Link>
        </div>
      </Section>

      <Section title={t('sections.badges')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{t('badges.neutral')}</Badge>
          <Badge variant="brand">{t('badges.brand')}</Badge>
          <Badge variant="success" dot>
            {t('badges.success')}
          </Badge>
          <Badge variant="warning" dot>
            {t('badges.warning')}
          </Badge>
          <Badge variant="danger" dot>
            {t('badges.danger')}
          </Badge>
        </div>
      </Section>

      <Section title={t('sections.forms')}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            type="email"
            label={t('forms.emailLabel')}
            placeholder={t('forms.emailPlaceholder')}
            hint={t('forms.emailHint')}
            startAdornment={<Mail />}
            autoComplete="email"
          />
          <Input
            type="search"
            label={t('forms.searchLabel')}
            placeholder={t('forms.searchPlaceholder')}
            startAdornment={<Search />}
          />
          <Input
            inputMode="decimal"
            label={t('forms.amountLabel')}
            defaultValue="12500"
            error={t('forms.amountError')}
            endAdornment="EUR"
          />
          <Select
            label={t('forms.currencyLabel')}
            placeholder={t('forms.currencyPlaceholder')}
            options={CURRENCY_OPTIONS}
            defaultValue=""
          />
          <Input
            label={t('forms.disabledLabel')}
            value="DE89 3704 0044 0532 0130 00"
            disabled
            readOnly
          />
        </div>
      </Section>

      <Section title={t('sections.switches')}>
        <Card className="max-w-lg">
          <CardContent className="space-y-5">
            <Switch
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
              label={t('switches.twoFactor')}
              description={t('switches.twoFactorHint')}
            />
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              label={t('switches.notifications')}
            />
          </CardContent>
        </Card>
      </Section>

      <Section title={t('sections.cards')}>
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle as="h3">{t('cards.balanceTitle')}</CardTitle>
                <CardDescription>{t('cards.balanceDescription')}</CardDescription>
              </div>
              <Badge variant="success">
                {t('cards.change', { value: formatPercent(0.024, language) })}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {formatFiat(48250.32, 'EUR', language)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle as="h3">{t('cards.actionsTitle')}</CardTitle>
                <CardDescription>{t('cards.actionsDescription')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent />
            <CardFooter>
              <Button size="sm">
                <ArrowDownToLine aria-hidden />
                {t('cards.topUp')}
              </Button>
              <Button size="sm" variant="outline">
                <ArrowUpFromLine aria-hidden />
                {t('cards.withdraw')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section title={t('sections.table')}>
        <Table>
          <TableCaption>{t('table.caption')}</TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('table.date')}</TableHead>
              <TableHead>{t('table.description')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-right">{t('table.amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEMO_ROWS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-fg-muted">
                  {formatDate(row.date, language)}
                </TableCell>
                <TableCell className="font-medium">{t(`table.rows.${row.key}`)}</TableCell>
                <TableCell>
                  <Badge variant={row.status} dot>
                    {t(`badges.${row.status}`)}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    'whitespace-nowrap text-right font-medium tabular-nums',
                    row.amount > 0 && 'text-success',
                  )}
                >
                  {formatMoney(row.amount, row.currency, language, { signDisplay: 'always' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section title={t('sections.modal')}>
        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
          {t('modal.open')}
        </Button>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t('modal.title')}
          description={t('modal.description')}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>{tCommon('confirm')}</Button>
            </>
          }
        >
          <dl className="space-y-3 text-sm">
            {[
              [t('modal.recipientLabel'), t('modal.recipient')],
              [t('modal.amountLabel'), formatFiat(250, 'EUR', language)],
              [t('modal.feeLabel'), formatFiat(1.25, 'EUR', language)],
            ].map(([term, value]) => (
              <div key={term} className="flex justify-between gap-4">
                <dt className="text-fg-muted">{term}</dt>
                <dd className="font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      </Section>

      <Section title={t('sections.states')}>
        <div role="group" className="inline-flex rounded-md border border-border p-0.5">
          {(['skeleton', 'empty', 'error'] as const).map((demo) => (
            <button
              key={demo}
              type="button"
              aria-pressed={stateDemo === demo}
              onClick={() => setStateDemo(demo)}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                stateDemo === demo
                  ? 'bg-brand-soft text-brand-strong'
                  : 'text-fg-subtle hover:text-fg',
              )}
            >
              {t(`states.${demo}`)}
            </button>
          ))}
        </div>

        {stateDemo === 'skeleton' && (
          <Card aria-busy="true" aria-label={t('states.loadingLabel')}>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-1/5" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {stateDemo === 'empty' && (
          <EmptyState
            title={t('states.emptyTitle')}
            description={t('states.emptyDescription')}
            action={
              <Link href="/app/transfer" className={buttonVariants({ size: 'sm' })}>
                <Send aria-hidden />
                {t('states.emptyAction')}
              </Link>
            }
          />
        )}
        {stateDemo === 'error' && (
          <ErrorState
            description={t('states.errorDescription')}
            onRetry={() => setStateDemo('skeleton')}
          />
        )}
      </Section>
    </div>
  )
}
