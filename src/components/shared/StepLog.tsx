'use client'
import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Step } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  steps: Step[]
  currentStep: number
  onJump?: (index: number) => void
}

export function StepLog({ steps, currentStep, onJump }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [currentStep])

  if (steps.length === 0) {
    return (
      <div className="rounded-md border border-dsa-border surface-floor px-3 py-6 text-center">
        <p className="font-mono text-[11px] text-dsa-muted-soft">No steps yet</p>
        <p className="mt-1 text-xs text-dsa-muted">Run an operation to generate the trace.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-dsa-border surface-floor">
      <div className="flex items-center justify-between border-b border-dsa-border px-3 py-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
          Step Log
        </span>
        <span className="font-mono text-[10px] tabular-nums text-dsa-muted-soft">
          {currentStep + 1} / {steps.length}
        </span>
      </div>
      <ScrollArea className="h-56">
        <ol className="divide-y divide-dsa-border">
          {steps.map((step, i) => {
            const isCurrent = i === currentStep
            const isPast = i < currentStep
            return (
              <li key={i}>
                <button
                  ref={isCurrent ? activeRef : undefined}
                  type="button"
                  onClick={() => onJump?.(i)}
                  className={cn(
                    'flex w-full items-start gap-3 px-3 py-2 text-left text-xs transition-colors',
                    'hover:bg-dsa-card cursor-pointer',
                    isCurrent && 'bg-dsa-primary-container/12'
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 font-mono tabular-nums tracking-tight',
                      'w-6 text-right',
                      isCurrent ? 'text-dsa-primary-container' : 'text-dsa-muted-soft'
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'flex-1 leading-5',
                      isCurrent ? 'text-dsa-text-strong' : isPast ? 'text-dsa-muted' : 'text-dsa-text/55'
                    )}
                  >
                    {step.description}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </ScrollArea>
    </div>
  )
}
