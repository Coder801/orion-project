import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      )}
      <h2 id={id} className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-pretty text-lg text-fg-muted">{subtitle}</p>}
    </div>
  )
}
