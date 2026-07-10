import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function encodeShare<T>(payload: T): string {
  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeShare<T>(encoded: string): T | null {
  try {
    const raw = decompressFromEncodedURIComponent(encoded)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function buildShareUrl(key: string, payload: unknown): string {
  if (typeof window === 'undefined') return ''
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#${key}=${encodeShare(payload)}`
}

export function readShareFromHash<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return null
  const parts = hash.split('&').map(p => p.split('='))
  for (const [k, v] of parts) {
    if (k === key && v) return decodeShare<T>(v)
  }
  return null
}
