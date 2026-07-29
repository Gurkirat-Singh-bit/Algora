'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/useUIStore'

function resolveScheme(scheme: 'dark' | 'light' | 'system'): 'dark' | 'light' {
  if (scheme !== 'system') return scheme
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useUIStore(s => s.colorScheme)

  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true'
  }, [])

  useEffect(() => {
    const apply = () => {
      const resolved = resolveScheme(colorScheme)
      document.documentElement.setAttribute('data-color-scheme', resolved)
    }
    apply()

    if (colorScheme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [colorScheme])

  return <>{children}</>
}
