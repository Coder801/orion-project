import { useId, type ComponentProps, type ReactNode } from 'react'
import { controlClassName, Field, getFieldAria, type FieldOwnProps } from '@/components/ui/Field'
import { cn } from '@/lib/cn'

export interface InputProps extends ComponentProps<'input'>, FieldOwnProps {
  /** Decorative content inside the field, e.g. an icon or currency sign. */
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  containerClassName?: string
}

export function Input({
  id: idProp,
  label,
  hint,
  error,
  startAdornment,
  endAdornment,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  return (
    <Field id={id} label={label} hint={hint} error={error} className={containerClassName}>
      <div className="relative">
        {startAdornment && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-subtle [&_svg]:size-4">
            {startAdornment}
          </span>
        )}
        <input
          id={id}
          className={cn(
            controlClassName,
            startAdornment && 'pl-9',
            endAdornment && 'pr-12',
            className,
          )}
          {...getFieldAria(id, { hint, error })}
          {...props}
        />
        {endAdornment && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-fg-subtle">
            {endAdornment}
          </span>
        )}
      </div>
    </Field>
  )
}
