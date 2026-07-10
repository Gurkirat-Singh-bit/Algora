'use client'

import { useEffect, useMemo, useState } from 'react'
import { Moon, Paintbrush, Palette, Sun, Type } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type ThemeName = 'forest' | 'ocean' | 'amber' | 'slate'
type ColorScheme = 'dark' | 'light'

interface AppearanceState {
  theme: ThemeName
  colorScheme: ColorScheme
  fontScale: number
}

interface AppearanceSettingsProps {
  showLabel?: boolean
}

const STORAGE_KEY = 'dsa-appearance-v2'

const DEFAULT_APPEARANCE: AppearanceState = {
  theme: 'forest',
  colorScheme: 'dark',
  fontScale: 100,
}

const THEMES: Array<{ value: ThemeName; label: string; swatch: string }> = [
  { value: 'forest', label: 'Forest', swatch: 'bg-[#8cbf62]' },
  { value: 'ocean', label: 'Ocean', swatch: 'bg-[#5fa8d3]' },
  { value: 'amber', label: 'Amber', swatch: 'bg-[#d19a4a]' },
  { value: 'slate', label: 'Slate', swatch: 'bg-[#a8adb8]' },
]

const FONT_SCALES = [90, 100, 110]

function applyAppearance(next: AppearanceState): void {
  const root = document.documentElement
  root.dataset.theme = next.theme
  root.dataset.colorScheme = next.colorScheme
  root.style.setProperty('--ui-font-scale', `${next.fontScale}%`)
}

export function AppearanceSettings({ showLabel = false }: AppearanceSettingsProps) {
  const [appearance, setAppearance] = useState<AppearanceState>(DEFAULT_APPEARANCE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        applyAppearance(DEFAULT_APPEARANCE)
        setReady(true)
        return
      }

      const parsed = JSON.parse(raw) as Partial<AppearanceState>
      const next: AppearanceState = {
        theme:
          parsed.theme === 'forest' || parsed.theme === 'ocean' || parsed.theme === 'amber' || parsed.theme === 'slate'
            ? parsed.theme
            : DEFAULT_APPEARANCE.theme,
        colorScheme:
          parsed.colorScheme === 'dark' || parsed.colorScheme === 'light'
            ? parsed.colorScheme
            : DEFAULT_APPEARANCE.colorScheme,
        fontScale:
          typeof parsed.fontScale === 'number' && parsed.fontScale >= 90 && parsed.fontScale <= 115
            ? parsed.fontScale
            : DEFAULT_APPEARANCE.fontScale,
      }

      setAppearance(next)
      applyAppearance(next)
    } catch {
      applyAppearance(DEFAULT_APPEARANCE)
    } finally {
      setReady(true)
    }
  }, [])

  const save = (next: AppearanceState): void => {
    setAppearance(next)
    applyAppearance(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const themeLabel = useMemo(() => {
    return THEMES.find(theme => theme.value === appearance.theme)?.label ?? 'Forest'
  }, [appearance.theme])

  return (
    <Sheet>
      <SheetTrigger asChild>
        {showLabel ? (
          <Button variant="outline" size="sm" className="gap-2" aria-label="Open appearance settings" title="Appearance settings">
            <Palette className="h-4 w-4" strokeWidth={1.8} />
            Appearance
          </Button>
        ) : (
          <Button variant="outline" size="icon" aria-label="Open appearance settings" title="Appearance settings">
            <Palette className="h-4 w-4" strokeWidth={1.8} />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[92vw] max-w-sm border-l border-dsa-border bg-dsa-surface p-0">
        <div className="h-full overflow-y-auto px-5 pb-6 pt-5">
          <SheetHeader className="space-y-2 pb-4">
            <SheetTitle className="inline-flex items-center gap-2">
              <Paintbrush className="h-4 w-4" strokeWidth={1.8} />
              Appearance
            </SheetTitle>
            <SheetDescription>
              Customize color mode, accent theme, and typography scale.
            </SheetDescription>
          </SheetHeader>

          {!ready ? (
            <p className="text-sm text-dsa-muted">Loading settings...</p>
          ) : (
            <div className="space-y-6">
              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.14em] text-dsa-muted">Color Mode</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => save({ ...appearance, colorScheme: 'dark' })}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      appearance.colorScheme === 'dark'
                        ? 'border-dsa-primary-container bg-dsa-panel text-dsa-text'
                        : 'border-dsa-border bg-dsa-card text-dsa-muted hover:text-dsa-text'
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Moon className="h-3.5 w-3.5" />
                      Dark
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => save({ ...appearance, colorScheme: 'light' })}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      appearance.colorScheme === 'light'
                        ? 'border-dsa-primary-container bg-dsa-panel text-dsa-text'
                        : 'border-dsa-border bg-dsa-card text-dsa-muted hover:text-dsa-text'
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sun className="h-3.5 w-3.5" />
                      Light
                    </span>
                  </button>
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-xs uppercase tracking-[0.14em] text-dsa-muted">Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(theme => {
                    const active = appearance.theme === theme.value
                    return (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() => save({ ...appearance, theme: theme.value })}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                          active
                            ? 'border-dsa-primary-container bg-dsa-panel text-dsa-text'
                            : 'border-dsa-border bg-dsa-card text-dsa-muted hover:text-dsa-text'
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className={cn('inline-block h-2.5 w-2.5 rounded-full', theme.swatch)} />
                          {theme.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-dsa-muted">Current: {themeLabel}</p>
              </section>

              <section className="space-y-3">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-dsa-muted">
                  <Type className="h-3.5 w-3.5" />
                  Font Scale
                </p>
                <div className="flex gap-2">
                  {FONT_SCALES.map(scale => (
                    <Button
                      key={scale}
                      type="button"
                      variant={appearance.fontScale === scale ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => save({ ...appearance, fontScale: scale })}
                    >
                      {scale}%
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-dsa-muted">{appearance.fontScale}%</p>
              </section>

              <Button
                variant="outline"
                onClick={() => save(DEFAULT_APPEARANCE)}
                className="w-full"
              >
                Reset to Default
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
