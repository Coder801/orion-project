import { cn } from '@/lib/cn'

// Kept apart from Button so server components can style a <Link> as a button.
const variants = {
  primary: 'bg-brand text-brand-fg shadow-sm hover:bg-brand/90',
  secondary: 'bg-surface-overlay text-fg hover:bg-border',
  outline: 'border border-border-strong text-fg hover:bg-surface-overlay',
  ghost: 'text-fg-muted hover:bg-surface-overlay hover:text-fg',
  danger: 'bg-danger text-danger-fg shadow-sm hover:bg-danger/90',
} as const

const sizes = {
  sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
  md: 'h-10 px-4 text-sm [&_svg]:size-4',
  lg: 'h-12 px-6 text-base [&_svg]:size-5',
  icon: 'size-10 [&_svg]:size-5',
  'icon-sm': 'size-8 [&_svg]:size-4',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

interface ButtonVariantsOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonVariantsOptions = {}): string {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )
}
