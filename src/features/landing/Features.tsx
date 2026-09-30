import { useTranslations } from 'next-intl'
import { FEATURES } from '@/features/landing/content'
import { SectionHeading } from '@/features/landing/SectionHeading'

export function Features() {
  const t = useTranslations('landing.features')

  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-16 border-t border-border/60 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="features-title" title={t('title')} subtitle={t('subtitle')} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ id, icon: Icon }) => (
            <li
              key={id}
              className="rounded-xl border border-border bg-surface-raised p-6 shadow-card transition-colors hover:border-border-strong"
            >
              <span className="grid size-11 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 font-semibold">{t(`items.${id}.title`)}</h3>
              <p className="mt-2 text-sm text-fg-muted">{t(`items.${id}.text`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
