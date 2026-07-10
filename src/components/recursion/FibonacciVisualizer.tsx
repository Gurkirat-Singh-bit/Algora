'use client'

import { useMemo, useState } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'

import { ControlPanel } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import {
  DEFAULT_FIT_OPTIONS,
  DEFAULT_PRO_OPTIONS,
  STABLE_EDGE_TYPES,
  STABLE_NODE_TYPES,
} from '@/components/shared/reactflowConfig'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import {
  fibonacciCallTreeSteps,
  fibonacciPseudoCode,
  type FibonacciNode,
  type FibonacciRun,
} from '@/lib/algorithms/recursion-ops'
import type { ComplexityInfo, NodeData } from '@/lib/types'

const COMPLEXITY: ComplexityInfo[] = [
  { operation: 'Fibonacci recursion + memo', time: 'O(n)', space: 'O(n)', note: 'Memoization avoids repeated subtree expansion.' },
]

function nodeState(nodeId: number, currentStepIndices: number[]): NodeData['state'] {
  if (!currentStepIndices.includes(nodeId)) return 'default'
  return 'active'
}

function stateColor(state: NodeData['state']): string {
  if (state === 'active') return 'var(--dsa-active)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'comparing') return 'var(--dsa-compare)'
  return 'var(--dsa-elevated)'
}

function stateText(state: NodeData['state']): string {
  return state === 'default' ? 'var(--dsa-text-strong)' : 'var(--on-accent)'
}

function toFlow(run: FibonacciRun, currentStepIndices: number[]): { nodes: Node[]; edges: Edge[] } {
  const depthGroups = new Map<number, FibonacciNode[]>()

  run.nodes.forEach(node => {
    const group = depthGroups.get(node.depth) ?? []
    group.push(node)
    depthGroups.set(node.depth, group)
  })

  const nodes: Node[] = []
  for (const [depth, group] of depthGroups.entries()) {
    group.forEach((node, index) => {
      const state = nodeState(node.id, currentStepIndices)
      nodes.push({
        id: String(node.id),
        position: { x: 130 + index * 180, y: 40 + depth * 110 },
        data: { label: `fib(${node.n})${node.value !== undefined ? ` = ${node.value}` : ''}` },
        draggable: false,
        selectable: false,
        style: {
          width: 130,
          borderRadius: 8,
          border: node.cached
            ? '1px dashed var(--dsa-primary-container)'
            : state === 'default'
              ? '1px solid var(--dsa-border-strong)'
              : '1px solid transparent',
          background: stateColor(state),
          color: stateText(state),
          fontFamily: 'var(--font-mono-stack)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textAlign: 'center',
          padding: 8,
          transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
        },
      })
    })
  }

  const edges: Edge[] = run.edges.map(edge => ({
    id: `${edge.source}-${edge.target}`,
    source: String(edge.source),
    target: String(edge.target),
    type: 'smoothstep',
    style: { stroke: 'var(--dsa-outline)', strokeWidth: 1.4, opacity: 0.7 },
  }))

  return { nodes, edges }
}

export function FibonacciVisualizer() {
  const runner = useStepRunner()
  const [run, setRun] = useState<FibonacciRun>(() => fibonacciCallTreeSteps(5))
  const [status, setStatus] = useState('Run fibonacci to generate the call tree with memo reuse.')

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

  const currentStepIndices = runner.currentStepData?.indices ?? []
  const flow = useMemo(() => toFlow(run, currentStepIndices), [run, currentStepIndices])

  const handleRun = (values: Record<string, string>) => {
    const parsed = Number(values.n)
    if (!Number.isInteger(parsed)) {
      const message = 'Provide an integer n value.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
      return
    }
    const clamped = Math.max(0, Math.min(8, parsed))
    const nextRun = fibonacciCallTreeSteps(clamped)
    setRun(nextRun)
    runner.setSteps(nextRun.steps)
    setStatus(`fib(${clamped}) = ${nextRun.result}.`)
  }

  const controls = (
    <div className="space-y-3">
      <ControlPanel
        fields={[{ name: 'n', label: 'n (≤ 8)', type: 'number', placeholder: '6' }]}
        actions={[{ label: 'Run fibonacci', onClick: handleRun }]}
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
      title="Recursion · Fibonacci"
      description="Recursive call tree with memo reuse highlighted as dashed nodes."
      complexityData={COMPLEXITY}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Call tree · result fib = ${run.result}`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={fibonacciPseudoCode}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
      >
        <ReactFlow
          nodes={flow.nodes}
          edges={flow.edges}
          nodeTypes={STABLE_NODE_TYPES}
          edgeTypes={STABLE_EDGE_TYPES}
          fitView
          fitViewOptions={DEFAULT_FIT_OPTIONS}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={DEFAULT_PRO_OPTIONS}
        >
          <Background color="oklch(0.42 0.009 150 / 0.45)" gap={32} variant={BackgroundVariant.Dots} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </VizShell>
    </VisualizerLayout>
  )
}
