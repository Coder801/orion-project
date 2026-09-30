import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title, description, onRetry, className }: ErrorStateProps) {
  const t = useTranslations('errors')

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger/5 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-danger/15 text-danger">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title ?? t('title')}</h3>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{description ?? t('generic')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5">
          <RotateCcw aria-hidden />
          {t('retry')}
        </Button>
      )}
    </div>
  )
}
