'use client'

import { useMemo, useState } from 'react'

import { CircularQueueVisualizer } from '@/components/queue/CircularQueueVisualizer'
import { DequeVisualizer } from '@/components/queue/DequeVisualizer'
import { QueueVisualizer } from '@/components/queue/QueueVisualizer'
import { ControlPanel } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import {
  circularDequeueSteps,
  circularEnqueueSteps,
  dequeueSteps,
  dequeDeleteFrontSteps,
  dequeDeleteRearSteps,
  dequeInsertFrontSteps,
  dequeInsertRearSteps,
  enqueueSteps,
  type CircularQueueState,
  type QueueValue,
} from '@/lib/algorithms/queue-ops'
import type { ComplexityInfo, Step } from '@/lib/types'

type QueueTab = 'queue' | 'circular' | 'deque'

const tabPseudo: Record<QueueTab, string[]> = {
  queue: [
    'enqueue(q, x):',
    '  q.push_back(x)',
    '',
    'dequeue(q):',
    '  return q.pop_front()',
  ],
  circular: [
    'enqueue(cq, x):',
    '  if size == capacity: return FULL',
    '  rear = (rear + 1) % capacity',
    '  slots[rear] = x; size++',
    '',
    'dequeue(cq):',
    '  if size == 0: return EMPTY',
    '  v = slots[front]',
    '  front = (front + 1) % capacity; size--',
  ],
  deque: [
    'pushFront(d, x): d.unshift(x)',
    'pushRear(d, x):  d.push(x)',
    'popFront(d):     return d.shift()',
    'popRear(d):      return d.pop()',
  ],
}

const tabTitles: Record<QueueTab, string> = {
  queue: 'Queue · Simple (FIFO)',
  circular: 'Queue · Circular',
  deque: 'Queue · Deque',
}

const tabDescriptions: Record<QueueTab, string> = {
  queue: 'Add at rear, remove from front. Linear FIFO behavior.',
  circular: 'Fixed capacity. Front and rear wrap with modular indexing.',
  deque: 'Double-ended queue. Insert and delete at both ends.',
}

const QUEUE_COMPLEXITY: ComplexityInfo[] = [
  { operation: 'Simple Queue', time: 'O(1) / O(n)', space: 'O(n)', note: 'Array shift on dequeue.' },
  { operation: 'Circular Queue', time: 'O(1)', space: 'O(c)', note: 'c = capacity.' },
  { operation: 'Deque', time: 'O(1)', space: 'O(n)', note: 'Conceptually O(1) at both ends.' },
]

function parseInputValue(rawValue: string): QueueValue | null {
  const trimmed = rawValue.trim()
  if (!trimmed) return null
  const asNumber = Number(trimmed)
  return Number.isNaN(asNumber) ? trimmed : asNumber
}

function inputRequiredStep(operation: string): Step[] {
  return [{ action: 'info', indices: [], description: `Enter a value before running ${operation}.` }]
}

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<QueueTab>('queue')

  const [queue, setQueue] = useState<QueueValue[]>([12, 25, 34])
  const [circularQueue, setCircularQueue] = useState<CircularQueueState<QueueValue>>({
    slots: [8, 16, 24, null, null, null, null, null],
    front: 0,
    rear: 2,
    size: 3,
  })
  const [deque, setDeque] = useState<QueueValue[]>([5, 14, 21])

  const queueRunner = useStepRunner()
  const circularRunner = useStepRunner()
  const dequeRunner = useStepRunner()

  const activeRunner =
    activeTab === 'queue' ? queueRunner : activeTab === 'circular' ? circularRunner : dequeRunner

  useKeyboardControls({
    isPlaying: activeRunner.isPlaying,
    hasSteps: activeRunner.steps.length > 0,
    isComplete: activeRunner.isComplete,
    play: activeRunner.play,
    pause: activeRunner.pause,
    stepForward: activeRunner.stepForward,
    stepBackward: activeRunner.stepBackward,
    reset: activeRunner.reset,
    setSpeed: activeRunner.setSpeed,
  })

  const handleQueueEnqueue = (values: Record<string, string>) => {
    const parsed = parseInputValue(values.value ?? '')
    if (parsed === null) {
      queueRunner.setSteps(inputRequiredStep('Enqueue'))
      return
    }
    queueRunner.setSteps(enqueueSteps(queue, parsed))
    setQueue(prev => [...prev, parsed])
  }
  const handleQueueDequeue = () => {
    queueRunner.setSteps(dequeueSteps(queue))
    if (queue.length > 0) setQueue(prev => prev.slice(1))
  }

  const handleCircularEnqueue = (values: Record<string, string>) => {
    const parsed = parseInputValue(values.value ?? '')
    if (parsed === null) {
      circularRunner.setSteps(inputRequiredStep('Circular Enqueue'))
      return
    }
    circularRunner.setSteps(circularEnqueueSteps(circularQueue, parsed))
    if (circularQueue.size >= circularQueue.slots.length) return
    setCircularQueue(prev => {
      if (prev.size >= prev.slots.length) return prev
      const insertIndex = prev.size === 0 ? 0 : (prev.rear + 1) % prev.slots.length
      const nextSlots = [...prev.slots]
      nextSlots[insertIndex] = parsed
      return {
        slots: nextSlots,
        front: prev.size === 0 ? 0 : prev.front,
        rear: insertIndex,
        size: prev.size + 1,
      }
    })
  }
  const handleCircularDequeue = () => {
    circularRunner.setSteps(circularDequeueSteps(circularQueue))
    if (circularQueue.size === 0) return
    setCircularQueue(prev => {
      if (prev.size === 0) return prev
      const nextSlots = [...prev.slots]
      nextSlots[prev.front] = null
      if (prev.size === 1) return { slots: nextSlots, front: -1, rear: -1, size: 0 }
      return {
        slots: nextSlots,
        front: (prev.front + 1) % prev.slots.length,
        rear: prev.rear,
        size: prev.size - 1,
      }
    })
  }

  const handleDequeInsertFront = (values: Record<string, string>) => {
    const parsed = parseInputValue(values.value ?? '')
    if (parsed === null) {
      dequeRunner.setSteps(inputRequiredStep('Push Front'))
      return
    }
    dequeRunner.setSteps(dequeInsertFrontSteps(deque, parsed))
    setDeque(prev => [parsed, ...prev])
  }
  const handleDequeInsertRear = (values: Record<string, string>) => {
    const parsed = parseInputValue(values.value ?? '')
    if (parsed === null) {
      dequeRunner.setSteps(inputRequiredStep('Push Rear'))
      return
    }
    dequeRunner.setSteps(dequeInsertRearSteps(deque, parsed))
    setDeque(prev => [...prev, parsed])
  }
  const handleDequeDeleteFront = () => {
    dequeRunner.setSteps(dequeDeleteFrontSteps(deque))
    if (deque.length > 0) setDeque(prev => prev.slice(1))
  }
  const handleDequeDeleteRear = () => {
    dequeRunner.setSteps(dequeDeleteRearSteps(deque))
    if (deque.length > 0) setDeque(prev => prev.slice(0, -1))
  }

  const operationPanel = useMemo(() => {
    const valueField = { name: 'value', label: 'Value', placeholder: 'e.g. 19' }
    if (activeTab === 'queue') {
      return (
        <ControlPanel
          fields={[valueField]}
          actions={[
            { label: 'Enqueue', onClick: handleQueueEnqueue },
            { label: 'Dequeue', onClick: handleQueueDequeue, variant: 'outline' },
          ]}
        />
      )
    }
    if (activeTab === 'circular') {
      return (
        <ControlPanel
          fields={[valueField]}
          actions={[
            { label: 'Enqueue', onClick: handleCircularEnqueue },
            { label: 'Dequeue', onClick: handleCircularDequeue, variant: 'outline' },
          ]}
        />
      )
    }
    return (
      <ControlPanel
        fields={[valueField]}
        actions={[
          { label: 'Push front', onClick: handleDequeInsertFront },
          { label: 'Push rear', onClick: handleDequeInsertRear, variant: 'secondary' },
          { label: 'Pop front', onClick: handleDequeDeleteFront, variant: 'outline' },
          { label: 'Pop rear', onClick: handleDequeDeleteRear, variant: 'outline' },
        ]}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, queue, circularQueue, deque])

  const tabsBar = (
    <Tabs value={activeTab} onValueChange={v => setActiveTab(v as QueueTab)}>
      <TabsList className="w-full justify-start">
        <TabsTrigger value="queue">Simple</TabsTrigger>
        <TabsTrigger value="circular">Circular</TabsTrigger>
        <TabsTrigger value="deque">Deque</TabsTrigger>
      </TabsList>
    </Tabs>
  )

  const controls = (
    <div className="space-y-3">
      {tabsBar}
      {operationPanel}
      <VizControlsBar
        isPlaying={activeRunner.isPlaying}
        isComplete={activeRunner.isComplete}
        hasSteps={activeRunner.steps.length > 0}
        speed={activeRunner.speed}
        currentStep={activeRunner.currentStep}
        totalSteps={activeRunner.steps.length}
        status={tabDescriptions[activeTab]}
        onPlay={activeRunner.play}
        onPause={activeRunner.pause}
        onStepForward={activeRunner.stepForward}
        onStepBackward={activeRunner.stepBackward}
        onReset={activeRunner.reset}
        onSpeedChange={activeRunner.setSpeed}
      />
    </div>
  )

  const canvas =
    activeTab === 'queue' ? (
      <QueueVisualizer queue={queue} currentStepData={queueRunner.currentStepData} />
    ) : activeTab === 'circular' ? (
      <CircularQueueVisualizer state={circularQueue} currentStepData={circularRunner.currentStepData} />
    ) : (
      <DequeVisualizer deque={deque} currentStepData={dequeRunner.currentStepData} />
    )

  const canvasLabel =
    activeTab === 'queue'
      ? `Queue · length ${queue.length}`
      : activeTab === 'circular'
        ? `Circular · size ${circularQueue.size} / ${circularQueue.slots.length}`
        : `Deque · length ${deque.length}`

  return (
    <VisualizerLayout
      title={tabTitles[activeTab]}
      description={tabDescriptions[activeTab]}
      complexityData={QUEUE_COMPLEXITY}
      controls={controls}
    >
      <VizShell
        canvasLabel={canvasLabel}
        currentDescription={activeRunner.currentStepData?.description}
        fallbackMessage={tabDescriptions[activeTab]}
        pseudoCode={tabPseudo[activeTab]}
        steps={activeRunner.steps}
        currentStep={activeRunner.currentStep}
        currentLine={activeRunner.currentStepData?.pseudoCodeLine}
        onJump={activeRunner.jumpToStep}
      >
        {canvas}
      </VizShell>
    </VisualizerLayout>
  )
}
