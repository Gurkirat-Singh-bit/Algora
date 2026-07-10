'use client'

import { StepController } from '@/components/shared/StepController'

interface Props {
  isPlaying: boolean
  isComplete: boolean
  hasSteps: boolean
  speed: number
  currentStep: number
  totalSteps: number
  status?: string
  onPlay: () => void
  onPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onReset: () => void
  onSpeedChange: (v: number) => void
}

export function VizControlsBar({
  isPlaying,
  isComplete,
  hasSteps,
  speed,
  currentStep,
  totalSteps,
  status,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dsa-border surface-floor px-4 py-2.5">
      <StepController
        isPlaying={isPlaying}
        isComplete={isComplete}
        hasSteps={hasSteps}
        speed={speed}
        onPlay={onPlay}
        onPause={onPause}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        onReset={onReset}
        onSpeedChange={onSpeedChange}
      />
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tabular-nums text-dsa-muted-soft">
          {totalSteps === 0 ? '0' : currentStep + 1} / {totalSteps}
        </span>
        {status && <span className="hidden text-[11px] text-dsa-muted md:inline">{status}</span>}
      </div>
    </div>
  )
}
