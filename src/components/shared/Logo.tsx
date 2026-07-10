'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Algora mark — a rounded caret "A" in the brand green gradient.
 * The gradient id is generated per instance with useId so multiple copies
 * never collide (a shared id defined inside a display:none subtree — e.g. the
 * md:hidden mobile header — would leave every other reference unpainted).
 * The gradient is fixed green by design; it stays on-brand in light and dark.
 */
export function Logo({ className }: { className?: string }) {
  const gradientId = useId()
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn('h-6 w-6 shrink-0', className)}
      role="img"
      aria-label="Algora"
    >
      <defs>
        <linearGradient id={gradientId} x1="0.2" y1="0.05" x2="0.8" y2="1">
          <stop offset="0" stopColor="#AEE372" />
          <stop offset="0.5" stopColor="#8FD357" />
          <stop offset="1" stopColor="#67B238" />
        </linearGradient>
      </defs>
      <path
        d="M168 356 Q 232 244 256 170 Q 280 244 344 356"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="84"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
