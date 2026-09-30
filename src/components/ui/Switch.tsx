import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export interface SwitchProps extends Omit<ComponentProps<'button'>, 'onChange' | 'role'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  description?: string
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  className,
  disabled,
  ...props
}: SwitchProps) {
  const id = useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-border-strong',
        !label && className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'size-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )

  if (!label) return control

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <span id={labelId} className="block text-sm font-medium">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="mt-0.5 block text-xs text-fg-subtle">
            {description}
          </span>
        )}
      </div>
      {control}
    </div>
  )
}
