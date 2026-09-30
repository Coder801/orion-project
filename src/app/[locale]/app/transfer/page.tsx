import { useTranslations } from 'next-intl'
import { PageHeader } from '@/components/layout/PageHeader'

export default function TransferPage() {
  const t = useTranslations()

  return (
    <>
      <PageHeader title={t('pages.transfer.title')} description={t('pages.transfer.description')} />
      <p className="text-sm text-fg-subtle">{t('common.comingSoon', { step: 7 })}</p>
    </>
  )
}
