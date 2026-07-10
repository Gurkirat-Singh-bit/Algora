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
  deleteAt,
  doublyBackwardTraverseSteps,
  doublyDeleteSteps,
  doublyForwardTraverseSteps,
  doublyInsertSteps,
  insertAt,
  resolveDeleteIndex,
  resolveInsertIndex,
  type PositionInput,
} from '@/lib/algorithms/linked-list-ops'
import {
  applyDagreLayout,
  baseEdgeStyle,
  buildFlowNode,
  infoOnlyStep,
  mapStepToNodeState,
  parseOptionalInteger,
  type LinkedListNodeViewData,
} from './helpers'

export type DoublyListMode = 'insert' | 'delete' | 'forwardTraverse' | 'backwardTraverse'

interface Props {
  mode: DoublyListMode
}

const modeMeta: Record<
  DoublyListMode,
  {
    title: string
    description: string
    complexity: ComplexityInfo[]
    pseudoCode: string[]
  }
> = {
  insert: {
    title: 'Doubly Linked List - Insert',
    description: 'Insert values at head, tail, or index while maintaining both prev and next pointers.',
    complexity: [
      { operation: 'Insert at Ends', time: 'O(1)', space: 'O(1)' },
      { operation: 'Insert by Index', time: 'O(n)', space: 'O(1)', note: 'Traversal to insertion point dominates.' },
    ],
    pseudoCode: [
      'target = resolvePosition(mode, index)',
      'traverse to target',
      'new.prev = predecessor',
      'new.next = successor',
      'patch predecessor.next and successor.prev',
    ],
  },
  delete: {
    title: 'Doubly Linked List - Delete',
    description: 'Remove nodes and reconnect neighbors in both forward and backward directions.',
    complexity: [
      { operation: 'Delete at Ends', time: 'O(1)', space: 'O(1)' },
      { operation: 'Delete by Index', time: 'O(n)', space: 'O(1)' },
    ],
    pseudoCode: [
      'target = resolvePosition(mode, index)',
      'traverse to target',
      'target.prev.next = target.next',
      'target.next.prev = target.prev',
      'clear head/tail boundaries when needed',
    ],
  },
  forwardTraverse: {
    title: 'Doubly Linked List - Forward Traverse',
    description: 'Visit each node from head to tail through next pointers.',
    complexity: [{ operation: 'Forward Traverse', time: 'O(n)', space: 'O(1)' }],
    pseudoCode: [
      'current = head',
      'while current != NULL:',
      '  visit current.value',
      '  current = current.next',
      'stop',
    ],
  },
  backwardTraverse: {
    title: 'Doubly Linked List - Backward Traverse',
    description: 'Visit each node from tail to head through prev pointers.',
    complexity: [{ operation: 'Backward Traverse', time: 'O(n)', space: 'O(1)' }],
    pseudoCode: [
      'current = tail',
      'while current != NULL:',
      '  visit current.value',
      '  current = current.prev',
      'stop',
    ],
  },
}

export function DoublyLinkedListVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [listValues, setListValues] = useState<number[]>([11, 23, 35])
  const [status, setStatus] = useState('Run an operation.')

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

    const steps = doublyInsertSteps(listValues, value, position)
    const insertIndex = resolveInsertIndex(listValues.length, position)
    setListValues(insertAt(listValues, value, insertIndex))
    runner.setSteps(steps)
  }

  const runDelete = (position: PositionInput): void => {
    const steps = doublyDeleteSteps(listValues, position)
    const deleteIndex = resolveDeleteIndex(listValues.length, position)

    if (deleteIndex !== null) {
      setListValues(deleteAt(listValues, deleteIndex))
    }

    runner.setSteps(steps)
  }

  const runForwardTraverse = (): void => {
    runner.setSteps(doublyForwardTraverseSteps(listValues))
  }

  const runBackwardTraverse = (): void => {
    runner.setSteps(doublyBackwardTraverseSteps(listValues))
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

    if (mode === 'forwardTraverse') {
      return {
        fields: [],
        actions: [
          {
            label: 'Forward Traverse',
            onClick: () => runForwardTraverse(),
            disabled: listValues.length === 0,
          },
        ],
      }
    }

    return {
      fields: [],
      actions: [
        {
          label: 'Backward Traverse',
          onClick: () => runBackwardTraverse(),
          disabled: listValues.length === 0,
        },
      ],
    }
  })()

  const flowGraph = useMemo<{ nodes: Node<LinkedListNodeViewData>[]; edges: Edge[] }>(() => {
    const nodes: Node<LinkedListNodeViewData>[] =
      listValues.length > 0
        ? listValues.map((value, index) =>
            buildFlowNode(
              `node-${index}`,
              String(value),
              mapStepToNodeState(index, currentStep),
              { x: 0, y: 0 }
            )
          )
        : [buildFlowNode('empty', 'EMPTY', 'default', { x: 0, y: 0 }, true)]

    const edges: Edge[] = []

    for (let index = 0; index < listValues.length - 1; index += 1) {
      const nextActive = Boolean(currentStep?.indices.includes(index))
      const nextPaint = baseEdgeStyle(nextActive)

      edges.push({
        id: `next-${index}`,
        source: `node-${index}`,
        target: `node-${index + 1}`,
        type: 'smoothstep',
        style: {
          ...nextPaint.style,
          strokeDasharray: undefined,
        },
        markerEnd: nextPaint.markerEnd,
        animated: currentStep?.action === 'traverse' && nextActive,
      })

      const prevActive =
        Boolean(currentStep?.indices.includes(index + 1)) ||
        (mode === 'backwardTraverse' && Boolean(currentStep?.indices.includes(index)))
      const prevPaint = baseEdgeStyle(prevActive)

      edges.push({
        id: `prev-${index}`,
        source: `node-${index + 1}`,
        target: `node-${index}`,
        type: 'smoothstep',
        style: {
          ...prevPaint.style,
          strokeDasharray: '7 5',
          strokeWidth: prevActive ? 2.3 : 1.8,
        },
        markerEnd: prevPaint.markerEnd,
        animated: mode === 'backwardTraverse' && currentStep?.action === 'traverse' && prevActive,
      })
    }

    return {
      nodes: applyDagreLayout(nodes, edges, 'LR'),
      edges,
    }
  }, [currentStep, listValues, mode])

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
        canvasLabel={`List · length ${listValues.length}`}
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
