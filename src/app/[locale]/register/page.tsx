import { useTranslations } from 'next-intl'
import { CenteredMessage } from '@/components/layout/CenteredMessage'

export default function RegisterPage() {
  const t = useTranslations()

  return (
    <CenteredMessage
      title={t('pages.register.title')}
      text={t('pages.register.placeholder')}
      linkHref="/app"
      linkLabel={t('common.goToApp')}
    />
  )
}
