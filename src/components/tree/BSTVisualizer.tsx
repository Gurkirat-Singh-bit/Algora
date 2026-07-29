'use client'

import { useMemo, useState } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'

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
  bstDeletePseudoCode,
  bstDeleteSteps,
  bstInsertPseudoCode,
  bstInsertSteps,
  bstSearchPseudoCode,
  bstSearchSteps,
  buildBstFromValues,
  insertIntoValues,
  type BstNode,
  removeFromValues,
} from '@/lib/algorithms/bst-ops'
import type { ComplexityInfo, NodeData } from '@/lib/types'

export type BSTMode = 'insert' | 'search' | 'delete'

interface Props {
  mode: BSTMode
}

const INITIAL_VALUES = [40, 20, 60, 10, 30, 50, 70]

const modeMeta: Record<
  BSTMode,
  { title: string; description: string; pseudoCode: string[]; complexity: ComplexityInfo[]; actionLabel: string }
> = {
  insert: {
    title: 'Binary Search Tree Insert',
    description: 'Follow BST comparisons and place a value in its ordered position.',
    pseudoCode: bstInsertPseudoCode,
    complexity: [{ operation: 'BST Insert', time: 'O(h)', space: 'O(1)' }],
    actionLabel: 'Insert Value',
  },
  search: {
    title: 'Binary Search Tree Search',
    description: 'Traverse left or right based on comparisons until target is found or missing.',
    pseudoCode: bstSearchPseudoCode,
    complexity: [{ operation: 'BST Search', time: 'O(h)', space: 'O(1)' }],
    actionLabel: 'Search Value',
  },
  delete: {
    title: 'Binary Search Tree Delete',
    description: 'Handle leaf, one-child, and two-child delete scenarios.',
    pseudoCode: bstDeletePseudoCode,
    complexity: [{ operation: 'BST Delete', time: 'O(h)', space: 'O(1)' }],
    actionLabel: 'Delete Value',
  },
}

function nodeState(nodeValue: number, highlightedValues: number[]): NodeData['state'] {
  if (!highlightedValues.includes(nodeValue)) {
    return 'default'
  }
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

function buildFlow(
  root: BstNode | null,
  highlightedValues: number[],
  nodePositions: Record<string, { x: number; y: number }>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const visit = (node: BstNode | null, depth: number, minX: number, maxX: number): void => {
    if (!node) {
      return
    }

    const x = (minX + maxX) / 2
    const y = 50 + depth * 95
    const state = nodeState(node.value, highlightedValues)

    const nodeId = String(node.value)
    const defaultPosition = { x, y }

    nodes.push({
      id: nodeId,
      position: nodePositions[nodeId] ?? defaultPosition,
      data: { label: String(node.value) },
      draggable: true,
      selectable: false,
      style: {
        width: 56,
        height: 56,
        borderRadius: 999,
        border: state === 'default' ? '1px solid var(--dsa-border-strong)' : '1px solid transparent',
        background: stateColor(state),
        color: stateText(state),
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

    if (node.left) {
      edges.push({
        id: `${node.value}-${node.left.value}`,
        source: String(node.value),
        target: String(node.left.value),
        type: 'smoothstep',
        style: { stroke: 'var(--dsa-outline)', strokeWidth: 1.6, opacity: 0.7 },
      })
    }

    if (node.right) {
      edges.push({
        id: `${node.value}-${node.right.value}`,
        source: String(node.value),
        target: String(node.right.value),
        type: 'smoothstep',
        style: { stroke: 'var(--dsa-outline)', strokeWidth: 1.6, opacity: 0.7 },
      })
    }

    visit(node.left, depth + 1, minX, x)
    visit(node.right, depth + 1, x, maxX)
  }

  visit(root, 0, 0, 980)

  return { nodes, edges }
}

export function BSTVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [values, setValues] = useState<number[]>(INITIAL_VALUES)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  const [status, setStatus] = useState('Run a BST operation to generate traversal steps.')

  const meta = modeMeta[mode]
  const root = useMemo(() => buildBstFromValues(values), [values])
  const flow = useMemo(
    () => buildFlow(root, runner.currentStepData?.indices ?? [], nodePositions),
    [root, runner.currentStepData, nodePositions]
  )

  const handleRun = (formValues: Record<string, string>) => {
    const value = Number(formValues.value)
    if (!Number.isInteger(value)) {
      const message = 'Provide an integer value.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
      return
    }

    if (mode === 'insert') {
      const steps = bstInsertSteps(values, value)
      setValues(prev => insertIntoValues(prev, value))
      runner.setSteps(steps)
      setStatus(`Insert flow generated for ${value}.`)
      return
    }

    if (mode === 'search') {
      const steps = bstSearchSteps(values, value)
      runner.setSteps(steps)
      setStatus(`Search flow generated for ${value}.`)
      return
    }

    const steps = bstDeleteSteps(values, value)
    setValues(prev => removeFromValues(prev, value))
    runner.setSteps(steps)
    setStatus(`Delete flow generated for ${value}.`)
  }

  const handleNodeDragStop = (_event: unknown, node: Node): void => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: node.position,
    }))
  }

  const operationHint =
    mode === 'insert'
      ? 'Insert compares value from root and places it as a new leaf.'
      : mode === 'search'
        ? 'Search follows left/right comparisons until value is found or path ends.'
        : 'Delete handles 3 cases: leaf, one child, or two children (inorder successor).'

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
        fields={[{ name: 'value', label: 'Value', type: 'number', placeholder: '45' }]}
        actions={[
          { label: meta.actionLabel, onClick: handleRun },
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
        canvasLabel={operationHint}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={meta.pseudoCode}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
        canvasFooter={<span>Values: <span className="font-mono text-dsa-text">[{values.join(', ')}]</span></span>}
      >
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
      </VizShell>
    </VisualizerLayout>
  )
}
