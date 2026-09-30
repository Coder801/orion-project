import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SpinnerProps {
  className?: string
  /** When set, the spinner is announced as a live status region. */
  label?: string
}

export function Spinner({ className, label }: SpinnerProps) {
  const icon = <Loader2 className={cn('size-5 animate-spin text-brand', className)} aria-hidden />
  if (!label) return icon

  return (
    <span role="status" className="inline-flex">
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  )
}
