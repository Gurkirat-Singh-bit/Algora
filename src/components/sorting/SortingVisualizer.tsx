'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

import { ControlPanel } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { runSortingOperation, type SortingMethod, type SortingRun } from '@/lib/algorithms/sorting-ops'
import type { NodeData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  mode: SortingMethod
}

const DEFAULT_ARRAY = [44, 12, 67, 5, 33, 78, 19, 26]

function parseArrayInput(raw: string | undefined, fallback: number[]): number[] {
  const value = (raw ?? '').trim()
  if (!value) return [...fallback]
  const tokens = value.split(',').map(t => t.trim()).filter(Boolean)
  if (tokens.length === 0) throw new Error('Provide at least one numeric value.')
  const numbers = tokens.map(Number)
  if (numbers.some(Number.isNaN)) throw new Error('Array input must contain comma-separated numbers.')
  return numbers
}

function randomArray(length = 8): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 90) + 10)
}

function trackIds(initial: number[], snapshot: number[]): number[] {
  const used = new Array(initial.length).fill(false)
  const ids: number[] = []
  for (const value of snapshot) {
    let foundIdx = -1
    for (let i = 0; i < initial.length; i += 1) {
      if (!used[i] && initial[i] === value) {
        foundIdx = i
        break
      }
    }
    if (foundIdx === -1) foundIdx = ids.length
    used[foundIdx] = true
    ids.push(foundIdx)
  }
  return ids
}

function colorFor(state: NodeData['state']): string {
  switch (state) {
    case 'comparing': return 'var(--dsa-compare)'
    case 'found': return 'var(--dsa-found)'
    case 'inserting': return 'var(--dsa-insert)'
    case 'active': return 'var(--dsa-active)'
    default: return 'var(--dsa-elevated)'
  }
}

export function SortingVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [array, setArray] = useState<number[]>(DEFAULT_ARRAY)
  const [runData, setRunData] = useState<SortingRun>(() => runSortingOperation(mode, DEFAULT_ARRAY))
  const [status, setStatus] = useState('Provide array, run sort.')

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

  const displayedArray = useMemo(() => {
    if (runData.snapshots.length === 0) return array
    const index = runner.currentStep <= 0 ? 0 : Math.min(runner.currentStep, runData.snapshots.length - 1)
    return runData.snapshots[index] ?? array
  }, [array, runData.snapshots, runner.currentStep])

  const ids = useMemo(() => trackIds(array, displayedArray), [array, displayedArray])
  const maxValue = useMemo(() => Math.max(1, ...displayedArray), [displayedArray])

  const getNodeState = (index: number): NodeData['state'] => {
    const current = runner.currentStepData
    if (!current || !current.indices.includes(index)) return 'default'
    if (current.action === 'swap') return 'comparing'
    if (current.action === 'found') return 'found'
    if (current.action === 'insert') return 'inserting'
    return 'active'
  }

  const handleRun = (values: Record<string, string>) => {
    try {
      const parsed = parseArrayInput(values.array, array)
      const run = runSortingOperation(mode, parsed)
      setArray(parsed)
      setRunData(run)
      runner.setSteps(run.steps)
      setStatus(`${run.title} · ${run.steps.length} step${run.steps.length === 1 ? '' : 's'}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid array input.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
    }
  }

  const handleRandomize = () => {
    const next = randomArray()
    const run = runSortingOperation(mode, next)
    setArray(next)
    setRunData(run)
    runner.setSteps(run.steps)
    setStatus(`Randomized ${next.length}-element array.`)
  }

  const controls = (
    <div className="space-y-3">
      <ControlPanel
        fields={[{ name: 'array', label: 'Array', placeholder: '44, 12, 67, 5, 33, 78, 19, 26' }]}
        actions={[
          { label: 'Run sort', onClick: handleRun },
          { label: 'Randomize', onClick: handleRandomize, variant: 'outline' },
        ]}
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
      title={runData.title}
      description={runData.description}
      complexityData={runData.complexity}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Snapshot · n=${displayedArray.length}`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={runData.pseudoCode}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
        canvasFooter={
          <span className="font-mono">[{displayedArray.join(', ')}]</span>
        }
      >
        <div className="flex h-full items-end justify-center overflow-x-auto px-6 pb-6 pt-10 md:px-10">
          <LayoutGroup>
            <div className="flex min-h-[18rem] items-end gap-2.5">
              <AnimatePresence>
                {displayedArray.map((value, index) => {
                  const state = getNodeState(index)
                  const heightPx = Math.max(28, Math.floor((value / maxValue) * 240))
                  const id = ids[index]
                  return (
                    <motion.div
                      layout
                      layoutId={`bar-${id}`}
                      key={`bar-${id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }}
                      className="flex w-12 flex-col items-center gap-2"
                    >
                      <span className="font-mono text-[11px] tabular-nums text-dsa-muted">{value}</span>
                      <motion.div
                        layout
                        animate={{
                          height: heightPx,
                          backgroundColor: colorFor(state),
                        }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          'w-full rounded-sm border',
                          state === 'default' ? 'border-dsa-border-strong' : 'border-transparent'
                        )}
                      />
                      <span className="font-mono text-[10px] tabular-nums text-dsa-muted-soft">{index}</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </div>
      </VizShell>
    </VisualizerLayout>
  )
}
