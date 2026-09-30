import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface FieldOwnProps {
  label?: string
  hint?: string
  error?: string
}

interface FieldProps extends FieldOwnProps {
  id: string
  className?: string
  children: ReactNode
}

export function getFieldAria(id: string, { hint, error }: FieldOwnProps) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ')
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  } as const
}

/** Label + control + hint/error wiring shared by Input and Select. */
export function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-fg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export const controlClassName =
  'h-10 w-full rounded-md border border-border-strong bg-surface-sunken px-3 text-sm text-fg transition-colors placeholder:text-fg-subtle hover:border-fg-subtle focus-visible:border-brand focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger'
