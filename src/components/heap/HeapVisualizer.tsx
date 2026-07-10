'use client'

import { useMemo, useState } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'

import { AnimatedNode } from '@/components/shared/AnimatedNode'
import { ControlPanel } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import {
  DEFAULT_FIT_OPTIONS,
  DEFAULT_PRO_OPTIONS,
  STABLE_EDGE_TYPES,
  STABLE_NODE_TYPES,
} from '@/components/shared/reactflowConfig'
import { useStepRunner } from '@/hooks/useStepRunner'
import {
  buildHeapArray,
  heapExtractPseudoCode,
  heapExtractSteps,
  heapInsertPseudoCode,
  heapInsertSteps,
  type HeapType,
} from '@/lib/algorithms/heap-ops'
import type { ComplexityInfo, NodeData, Step } from '@/lib/types'

interface Props {
  mode: HeapType
}

const INITIAL_ARRAY = [20, 5, 14, 22, 9, 30, 11]

const modeMeta: Record<HeapType, { title: string; description: string; complexity: ComplexityInfo[] }> = {
  min: {
    title: 'Min Heap Visualizer',
    description: 'Observe sift-up and sift-down while maintaining min-heap order.',
    complexity: [
      { operation: 'Insert', time: 'O(log n)', space: 'O(1)' },
      { operation: 'Extract Root', time: 'O(log n)', space: 'O(1)' },
      { operation: 'Build Heap', time: 'O(n)', space: 'O(1)' },
    ],
  },
  max: {
    title: 'Max Heap Visualizer',
    description: 'Observe sift-up and sift-down while maintaining max-heap order.',
    complexity: [
      { operation: 'Insert', time: 'O(log n)', space: 'O(1)' },
      { operation: 'Extract Root', time: 'O(log n)', space: 'O(1)' },
      { operation: 'Build Heap', time: 'O(n)', space: 'O(1)' },
    ],
  },
}

function parseArrayInput(raw: string | undefined, fallback: number[]): number[] {
  const text = (raw ?? '').trim()
  if (!text) {
    return [...fallback]
  }

  const tokens = text
    .split(',')
    .map(token => token.trim())
    .filter(Boolean)

  if (tokens.length === 0) {
    throw new Error('Provide at least one numeric value.')
  }

  const numbers = tokens.map(token => Number(token))
  if (numbers.some(number => Number.isNaN(number))) {
    throw new Error('Array must contain comma-separated numbers.')
  }

  return numbers
}

function stateForIndex(index: number, step: Step | null): NodeData['state'] {
  if (!step || !step.indices.includes(index)) {
    return 'default'
  }

  if (step.action === 'swap') {
    return 'comparing'
  }

  if (step.action === 'insert') {
    return 'inserting'
  }

  if (step.action === 'delete') {
    return 'deleting'
  }

  if (step.action === 'found') {
    return 'found'
  }

  return 'active'
}

function colorForState(state: NodeData['state']): string {
  if (state === 'active') return 'var(--dsa-active)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'comparing') return 'var(--dsa-compare)'
  if (state === 'inserting') return 'var(--dsa-insert)'
  if (state === 'deleting') return 'var(--dsa-delete)'
  return 'var(--dsa-elevated)'
}

function textForState(state: NodeData['state']): string {
  return state === 'default' ? 'var(--dsa-text-strong)' : 'var(--on-accent)'
}

function buildFlow(
  heap: number[],
  currentStep: Step | null,
  nodePositions: Record<string, { x: number; y: number }>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  heap.forEach((value, index) => {
    const depth = Math.floor(Math.log2(index + 1))
    const firstInLevel = 2 ** depth - 1
    const positionInLevel = index - firstInLevel
    const nodesInLevel = 2 ** depth

    const x = ((positionInLevel + 1) * 980) / (nodesInLevel + 1)
    const y = 45 + depth * 90
    const state = stateForIndex(index, currentStep)

    const nodeId = String(index)
    const defaultPosition = { x, y }

    nodes.push({
      id: nodeId,
      position: nodePositions[nodeId] ?? defaultPosition,
      data: { label: String(value) },
      draggable: true,
      selectable: false,
      style: {
        width: 56,
        height: 56,
        borderRadius: 999,
        border: state === 'default' ? '1px solid var(--dsa-border-strong)' : '1px solid transparent',
        background: colorForState(state),
        color: textForState(state),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontFamily: 'var(--font-mono-stack)',
        fontSize: 15,
        letterSpacing: '0.04em',
        transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
      },
    })

    const left = index * 2 + 1
    const right = index * 2 + 2

    if (left < heap.length) {
      edges.push({
        id: `${index}-${left}`,
        source: String(index),
        target: String(left),
        type: 'smoothstep',
        style: { stroke: 'var(--dsa-outline)', strokeWidth: 1.6, opacity: 0.7 },
      })
    }

    if (right < heap.length) {
      edges.push({
        id: `${index}-${right}`,
        source: String(index),
        target: String(right),
        type: 'smoothstep',
        style: { stroke: 'var(--dsa-outline)', strokeWidth: 1.6, opacity: 0.7 },
      })
    }
  })

  return { nodes, edges }
}

export function HeapVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [heap, setHeap] = useState<number[]>(() => buildHeapArray(INITIAL_ARRAY, mode))
  const [snapshots, setSnapshots] = useState<number[][]>(() => [buildHeapArray(INITIAL_ARRAY, mode)])
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  const [status, setStatus] = useState('Run heap operations to animate structural updates.')

  const meta = modeMeta[mode]

  const displayedHeap = useMemo(() => {
    if (snapshots.length === 0) {
      return heap
    }

    const index = runner.currentStep <= 0 ? 0 : Math.min(runner.currentStep, snapshots.length - 1)
    return snapshots[index] ?? heap
  }, [heap, snapshots, runner.currentStep])

  const flow = useMemo(
    () => buildFlow(displayedHeap, runner.currentStepData, nodePositions),
    [displayedHeap, runner.currentStepData, nodePositions]
  )

  const handleBuild = (values: Record<string, string>) => {
    try {
      const parsed = parseArrayInput(values.array, heap)
      const nextHeap = buildHeapArray(parsed, mode)
      const steps: Step[] = [
        { action: 'info', indices: [], description: `Build ${mode}-heap from input array.` },
        { action: 'found', indices: nextHeap.map((_, index) => index), description: `${mode}-heap build complete.` },
      ]

      setHeap(nextHeap)
      setSnapshots([nextHeap])
      runner.setSteps(steps)
      setStatus(`Built ${mode}-heap with ${nextHeap.length} node(s).`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid input array.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
    }
  }

  const handleInsert = (values: Record<string, string>) => {
    const value = Number(values.value)
    if (!Number.isFinite(value)) {
      const message = 'Provide a numeric value to insert.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
      return
    }

    const run = heapInsertSteps(heap, value, mode)
    setHeap(run.nextHeap)
    setSnapshots(run.snapshots)
    runner.setSteps(run.steps)
    setStatus(`Inserted ${value} into ${mode}-heap.`)
  }

  const handleExtract = () => {
    const run = heapExtractSteps(heap, mode)
    setHeap(run.nextHeap)
    setSnapshots(run.snapshots)
    runner.setSteps(run.steps)
    setStatus(
      run.extracted === undefined
        ? `${mode}-heap is empty.`
        : `Extracted root ${run.extracted} from ${mode}-heap.`
    )
  }

  const handleNodeDragStop = (_event: unknown, node: Node): void => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: node.position,
    }))
  }

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

  const controls = (
    <div className="space-y-3">
      <ControlPanel
        fields={[
          { name: 'array', label: 'Array', placeholder: '20, 5, 14, 22, 9, 30, 11' },
          { name: 'value', label: 'Value', type: 'number', placeholder: '18' },
        ]}
        actions={[
          { label: 'Build heap', onClick: handleBuild },
          { label: 'Insert', onClick: handleInsert, variant: 'secondary' },
          { label: 'Extract root', onClick: () => handleExtract(), variant: 'outline' },
          { label: 'Reset layout', onClick: () => setNodePositions({}), variant: 'outline' },
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
      title={meta.title}
      description={meta.description}
      complexityData={meta.complexity}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Heap · size ${displayedHeap.length}`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={runner.currentStepData?.action === 'delete' ? heapExtractPseudoCode : heapInsertPseudoCode}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1">
            <ReactFlow
              nodes={flow.nodes}
              edges={flow.edges}
              nodeTypes={STABLE_NODE_TYPES}
              edgeTypes={STABLE_EDGE_TYPES}
              fitView
              fitViewOptions={DEFAULT_FIT_OPTIONS}
              onNodeDragStop={handleNodeDragStop}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag
              proOptions={DEFAULT_PRO_OPTIONS}
            >
              <Background color="oklch(0.42 0.009 150 / 0.45)" gap={32} variant={BackgroundVariant.Dots} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <div className="border-t border-dsa-border surface-floor px-5 py-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-category text-dsa-muted-soft">
              Array view
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedHeap.length === 0 ? (
                <p className="text-sm text-dsa-muted">Heap is empty.</p>
              ) : (
                displayedHeap.map((value, index) => (
                  <AnimatedNode
                    key={`${index}-${value}`}
                    value={value}
                    index={index}
                    showIndex
                    state={stateForIndex(index, runner.currentStepData)}
                    size="sm"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </VizShell>
    </VisualizerLayout>
  )
}
