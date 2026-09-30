import { useTranslations } from 'next-intl'
import { CenteredMessage } from '@/components/layout/CenteredMessage'

export default function LoginPage() {
  const t = useTranslations()

  return (
    <CenteredMessage
      title={t('pages.login.title')}
      text={t('pages.login.placeholder')}
      linkHref="/app"
      linkLabel={t('common.goToApp')}
    />
  )
}
