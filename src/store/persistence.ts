import { z } from 'zod'
import type { Theme, User } from '@/types'

// Theme and the mock session live in cookies so the server renders the right
// <html> class and user on first paint, and the proxy can guard /app routes.
export const THEME_COOKIE = 'orion-theme'
export const SESSION_COOKIE = 'orion-session'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const themeSchema = z.enum(['dark', 'light']) satisfies z.ZodType<Theme>

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  baseCurrency: z.enum(['USD', 'EUR', 'GBP']),
}) satisfies z.ZodType<User>

export function parseThemeCookie(value: string | undefined): Theme {
  const result = themeSchema.safeParse(value)
  return result.success ? result.data : 'dark'
}

export function parseSessionCookie(value: string | undefined): User | null {
  if (!value) return null
  for (const candidate of [value, safeDecode(value)]) {
    try {
      const result = userSchema.safeParse(JSON.parse(candidate))
      if (result.success) return result.data
    } catch {
      // Try the next candidate.
    }
  }
  return null
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function writeCookie(name: string, value: string | null): void {
  const attributes = 'path=/; SameSite=Lax'
  document.cookie =
    value === null
      ? `${name}=; ${attributes}; max-age=0`
      : `${name}=${encodeURIComponent(value)}; ${attributes}; max-age=${ONE_YEAR_SECONDS}`
}

export function saveTheme(theme: Theme): void {
  writeCookie(THEME_COOKIE, theme)
}

export function saveSession(user: User | null): void {
  writeCookie(SESSION_COOKIE, user ? JSON.stringify(user) : null)
}
