'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ColorScheme = 'dark' | 'light' | 'system'

interface UIState {
  colorScheme: ColorScheme
  defaultSpeed: number
  sidebarCollapsed: boolean
  reduceMotion: boolean
  setColorScheme: (scheme: ColorScheme) => void
  setDefaultSpeed: (speed: number) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setReduceMotion: (reduce: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      colorScheme: 'dark',
      defaultSpeed: 3,
      sidebarCollapsed: false,
      reduceMotion: false,
      setColorScheme: scheme => set({ colorScheme: scheme }),
      setDefaultSpeed: speed => set({ defaultSpeed: speed }),
      setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),
      setReduceMotion: reduce => set({ reduceMotion: reduce }),
    }),
    {
      name: 'dsa-ui',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
