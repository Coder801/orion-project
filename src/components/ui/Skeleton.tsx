import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

/** Decorative placeholder; mark the loading region itself with aria-busy. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-md bg-surface-overlay',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-fg/5 before:to-transparent motion-reduce:before:hidden',
        className,
      )}
      {...props}
    />
  )
}
