import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function getNodeColor(state: string): string {
  const colors: Record<string, string> = {
    default: '#222222',
    active: '#8cbf62',
    comparing: '#6f7f91',
    found: '#84a76c',
    deleting: '#a36a6a',
    inserting: '#8573a0',
  }
  return colors[state] ?? colors.default
}

export function speedToMs(speed: number): number {
  const map: Record<number, number> = { 1: 2000, 2: 1200, 3: 700, 4: 300, 5: 100 }
  return map[speed] ?? 700
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}
