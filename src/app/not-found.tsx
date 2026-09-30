import Link from 'next/link'
import './globals.css'

// Only reached for URLs the proxy does not localize (e.g. unknown files).
export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark">
      <body className="grid min-h-screen place-items-center p-6 text-center">
        <main>
          <h1 className="text-2xl font-semibold">404</h1>
          <p className="mt-2 text-sm text-fg-muted">Page not found</p>
          <Link href="/" className="mt-6 inline-block text-sm text-brand-strong underline">
            Orion Bank
          </Link>
        </main>
      </body>
    </html>
  )
}
