'use client'

import { useMemo, useState } from 'react'

import {
  binarySearchPseudoCode,
  binarySearchSteps,
  deletePseudoCode,
  deleteStep,
  insertPseudoCode,
  insertStep,
  linearSearchPseudoCode,
  linearSearchSteps,
  traversePseudoCode,
  traverseSteps,
} from '@/lib/algorithms/array-ops'
import type { ComplexityInfo, NodeData, Step } from '@/lib/types'

import { ArrayCanvas, type ArrayPointer } from '@/components/shared/ArrayCanvas'
import { ControlPanel, type FieldDef } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'

export type ArrayMode = 'insert' | 'delete' | 'traverse' | 'linear' | 'binary'

interface ArrayVisualizerProps {
  mode: ArrayMode
}

interface BinaryPointers {
  low?: number
  mid?: number
  high?: number
}

const DEFAULT_ARRAY = [4, 8, 13, 21, 34, 55]

const modePresentation: Record<
  ArrayMode,
  { title: string; description: string; complexity: ComplexityInfo[]; pseudoCode: string[] }
> = {
  insert: {
    title: 'Array · Insert',
    description: 'Shift tail elements right and place the new value at the requested index.',
    complexity: [{
      operation: 'Insert', time: 'O(n)', space: 'O(1)',
      best: 'O(1)', worst: 'O(n)',
      note: 'Worst case occurs when inserting near the beginning.',
    }],
    pseudoCode: insertPseudoCode,
  },
  delete: {
    title: 'Array · Delete',
    description: 'Remove a selected index and shift the tail to close the gap.',
    complexity: [{
      operation: 'Delete', time: 'O(n)', space: 'O(1)',
      best: 'O(1)', worst: 'O(n)',
      note: 'Worst case occurs when deleting near the beginning.',
    }],
    pseudoCode: deletePseudoCode,
  },
  traverse: {
    title: 'Array · Traverse',
    description: 'Visit each element from left to right exactly once.',
    complexity: [{ operation: 'Traverse', time: 'O(n)', space: 'O(1)' }],
    pseudoCode: traversePseudoCode,
  },
  linear: {
    title: 'Linear Search',
    description: 'Compare target against each element until found or exhausted.',
    complexity: [{
      operation: 'Linear Search', time: 'O(n)', space: 'O(1)',
      best: 'O(1)', worst: 'O(n)',
    }],
    pseudoCode: linearSearchPseudoCode,
  },
  binary: {
    title: 'Binary Search',
    description: 'Use low, high, mid pointers to halve the search interval each step.',
    complexity: [{
      operation: 'Binary Search', time: 'O(log n)', space: 'O(1)',
      best: 'O(1)', worst: 'O(log n)',
      note: 'Assumes ascending order.',
    }],
    pseudoCode: binarySearchPseudoCode,
  },
}

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

function isSortedAscending(array: number[]): boolean {
  for (let i = 1; i < array.length; i += 1) {
    if (array[i] < array[i - 1]) return false
  }
  return true
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

export function ArrayVisualizer({ mode }: ArrayVisualizerProps) {
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

  const [baseArray, setBaseArray] = useState<number[]>(DEFAULT_ARRAY)
  const [finalArray, setFinalArray] = useState<number[] | null>(null)
  const [statusMessage, setStatusMessage] = useState('Run an operation to begin.')

  const presentation = modePresentation[mode]

  const fields = useMemo<FieldDef[]>(() => {
    const common: FieldDef[] = [{ name: 'array', label: 'Array', placeholder: '4, 8, 13, 21, 34, 55' }]
    switch (mode) {
      case 'insert':
        return [...common, { name: 'index', label: 'Index', type: 'number', placeholder: '2' }, { name: 'value', label: 'Value', type: 'number', placeholder: '99' }]
      case 'delete':
        return [...common, { name: 'index', label: 'Index', type: 'number', placeholder: '3' }]
      case 'traverse':
        return common
      case 'linear':
      case 'binary':
        return [...common, { name: 'target', label: 'Target', type: 'number', placeholder: '21' }]
      default:
        return common
    }
  }, [mode])

  const displayedArray = useMemo(() => {
    const isFinalStep = steps.length > 0 && currentStep >= steps.length - 1
    return isFinalStep && finalArray ? finalArray : baseArray
  }, [baseArray, currentStep, finalArray, steps.length])

  const binaryPointers = useMemo(() => {
    if (mode !== 'binary') return {}
    return resolveBinaryPointers(steps, currentStep)
  }, [mode, steps, currentStep])

  const states: NodeData['state'][] = useMemo(() => {
    return displayedArray.map((_, index) => {
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
        case 'insert': return 'inserting'
        case 'delete': return 'deleting'
        case 'highlight':
        case 'traverse':
        case 'info':
        default: return 'active'
      }
    })
  }, [displayedArray, currentStepData, mode])

  const pointers: ArrayPointer[] = useMemo(() => {
    if (mode !== 'binary') return []
    const out: ArrayPointer[] = []
    if (binaryPointers.low !== undefined) out.push({ index: binaryPointers.low, label: 'LOW', tone: 'primary' })
    if (binaryPointers.mid !== undefined) out.push({ index: binaryPointers.mid, label: 'MID', tone: 'compare' })
    if (binaryPointers.high !== undefined) out.push({ index: binaryPointers.high, label: 'HIGH', tone: 'primary' })
    return out
  }, [binaryPointers, mode])

  const handleGenerate = (values: Record<string, string>) => {
    try {
      const parsedArray = parseArrayInput(values.array, baseArray)
      let generatedSteps: Step[] = []
      let nextArray: number[] | null = null
      let message = ''

      if (mode === 'insert') {
        const index = parseIntegerInput(values.index, 'Index')
        const value = parseIntegerInput(values.value, 'Value')
        generatedSteps = insertStep(parsedArray, index, value)
        if (index >= 0 && index <= parsedArray.length) {
          nextArray = [...parsedArray]
          nextArray.splice(index, 0, value)
          message = `Insert ${value} at index ${index}.`
        } else {
          message = generatedSteps[generatedSteps.length - 1]?.description ?? 'Insert failed.'
        }
      } else if (mode === 'delete') {
        const index = parseIntegerInput(values.index, 'Index')
        generatedSteps = deleteStep(parsedArray, index)
        if (index >= 0 && index < parsedArray.length) {
          nextArray = [...parsedArray]
          nextArray.splice(index, 1)
          message = `Delete element at index ${index}.`
        } else {
          message = generatedSteps[generatedSteps.length - 1]?.description ?? 'Delete failed.'
        }
      } else if (mode === 'traverse') {
        generatedSteps = traverseSteps(parsedArray)
        nextArray = [...parsedArray]
        message = `Traverse ${parsedArray.length} element${parsedArray.length === 1 ? '' : 's'}.`
      } else if (mode === 'linear') {
        const target = parseIntegerInput(values.target, 'Target')
        generatedSteps = linearSearchSteps(parsedArray, target)
        nextArray = [...parsedArray]
        message = `Linear search for ${target}.`
      } else if (mode === 'binary') {
        const target = parseIntegerInput(values.target, 'Target')
        generatedSteps = binarySearchSteps(parsedArray, target)
        nextArray = [...parsedArray]
        const sortedNote = isSortedAscending(parsedArray) ? 'Input is sorted.' : 'Input not sorted; pointer trace shown.'
        message = `Binary search for ${target}. ${sortedNote}`
      }

      setBaseArray(parsedArray)
      setFinalArray(nextArray)
      setStatusMessage(message)
      setSteps(
        generatedSteps.length > 0
          ? generatedSteps
          : [{ action: 'info', indices: [], description: 'No steps generated.', pseudoCodeLine: 0 }]
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid input.'
      setStatusMessage(message)
      setFinalArray(null)
      setSteps([{ action: 'info', indices: [], description: message, pseudoCodeLine: 0 }])
    }
  }

  const controls = (
    <div className="space-y-3">
      <ControlPanel fields={fields} actions={[{ label: 'Generate steps', onClick: handleGenerate }]} />
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
      title={presentation.title}
      description={presentation.description}
      complexityData={presentation.complexity}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Array · n=${displayedArray.length}`}
        currentDescription={currentStepData?.description}
        fallbackMessage={statusMessage}
        pseudoCode={presentation.pseudoCode}
        steps={steps}
        currentStep={currentStep}
        currentLine={currentStepData?.pseudoCodeLine}
        onJump={jumpToStep}
      >
        <ArrayCanvas
          values={displayedArray}
          states={states}
          pointers={pointers}
          size="lg"
          emptyLabel="Add elements to begin."
        />
      </VizShell>
    </VisualizerLayout>
  )
}
