'use client'

import { Moon, Sun, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore, type ColorScheme } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

const order: ColorScheme[] = ['dark', 'light', 'system']
const labels: Record<ColorScheme, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const colorScheme = useUIStore(s => s.colorScheme)
  const setColorScheme = useUIStore(s => s.setColorScheme)

  const next = () => {
    const idx = order.indexOf(colorScheme)
    setColorScheme(order[(idx + 1) % order.length])
  }

  const Icon = colorScheme === 'dark' ? Moon : colorScheme === 'light' ? Sun : Laptop

  return (
    <Button
      variant="ghost"
      size={compact ? 'icon' : 'sm'}
      onClick={next}
      aria-label={`Theme: ${labels[colorScheme]}. Click to cycle.`}
      title={`Theme: ${labels[colorScheme]}`}
      className={cn('text-dsa-muted hover:text-dsa-text', compact ? 'h-8 w-8' : 'h-8 gap-2 px-2')}
    >
      <Icon className="h-4 w-4" strokeWidth={1.7} />
      {!compact && <span className="text-xs uppercase tracking-[0.14em]">{labels[colorScheme]}</span>}
    </Button>
  )
}
