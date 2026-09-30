import { ChevronDown } from 'lucide-react'
import { useId, type ComponentProps } from 'react'
import { controlClassName, Field, getFieldAria, type FieldOwnProps } from '@/components/ui/Field'
import { cn } from '@/lib/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends ComponentProps<'select'>, FieldOwnProps {
  options: SelectOption[]
  placeholder?: string
  containerClassName?: string
}

export function Select({
  id: idProp,
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  containerClassName,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  return (
    <Field id={id} label={label} hint={hint} error={error} className={containerClassName}>
      <div className="relative">
        <select
          id={id}
          className={cn(controlClassName, 'cursor-pointer appearance-none pr-9', className)}
          {...getFieldAria(id, { hint, error })}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
          aria-hidden
        />
      </div>
    </Field>
  )
}
