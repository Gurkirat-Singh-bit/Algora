'use client'

import { CodeHighlight } from '@/components/shared/CodeHighlight'
import { StepLog } from '@/components/shared/StepLog'
import type { Step } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  canvasLabel: string
  canvasMeta?: string
  pseudoCode: string[]
  steps: Step[]
  currentStep: number
  currentLine?: number
  currentDescription?: string
  fallbackMessage?: string
  onJump: (i: number) => void
  children: React.ReactNode
  rightExtra?: React.ReactNode
  canvasFooter?: React.ReactNode
  canvasClassName?: string
}

export function VizShell({
  canvasLabel,
  canvasMeta,
  pseudoCode,
  steps,
  currentStep,
  currentLine,
  currentDescription,
  fallbackMessage,
  onJump,
  children,
  rightExtra,
  canvasFooter,
  canvasClassName,
}: Props) {
  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-h-[22rem] flex-col border-b border-dsa-border lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-dsa-border px-5 py-2.5">
          <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
            {canvasLabel}
          </span>
          <span className="truncate font-mono text-[11px] text-dsa-muted">
            {currentDescription ?? canvasMeta ?? fallbackMessage}
          </span>
        </div>
        <div className={cn('relative flex-1 overflow-hidden', canvasClassName)}>{children}</div>
        {canvasFooter && (
          <div className="border-t border-dsa-border px-5 py-2 text-[11px] text-dsa-muted">{canvasFooter}</div>
        )}
      </div>

      <div className="flex flex-col">
        {rightExtra && <div className="border-b border-dsa-border p-4 pb-3">{rightExtra}</div>}
        <div className="border-b border-dsa-border p-4">
          <CodeHighlight lines={pseudoCode} highlightLine={currentLine} />
        </div>
        <div className="flex-1 p-4 pt-3">
          <StepLog steps={steps} currentStep={currentStep} onJump={onJump} />
        </div>
      </div>
    </div>
  )
}
