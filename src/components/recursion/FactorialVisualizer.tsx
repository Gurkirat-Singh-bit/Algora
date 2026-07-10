'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { ControlPanel } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { factorialCallStackSteps, factorialPseudoCode } from '@/lib/algorithms/recursion-ops'
import type { ComplexityInfo } from '@/lib/types'
import { cn } from '@/lib/utils'

const COMPLEXITY: ComplexityInfo[] = [
  { operation: 'Factorial Recursion', time: 'O(n)', space: 'O(n)', note: 'Recursion depth grows linearly with n.' },
]

export function FactorialVisualizer() {
  const runner = useStepRunner()
  const [snapshots, setSnapshots] = useState<string[][]>([])
  const [result, setResult] = useState<number | null>(null)
  const [status, setStatus] = useState('Run factorial to grow and unwind the call stack.')

  useKeyboardControls({
    isPlaying: runner.isPlaying,
    hasSteps: runner.steps.length > 0,
    isComplete: runner.isComplete,
    play: runner.play,
    pause: runner.pause,
    stepForward: runner.stepForward,
    stepBackward: runner.stepBackward,
    reset: runner.reset,
    setSpeed: runner.setSpeed,
  })

  const currentStack = useMemo(() => {
    if (snapshots.length === 0) return []
    const index = runner.currentStep <= 0 ? 0 : Math.min(runner.currentStep, snapshots.length - 1)
    return snapshots[index] ?? []
  }, [runner.currentStep, snapshots])

  const handleRun = (values: Record<string, string>) => {
    const parsed = Number(values.n)
    if (!Number.isInteger(parsed)) {
      const message = 'Provide an integer n value.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
      return
    }
    const run = factorialCallStackSteps(parsed)
    setSnapshots(run.snapshots)
    setResult(run.result)
    setStatus(`Factorial call stack for n = ${Math.max(0, Math.min(10, parsed))}.`)
    runner.setSteps(run.steps)
  }

  const controls = (
    <div className="space-y-3">
      <ControlPanel
        fields={[{ name: 'n', label: 'n', type: 'number', placeholder: '5' }]}
        actions={[{ label: 'Run factorial', onClick: handleRun }]}
      />
      <VizControlsBar
        isPlaying={runner.isPlaying}
        isComplete={runner.isComplete}
        hasSteps={runner.steps.length > 0}
        speed={runner.speed}
        currentStep={runner.currentStep}
        totalSteps={runner.steps.length}
        status={status}
        onPlay={runner.play}
        onPause={runner.pause}
        onStepForward={runner.stepForward}
        onStepBackward={runner.stepBackward}
        onReset={runner.reset}
        onSpeedChange={runner.setSpeed}
      />
    </div>
  )

  return (
    <VisualizerLayout
      title="Recursion · Factorial"
      description="Frames push as recursion deepens and pop during unwind."
      complexityData={COMPLEXITY}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Call stack · depth ${currentStack.length}`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={factorialPseudoCode}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
        canvasFooter={
          result === null
            ? 'Result pending.'
            : <span>Result: <span className="font-mono text-dsa-text-strong">{result}</span></span>
        }
      >
        <div className="flex h-full items-end justify-center px-6 pb-8 pt-10">
          <div className="flex w-full max-w-md flex-col-reverse gap-1.5">
            <AnimatePresence>
              {currentStack.length === 0 ? (
                <p className="text-center text-sm text-dsa-muted">Call stack is empty.</p>
              ) : (
                currentStack.map((frame, index) => {
                  const isTop = index === currentStack.length - 1
                  return (
                    <motion.div
                      key={`${frame}-${index}`}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'flex items-center gap-3 rounded-md border px-3 py-2.5 font-mono text-[13px]',
                        isTop
                          ? 'border-transparent bg-dsa-primary-container text-[var(--on-accent)]'
                          : 'border-dsa-border-strong bg-dsa-card text-dsa-text'
                      )}
                    >
                      <span className="font-mono text-[10px] tabular-nums text-dsa-muted-soft">
                        {String(index).padStart(2, '0')}
                      </span>
                      <span className="flex-1">{frame}</span>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </VizShell>
    </VisualizerLayout>
  )
}
