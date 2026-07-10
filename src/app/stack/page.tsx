'use client'

import { useState } from 'react'

import { StackVisualizer } from '@/components/stack/StackVisualizer'
import { ControlPanel } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { peekSteps, popSteps, pushSteps, type StackValue } from '@/lib/algorithms/stack-ops'
import type { ComplexityInfo, Step } from '@/lib/types'

const STACK_COMPLEXITY: ComplexityInfo[] = [
  { operation: 'Push', time: 'O(1)', space: 'O(1)' },
  { operation: 'Pop', time: 'O(1)', space: 'O(1)' },
  { operation: 'Peek', time: 'O(1)', space: 'O(1)' },
]

const STACK_PSEUDOCODE = [
  'push(stack, x):',
  '  stack[++top] = x',
  '',
  'pop(stack):',
  '  return stack[top--]',
  '',
  'peek(stack):',
  '  return stack[top]',
]

function parseInputValue(rawValue: string): StackValue | null {
  const trimmed = rawValue.trim()
  if (!trimmed) return null
  const asNumber = Number(trimmed)
  return Number.isNaN(asNumber) ? trimmed : asNumber
}

function inputRequiredStep(operation: string): Step[] {
  return [{ action: 'info', indices: [], description: `Enter a value before running ${operation}.` }]
}

export default function StackPage() {
  const [stack, setStack] = useState<StackValue[]>([10, 24, 39])
  const runner = useStepRunner()
  const [status, setStatus] = useState('LIFO. Push adds to top, pop removes top, peek reads top.')

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

  const handlePush = (values: Record<string, string>) => {
    const parsed = parseInputValue(values.value ?? '')
    if (parsed === null) {
      runner.setSteps(inputRequiredStep('Push'))
      setStatus('Provide a value to push.')
      return
    }
    runner.setSteps(pushSteps(stack, parsed))
    setStack(prev => [...prev, parsed])
    setStatus(`Pushed ${parsed}. New size ${stack.length + 1}.`)
  }

  const handlePop = () => {
    runner.setSteps(popSteps(stack))
    if (stack.length > 0) {
      setStack(prev => prev.slice(0, -1))
      setStatus(`Popped top. New size ${stack.length - 1}.`)
    } else {
      setStatus('Stack is empty.')
    }
  }

  const handlePeek = () => {
    runner.setSteps(peekSteps(stack))
    setStatus(stack.length === 0 ? 'Stack is empty.' : `Top = ${stack[stack.length - 1]}.`)
  }

  const controls = (
    <div className="space-y-3">
      <ControlPanel
        fields={[{ name: 'value', label: 'Value', placeholder: 'e.g. 42' }]}
        actions={[
          { label: 'Push', onClick: handlePush },
          { label: 'Pop', onClick: handlePop, variant: 'outline' },
          { label: 'Peek', onClick: handlePeek, variant: 'secondary' },
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
      title="Stack"
      description="LIFO storage. Push, pop, peek with TOP-pointer tracking."
      complexityData={STACK_COMPLEXITY}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Stack · size ${stack.length}`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={STACK_PSEUDOCODE}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
      >
        <StackVisualizer stack={stack} currentStepData={runner.currentStepData} />
      </VizShell>
    </VisualizerLayout>
  )
}
