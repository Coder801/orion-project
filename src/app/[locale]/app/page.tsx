import { useTranslations } from 'next-intl'
import { PageHeader } from '@/components/layout/PageHeader'

export default function DashboardPage() {
  const t = useTranslations()

  return (
    <>
      <PageHeader
        title={t('pages.dashboard.title')}
        description={t('pages.dashboard.description')}
      />
      <p className="text-sm text-fg-subtle">{t('common.comingSoon', { step: 6 })}</p>
    </>
  )
}
