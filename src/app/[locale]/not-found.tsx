import { useTranslations } from 'next-intl'
import { CenteredMessage } from '@/components/layout/CenteredMessage'

export default function NotFound() {
  const t = useTranslations()

  return (
    <CenteredMessage
      title={t('errors.notFoundTitle')}
      text={t('errors.notFoundText')}
      linkHref="/"
      linkLabel={t('common.goHome')}
    />
  )
}
