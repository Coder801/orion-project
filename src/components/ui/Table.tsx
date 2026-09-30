import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

interface TableProps extends ComponentProps<'table'> {
  containerClassName?: string
}

export function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div
      className={cn('w-full overflow-x-auto rounded-lg border border-border', containerClassName)}
    >
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      className={cn(
        'border-b border-border bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-fg-subtle',
        className,
      )}
      {...props}
    />
  )
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-surface-overlay/50',
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({ className, scope = 'col', ...props }: ComponentProps<'th'>) {
  return (
    <th
      scope={scope}
      className={cn('h-10 whitespace-nowrap px-4 font-medium', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />
}

export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return <caption className={cn('py-3 text-xs text-fg-subtle', className)} {...props} />
}
