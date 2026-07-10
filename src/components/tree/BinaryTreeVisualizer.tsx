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
  buildTreeFromArray,
  inorderPseudoCode,
  inorderSteps,
  postorderPseudoCode,
  postorderSteps,
  preorderPseudoCode,
  preorderSteps,
} from '@/lib/algorithms/tree-ops'
import type { ComplexityInfo, NodeData } from '@/lib/types'

export type BinaryTreeMode = 'inorder' | 'preorder' | 'postorder'

interface Props {
  mode: BinaryTreeMode
}

const DEFAULT_VALUES: Array<number | null> = [40, 20, 60, 10, 30, 50, 70]

const modeMeta: Record<
  BinaryTreeMode,
  { title: string; description: string; pseudoCode: string[]; complexity: ComplexityInfo[] }
> = {
  inorder: {
    title: 'Binary Tree Inorder Traversal',
    description: 'Visit left subtree, then node, then right subtree.',
    pseudoCode: inorderPseudoCode,
    complexity: [{ operation: 'Inorder', time: 'O(n)', space: 'O(h)' }],
  },
  preorder: {
    title: 'Binary Tree Preorder Traversal',
    description: 'Visit node first, then left subtree, then right subtree.',
    pseudoCode: preorderPseudoCode,
    complexity: [{ operation: 'Preorder', time: 'O(n)', space: 'O(h)' }],
  },
  postorder: {
    title: 'Binary Tree Postorder Traversal',
    description: 'Visit left subtree, right subtree, then node.',
    pseudoCode: postorderPseudoCode,
    complexity: [{ operation: 'Postorder', time: 'O(n)', space: 'O(h)' }],
  },
}

function parseTreeValues(raw: string | undefined, fallback: Array<number | null>): Array<number | null> {
  const text = (raw ?? '').trim()
  if (!text) {
    return [...fallback]
  }

  const tokens = text
    .split(',')
    .map(token => token.trim())
    .filter(Boolean)

  if (tokens.length === 0) {
    throw new Error('Provide at least one tree token.')
  }

  return tokens.map(token => {
    if (token.toLowerCase() === 'null') {
      return null
    }

    const number = Number(token)
    if (Number.isNaN(number)) {
      throw new Error('Tree values must be numbers or null.')
    }

    return number
  })
}

function stateForNode(nodeIndex: number, currentIndices: number[]): NodeData['state'] {
  if (!currentIndices.includes(nodeIndex)) {
    return 'default'
  }
  return 'active'
}

function colorForState(state: NodeData['state']): string {
  if (state === 'active') return 'var(--dsa-active)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'comparing') return 'var(--dsa-compare)'
  return 'var(--dsa-elevated)'
}

function textColorForState(state: NodeData['state']): string {
  return state === 'default' ? 'var(--dsa-text-strong)' : 'var(--on-accent)'
}

function buildFlow(
  values: Array<number | null>,
  currentIndices: number[],
  nodePositions: Record<string, { x: number; y: number }>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  values.forEach((value, index) => {
    if (value === null) {
      return
    }

    const depth = Math.floor(Math.log2(index + 1))
    const firstInLevel = 2 ** depth - 1
    const positionInLevel = index - firstInLevel
    const nodesInLevel = 2 ** depth

    const x = ((positionInLevel + 1) * 980) / (nodesInLevel + 1)
    const y = 50 + depth * 95
    const state = stateForNode(index, currentIndices)

    const nodeId = String(index)
    const defaultPosition = { x, y }

    nodes.push({
      id: String(index),
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
        color: textColorForState(state),
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

    if (left < values.length && values[left] !== null) {
      edges.push({
        id: `${index}-${left}`,
        source: String(index),
        target: String(left),
        type: 'smoothstep',
        style: { stroke: 'var(--dsa-outline)', strokeWidth: 1.6, opacity: 0.7 },
      })
    }

    if (right < values.length && values[right] !== null) {
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

export function BinaryTreeVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [values, setValues] = useState<Array<number | null>>(DEFAULT_VALUES)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  const [status, setStatus] = useState('Run traversal to animate tree visit order.')

  const meta = modeMeta[mode]
  const currentIndices = runner.currentStepData?.indices ?? []

  const flow = useMemo(() => buildFlow(values, currentIndices, nodePositions), [values, currentIndices, nodePositions])

  const visitOrder = useMemo(() => {
    return runner.steps
      .filter(step => step.action === 'traverse' && step.indices.length > 0)
      .map(step => {
        const index = step.indices[0]
        return values[index]
      })
      .filter((value): value is number => value !== null && value !== undefined)
  }, [runner.steps, values])

  const handleRun = (formValues: Record<string, string>) => {
    try {
      const parsed = parseTreeValues(formValues.values, values)
      const root = buildTreeFromArray(parsed)
      const steps =
        mode === 'inorder'
          ? inorderSteps(root)
          : mode === 'preorder'
            ? preorderSteps(root)
            : postorderSteps(root)

      setValues(parsed)
      runner.setSteps(steps)
      setStatus(`${meta.title} generated ${steps.length} step(s).`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid tree input.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
    }
  }

  const handleNodeDragStop = (_event: unknown, node: Node): void => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: node.position,
    }))
  }

  const traversalHint =
    mode === 'inorder'
      ? 'Inorder: Left, Root, Right'
      : mode === 'preorder'
        ? 'Preorder: Root, Left, Right'
        : 'Postorder: Left, Right, Root'

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
        fields={[{ name: 'values', label: 'Level-order values', placeholder: '40, 20, 60, 10, 30, 50, 70' }]}
        actions={[
          { label: 'Run traversal', onClick: handleRun },
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
        canvasLabel={traversalHint}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={meta.pseudoCode}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
        canvasFooter={
          <span>Visit order: <span className="font-mono text-dsa-text">{visitOrder.length > 0 ? visitOrder.join(' → ') : 'pending'}</span></span>
        }
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
