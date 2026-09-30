import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FAQ_ITEMS } from '@/features/landing/content'
import { SectionHeading } from '@/features/landing/SectionHeading'

export function Faq() {
  const t = useTranslations('landing.faq')

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-16 border-t border-border/60 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading id="faq-title" title={t('title')} />
        <div className="mt-12 divide-y divide-border rounded-xl border border-border bg-surface-raised">
          {FAQ_ITEMS.map((item) => (
            <details key={item} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-5 font-medium [&::-webkit-details-marker]:hidden">
                {t(`items.${item}.question`)}
                <ChevronDown
                  className="size-5 shrink-0 text-fg-subtle transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 text-sm text-fg-muted">{t(`items.${item}.answer`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
