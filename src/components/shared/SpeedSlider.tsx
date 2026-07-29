'use client'
import { cn } from '@/lib/utils'

interface Props {
  speed: number
  onSpeedChange: (speed: number) => void
}

const SPEED_OPTIONS = [1, 2, 3, 4, 5]

export function SpeedSlider({ speed, onSpeedChange }: Props) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
        Speed
      </span>
      <div className="inline-flex items-center rounded-md border border-dsa-border bg-dsa-card p-0.5">
        {SPEED_OPTIONS.map(value => {
          const active = speed === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSpeedChange(value)}
              className={cn(
                'h-11 min-w-10 rounded-sm px-1.5 font-mono text-[11px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dsa-primary-container/40 md:h-6 md:min-w-7',
                active
                  ? 'bg-dsa-primary-container text-[oklch(0.16_0.020_150)]'
                  : 'text-dsa-muted hover:text-dsa-text'
              )}
            >
              {value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
