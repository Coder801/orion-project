import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const variants = {
  neutral: 'bg-surface-overlay text-fg-muted',
  brand: 'bg-brand-soft text-brand-strong',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
} as const

export type BadgeVariant = keyof typeof variants

export interface BadgeProps extends ComponentProps<'span'> {
  variant?: BadgeVariant
  /** Leading status dot in the badge color. */
  dot?: boolean
}

export function Badge({
  variant = 'neutral',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
