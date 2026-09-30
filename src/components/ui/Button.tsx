import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import {
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/button-variants'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  /** Shows a spinner and blocks clicks; the label stays for screen readers. */
  isLoading?: boolean
}

export function Button({
  variant,
  size,
  fullWidth,
  isLoading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonVariants({ variant, size, fullWidth, className })}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
