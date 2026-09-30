import { useTranslations } from 'next-intl'
import { PageHeader } from '@/components/layout/PageHeader'

export default function TransactionsPage() {
  const t = useTranslations()

  return (
    <>
      <PageHeader
        title={t('pages.transactions.title')}
        description={t('pages.transactions.description')}
      />
      <p className="text-sm text-fg-subtle">{t('common.comingSoon', { step: 7 })}</p>
    </>
  )
}
