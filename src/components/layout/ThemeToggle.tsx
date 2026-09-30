'use client'

import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectTheme, themeToggled } from '@/store/uiSlice'

export function ThemeToggle() {
  const t = useTranslations('layout')
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => dispatch(themeToggled())}
      aria-label={isDark ? t('switchToLight') : t('switchToDark')}
    >
      {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  )
}
