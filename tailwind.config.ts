import type { Config } from 'tailwindcss'

// Colors are CSS variables (RGB channels) so the theme can switch at runtime
// via the `.light` class on <html> without rebuilding utilities.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: token('brand'),
          strong: token('brand-strong'),
          soft: token('brand-soft'),
          fg: token('brand-fg'),
        },
        accent: token('accent'),
        surface: {
          DEFAULT: token('surface'),
          raised: token('surface-raised'),
          overlay: token('surface-overlay'),
          sunken: token('surface-sunken'),
        },
        border: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
        },
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
          subtle: token('fg-subtle'),
        },
        success: token('success'),
        warning: token('warning'),
        danger: {
          DEFAULT: token('danger'),
          fg: token('danger-fg'),
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 8px 24px -12px rgb(0 0 0 / 0.5)',
        overlay: '0 24px 64px -16px rgb(0 0 0 / 0.6)',
        glow: '0 0 0 1px rgb(var(--brand) / 0.35), 0 8px 32px -8px rgb(var(--brand) / 0.45)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
