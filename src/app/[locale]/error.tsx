'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Link } from '@/i18n/navigation'

interface ErrorPageProps {
  error: Error & { digest?: string }
  retry: () => void
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const t = useTranslations()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div role="alert" className="max-w-md text-center">
        <AlertTriangle className="mx-auto size-10 text-warning" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold">{t('errors.title')}</h1>
        <p className="mt-2 text-sm text-fg-muted">{t('errors.generic')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={retry}>{t('errors.retry')}</Button>
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            {t('common.goHome')}
          </Link>
        </div>
      </div>
    </main>
  )
}
