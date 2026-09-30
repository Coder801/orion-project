import { useTranslations } from 'next-intl'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

interface PageLoaderProps {
  fullscreen?: boolean
}

export function PageLoader({ fullscreen = false }: PageLoaderProps) {
  const t = useTranslations('common')

  return (
    <div className={cn('grid place-items-center py-24', fullscreen && 'min-h-screen')}>
      <Spinner className="size-6" label={t('loading')} />
    </div>
  )
}
