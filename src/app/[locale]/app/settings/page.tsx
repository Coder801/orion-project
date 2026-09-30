import { useTranslations } from 'next-intl'
import { PageHeader } from '@/components/layout/PageHeader'

export default function SettingsPage() {
  const t = useTranslations()

  return (
    <>
      <PageHeader title={t('pages.settings.title')} description={t('pages.settings.description')} />
      <p className="text-sm text-fg-subtle">{t('common.comingSoon', { step: 7 })}</p>
    </>
  )
}
