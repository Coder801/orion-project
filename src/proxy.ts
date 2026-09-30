import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

// Redirects locale-less URLs to /ru or /en (cookie → Accept-Language → default).
export default createMiddleware(routing)

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
