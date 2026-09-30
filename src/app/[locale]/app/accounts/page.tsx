import { useTranslations } from 'next-intl'
import { PageHeader } from '@/components/layout/PageHeader'

export default function AccountsPage() {
  const t = useTranslations()

  return (
    <>
      <PageHeader title={t('pages.accounts.title')} description={t('pages.accounts.description')} />
      <p className="text-sm text-fg-subtle">{t('common.comingSoon', { step: 7 })}</p>
    </>
  )
}
