'use client'

import { Button } from '@/components/ui/button'
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'

import { SpeedSlider } from './SpeedSlider'

interface Props {
  isPlaying: boolean
  isComplete: boolean
  hasSteps: boolean
  speed: number
  onPlay: () => void
  onPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

export function StepController({
  isPlaying,
  isComplete,
  hasSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="inline-flex items-center rounded-md border border-dsa-border bg-dsa-card">
        <button
          type="button"
          onClick={onReset}
          disabled={!hasSteps}
          aria-label="Reset"
          title="Reset (R)"
          className="flex h-8 w-8 items-center justify-center text-dsa-muted hover:text-dsa-text disabled:opacity-30 disabled:hover:text-dsa-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
        <span className="h-4 w-px bg-dsa-border" />
        <button
          type="button"
          onClick={onStepBackward}
          disabled={!hasSteps}
          aria-label="Previous step"
          title="Previous (←)"
          className="flex h-8 w-8 items-center justify-center text-dsa-muted hover:text-dsa-text disabled:opacity-30"
        >
          <SkipBack className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
        <span className="h-4 w-px bg-dsa-border" />
        <Button
          variant={isPlaying ? 'secondary' : 'default'}
          size="sm"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!hasSteps || isComplete}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          className="h-8 rounded-none px-3"
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" strokeWidth={1.8} />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" strokeWidth={1.8} />
              Play
            </>
          )}
        </Button>
        <span className="h-4 w-px bg-dsa-border" />
        <button
          type="button"
          onClick={onStepForward}
          disabled={!hasSteps || isComplete}
          aria-label="Next step"
          title="Next (→)"
          className="flex h-8 w-8 items-center justify-center text-dsa-muted hover:text-dsa-text disabled:opacity-30"
        >
          <SkipForward className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </div>

      <SpeedSlider speed={speed} onSpeedChange={onSpeedChange} />
    </div>
  )
}
