'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectTheme } from '@/store/uiSlice'

/** Keeps the <html> theme class in sync after the server-rendered first paint. */
export function ThemeSync() {
  const theme = useAppSelector(selectTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
  }, [theme])

  return null
}
