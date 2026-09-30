import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

interface LogoProps {
  href?: string
  className?: string
  /** Hide the wordmark below the `sm` breakpoint, keeping only the mark. */
  compact?: boolean
}

export function Logo({ href = '/', className, compact = false }: LogoProps) {
  const t = useTranslations('layout')

  return (
    <Link
      href={href}
      aria-label={t('logoLabel')}
      className={cn('inline-flex items-center gap-2.5 rounded-md', className)}
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-brand" />
        <circle cx="9.5" cy="20" r="2.5" className="fill-brand-fg" />
        <circle cx="16" cy="16" r="2.5" className="fill-brand-fg" />
        <circle cx="22.5" cy="12" r="2.5" className="fill-brand-fg" />
      </svg>
      <span className={cn('text-lg font-semibold tracking-tight', compact && 'hidden sm:inline')}>
        Orion
      </span>
    </Link>
  )
}
