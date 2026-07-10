'use client'

import { useMemo, useState } from 'react'

import {
  runSearchingOperation,
  searchingMethodMeta,
  type SearchingExecution,
  type SearchingMethod,
} from '@/lib/algorithms/searching-ops'
import type { NodeData, Step } from '@/lib/types'

import { ArrayCanvas, type ArrayPointer } from '@/components/shared/ArrayCanvas'
import { ControlPanel, type FieldDef } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'

interface SearchingVisualizerProps {
  mode: SearchingMethod
}

interface BinaryPointers {
  low?: number
  mid?: number
  high?: number
}

const DEFAULT_SEARCH_ARRAY = [21, 4, 13, 8, 34, 55]

function parseArrayInput(raw: string | undefined, fallback: number[]): number[] {
  const value = (raw ?? '').trim()
  if (!value) return [...fallback]
  const tokens = value.split(',').map(t => t.trim()).filter(Boolean)
  if (tokens.length === 0) throw new Error('Provide at least one number.')
  const numbers = tokens.map(Number)
  if (numbers.some(Number.isNaN)) throw new Error('Array must contain numbers only.')
  return numbers
}

function parseIntegerInput(raw: string | undefined, label: string): number {
  const value = (raw ?? '').trim()
  if (!value) throw new Error(`${label} is required.`)
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer.`)
  return parsed
}

function extractBinaryPointers(step: Step): BinaryPointers {
  if (step.action === 'compare' && step.indices.length >= 3) {
    return { low: step.indices[0], mid: step.indices[1], high: step.indices[2] }
  }
  if (step.action === 'highlight' && step.indices.length >= 2) {
    return { low: step.indices[0], high: step.indices[1] }
  }
  if (step.action === 'found' && step.indices.length >= 1) {
    return { mid: step.indices[0] }
  }
  return {}
}

function hasPointerData(p: BinaryPointers): boolean {
  return p.low !== undefined || p.mid !== undefined || p.high !== undefined
}

function resolveBinaryPointers(steps: Step[], currentStep: number): BinaryPointers {
  if (currentStep < 0 || steps.length === 0) return {}
  for (let i = currentStep; i >= 0; i -= 1) {
    const p = extractBinaryPointers(steps[i])
    if (hasPointerData(p)) return p
  }
  return {}
}

export function SearchingVisualizer({ mode }: SearchingVisualizerProps) {
  const runner = useStepRunner()
  const {
    steps,
    currentStep,
    currentStepData,
    isPlaying,
    isComplete,
    speed,
    setSteps,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    jumpToStep,
  } = runner

  useKeyboardControls({
    isPlaying,
    hasSteps: steps.length > 0,
    isComplete,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
  })

  const [displayArray, setDisplayArray] = useState<number[]>(DEFAULT_SEARCH_ARRAY)
  const [statusMessage, setStatusMessage] = useState(
    mode === 'binary'
      ? 'Run a binary search. Input will be auto-sorted if needed.'
      : 'Run a linear search through the array.'
  )
  const [runContext, setRunContext] = useState<SearchingExecution['context'] | null>(null)

  const methodMeta = searchingMethodMeta[mode]

  const fields = useMemo<FieldDef[]>(
    () => [
      { name: 'array', label: 'Array', placeholder: '21, 4, 13, 8, 34, 55' },
      { name: 'target', label: 'Target', type: 'number', placeholder: '13' },
    ],
    []
  )

  const binaryPointers = useMemo(() => {
    if (mode !== 'binary') return {}
    return resolveBinaryPointers(steps, currentStep)
  }, [mode, steps, currentStep])

  const states: NodeData['state'][] = useMemo(() => {
    return displayArray.map((_, index) => {
      if (!currentStepData) return 'default'
      if (mode === 'binary' && currentStepData.action === 'compare' && currentStepData.indices.length >= 3) {
        const [low, mid, high] = currentStepData.indices
        if (index === mid) return 'comparing'
        if (index === low || index === high) return 'active'
        return 'default'
      }
      if (!currentStepData.indices.includes(index)) return 'default'
      switch (currentStepData.action) {
        case 'compare': return 'comparing'
        case 'found': return 'found'
        case 'highlight':
        case 'info':
        default: return 'active'
      }
    })
  }, [displayArray, currentStepData, mode])

  const pointers: ArrayPointer[] = useMemo(() => {
    if (mode !== 'binary') return []
    const out: ArrayPointer[] = []
    if (binaryPointers.low !== undefined) out.push({ index: binaryPointers.low, label: 'LOW', tone: 'primary' })
    if (binaryPointers.mid !== undefined) out.push({ index: binaryPointers.mid, label: 'MID', tone: 'compare' })
    if (binaryPointers.high !== undefined) out.push({ index: binaryPointers.high, label: 'HIGH', tone: 'primary' })
    return out
  }, [binaryPointers, mode])

  const handleRun = (values: Record<string, string>) => {
    try {
      const parsedArray = parseArrayInput(values.array, displayArray)
      const target = parseIntegerInput(values.target, 'Target')
      const execution = runSearchingOperation(mode, parsedArray, target)

      setDisplayArray(execution.array)
      setRunContext(execution.context)
      setSteps(execution.steps)

      if (execution.context.autoSorted) {
        setStatusMessage(`Array auto-sorted for binary search: [${execution.array.join(', ')}].`)
      } else {
        setStatusMessage(
          `${methodMeta.label} for target ${target} over ${execution.array.length} element${execution.array.length === 1 ? '' : 's'}.`
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid input.'
      setStatusMessage(message)
      setRunContext(null)
      setSteps([{ action: 'info', indices: [], description: message, pseudoCodeLine: 0 }])
    }
  }

  const controls = (
    <div className="space-y-3">
      <ControlPanel fields={fields} actions={[{ label: 'Run search', onClick: handleRun }]} />
      <VizControlsBar
        isPlaying={isPlaying}
        isComplete={isComplete}
        hasSteps={steps.length > 0}
        speed={speed}
        currentStep={currentStep}
        totalSteps={steps.length}
        status={statusMessage}
        onPlay={play}
        onPause={pause}
        onStepForward={stepForward}
        onStepBackward={stepBackward}
        onReset={reset}
        onSpeedChange={setSpeed}
      />
    </div>
  )

  return (
    <VisualizerLayout
      title={methodMeta.label}
      description={methodMeta.description}
      complexityData={methodMeta.complexity}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Array · n=${displayArray.length}`}
        currentDescription={currentStepData?.description}
        fallbackMessage={statusMessage}
        pseudoCode={methodMeta.pseudoCode}
        steps={steps}
        currentStep={currentStep}
        currentLine={currentStepData?.pseudoCodeLine}
        onJump={jumpToStep}
        canvasFooter={runContext?.autoSorted && 'Input was auto-sorted for binary search.'}
      >
        <ArrayCanvas
          values={displayArray}
          states={states}
          pointers={pointers}
          size="lg"
          emptyLabel="Add elements to begin."
        />
      </VizShell>
    </VisualizerLayout>
  )
}
