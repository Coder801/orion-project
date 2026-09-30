import { Logo } from '@/components/layout/Logo'
import { buttonVariants } from '@/components/ui/button-variants'
import { Link } from '@/i18n/navigation'

interface CenteredMessageProps {
  title: string
  text: string
  linkHref: string
  linkLabel: string
}

/** Full-screen message with a single call to action (404, temporary placeholders). */
export function CenteredMessage({ title, text, linkHref, linkLabel }: CenteredMessageProps) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-fg-muted">{text}</p>
        <Link href={linkHref} className={buttonVariants({ className: 'mt-6' })}>
          {linkLabel}
        </Link>
      </div>
    </main>
  )
}
