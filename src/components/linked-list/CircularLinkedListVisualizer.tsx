'use client'

import { useMemo, useState } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'

import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizShell } from '@/components/shared/VizShell'
import { VizControlsBar } from '@/components/shared/VizControls'
import {
  DEFAULT_FIT_OPTIONS,
  DEFAULT_PRO_OPTIONS,
  STABLE_EDGE_TYPES,
  STABLE_NODE_TYPES,
} from '@/components/shared/reactflowConfig'
import { ControlPanel, type ActionDef, type FieldDef } from '@/components/shared/ControlPanel'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import type { ComplexityInfo } from '@/lib/types'
import {
  circularDeleteSteps,
  circularInsertSteps,
  circularTraverseSteps,
  deleteAt,
  insertAt,
  resolveDeleteIndex,
  resolveInsertIndex,
  type PositionInput,
} from '@/lib/algorithms/linked-list-ops'
import {
  FLOW_NODE_HEIGHT,
  FLOW_NODE_WIDTH,
  baseEdgeStyle,
  buildFlowNode,
  infoOnlyStep,
  mapStepToNodeState,
  parseOptionalInteger,
  type LinkedListNodeViewData,
} from './helpers'

export type CircularListMode = 'insert' | 'delete' | 'traverse'

interface Props {
  mode: CircularListMode
}

const modeMeta: Record<
  CircularListMode,
  {
    title: string
    description: string
    complexity: ComplexityInfo[]
    pseudoCode: string[]
  }
> = {
  insert: {
    title: 'Circular Linked List - Insert',
    description: 'Insert values while preserving the tail-to-head circular connection.',
    complexity: [
      { operation: 'Insert at Head/Tail', time: 'O(1)', space: 'O(1)' },
      { operation: 'Insert by Index', time: 'O(n)', space: 'O(1)' },
    ],
    pseudoCode: [
      'target = resolvePosition(mode, index)',
      'traverse to predecessor',
      'new.next = predecessor.next',
      'predecessor.next = new',
      'if inserting at head: tail.next = newHead',
    ],
  },
  delete: {
    title: 'Circular Linked List - Delete',
    description: 'Delete nodes and reconnect the cycle so traversal still loops back to head.',
    complexity: [
      { operation: 'Delete at Head/Tail', time: 'O(1)', space: 'O(1)' },
      { operation: 'Delete by Index', time: 'O(n)', space: 'O(1)' },
    ],
    pseudoCode: [
      'target = resolvePosition(mode, index)',
      'traverse to predecessor',
      'predecessor.next = target.next',
      'if deleting head: update head and tail.next',
      'if single node: head = NULL',
    ],
  },
  traverse: {
    title: 'Circular Linked List - Traverse',
    description: 'Visit each node once and stop when traversal returns to the head.',
    complexity: [{ operation: 'Traverse', time: 'O(n)', space: 'O(1)' }],
    pseudoCode: [
      'current = head',
      'do:',
      '  visit current.value',
      '  current = current.next',
      'while current != head',
    ],
  },
}

export function CircularLinkedListVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [listValues, setListValues] = useState<number[]>([7, 14, 28])
  const [status] = useState('Run an operation.')

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

  const currentStep = runner.currentStepData

  const buildPosition = (positionMode: PositionInput['mode'], rawIndex: string): PositionInput => ({
    mode: positionMode,
    index: parseOptionalInteger(rawIndex),
  })

  const runInsert = (rawValue: string, position: PositionInput): void => {
    const value = Number.parseFloat(rawValue)

    if (!Number.isFinite(value)) {
      runner.setSteps(infoOnlyStep('Enter a numeric value before inserting.'))
      return
    }

    const steps = circularInsertSteps(listValues, value, position)
    const insertIndex = resolveInsertIndex(listValues.length, position)
    setListValues(insertAt(listValues, value, insertIndex))
    runner.setSteps(steps)
  }

  const runDelete = (position: PositionInput): void => {
    const steps = circularDeleteSteps(listValues, position)
    const deleteIndex = resolveDeleteIndex(listValues.length, position)

    if (deleteIndex !== null) {
      setListValues(deleteAt(listValues, deleteIndex))
    }

    runner.setSteps(steps)
  }

  const runTraverse = (): void => {
    runner.setSteps(circularTraverseSteps(listValues))
  }

  const controlsByMode: { fields: FieldDef[]; actions: ActionDef[] } = (() => {
    if (mode === 'insert') {
      return {
        fields: [
          { name: 'value', label: 'Value', type: 'number', placeholder: '42' },
          { name: 'index', label: 'Index', type: 'number', placeholder: '2' },
        ],
        actions: [
          {
            label: 'Insert Head',
            onClick: values => runInsert(values.value ?? '', buildPosition('head', values.index ?? '')),
          },
          {
            label: 'Insert Tail',
            onClick: values => runInsert(values.value ?? '', buildPosition('tail', values.index ?? '')),
            variant: 'secondary',
          },
          {
            label: 'Insert At Index',
            onClick: values => runInsert(values.value ?? '', buildPosition('index', values.index ?? '')),
            variant: 'outline',
          },
        ],
      }
    }

    if (mode === 'delete') {
      return {
        fields: [{ name: 'index', label: 'Index', type: 'number', placeholder: '2' }],
        actions: [
          {
            label: 'Delete Head',
            onClick: values => runDelete(buildPosition('head', values.index ?? '')),
            variant: 'destructive',
            disabled: listValues.length === 0,
          },
          {
            label: 'Delete Tail',
            onClick: values => runDelete(buildPosition('tail', values.index ?? '')),
            variant: 'destructive',
            disabled: listValues.length === 0,
          },
          {
            label: 'Delete At Index',
            onClick: values => runDelete(buildPosition('index', values.index ?? '')),
            variant: 'outline',
            disabled: listValues.length === 0,
          },
        ],
      }
    }

    return {
      fields: [],
      actions: [
        {
          label: 'Traverse',
          onClick: () => runTraverse(),
          disabled: listValues.length === 0,
        },
      ],
    }
  })()

  const flowGraph = useMemo<{ nodes: Node<LinkedListNodeViewData>[]; edges: Edge[] }>(() => {
    if (listValues.length === 0) {
      return {
        nodes: [buildFlowNode('empty', 'EMPTY', 'default', { x: 260, y: 190 }, true)],
        edges: [],
      }
    }

    const centerX = 360
    const centerY = 240
    const radius = Math.max(130, 52 + listValues.length * 24)

    const nodes: Node<LinkedListNodeViewData>[] = listValues.map((value, index) => {
      const angle = (2 * Math.PI * index) / listValues.length - Math.PI / 2
      const x = centerX + radius * Math.cos(angle) - FLOW_NODE_WIDTH / 2
      const y = centerY + radius * Math.sin(angle) - FLOW_NODE_HEIGHT / 2

      return buildFlowNode(
        `node-${index}`,
        String(value),
        mapStepToNodeState(index, currentStep),
        { x, y }
      )
    })

    const edges: Edge[] = []

    if (listValues.length === 1) {
      const soloActive = Boolean(currentStep?.indices.includes(0))
      const edgePaint = baseEdgeStyle(soloActive)
      edges.push({
        id: 'loop-0',
        source: 'node-0',
        target: 'node-0',
        type: 'bezier',
        style: {
          ...edgePaint.style,
          strokeDasharray: '5 4',
        },
        markerEnd: edgePaint.markerEnd,
      })

      return { nodes, edges }
    }

    for (let index = 0; index < listValues.length - 1; index += 1) {
      const active = Boolean(currentStep?.indices.includes(index))
      const edgePaint = baseEdgeStyle(active)
      edges.push({
        id: `next-${index}`,
        source: `node-${index}`,
        target: `node-${index + 1}`,
        type: 'straight',
        style: edgePaint.style,
        markerEnd: edgePaint.markerEnd,
        animated: currentStep?.action === 'traverse' && active,
      })
    }

    const wrapActive =
      Boolean(currentStep?.indices.includes(listValues.length - 1)) ||
      Boolean(currentStep?.indices.includes(0) && currentStep?.action === 'found')
    const wrapPaint = baseEdgeStyle(wrapActive)

    edges.push({
      id: 'wrap-last-first',
      source: `node-${listValues.length - 1}`,
      target: 'node-0',
      type: 'bezier',
      style: {
        ...wrapPaint.style,
        strokeDasharray: '5 3',
        strokeWidth: wrapActive ? 2.6 : 2,
      },
      markerEnd: wrapPaint.markerEnd,
      animated: currentStep?.action === 'found',
    })

    return { nodes, edges }
  }, [currentStep, listValues])

  const modeContent = modeMeta[mode]

  const controls = (
    <div className="space-y-3">
      <ControlPanel fields={controlsByMode.fields} actions={controlsByMode.actions} />
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
      title={modeContent.title}
      description={modeContent.description}
      complexityData={modeContent.complexity}
      controls={controls}
    >
      <VizShell
        canvasLabel={`Circular list · length ${listValues.length}`}
        currentDescription={currentStep?.description}
        fallbackMessage={status}
        pseudoCode={modeContent.pseudoCode}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={currentStep?.pseudoCodeLine}
        onJump={runner.jumpToStep}
      >
        <ReactFlow
          nodes={flowGraph.nodes}
          edges={flowGraph.edges}
          nodeTypes={STABLE_NODE_TYPES}
          edgeTypes={STABLE_EDGE_TYPES}
          fitView
          fitViewOptions={DEFAULT_FIT_OPTIONS}
          nodesConnectable={false}
          nodesDraggable={false}
          elementsSelectable={false}
          zoomOnScroll
          panOnScroll
          proOptions={DEFAULT_PRO_OPTIONS}
        >
          <Background color="oklch(0.42 0.009 150 / 0.45)" gap={32} variant={BackgroundVariant.Dots} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </VizShell>
    </VisualizerLayout>
  )
}
