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
  insertAt,
  resolveDeleteIndex,
  resolveInsertIndex,
  singlyCreateSteps,
  singlyDeleteSteps,
  singlyInsertSteps,
  singlyTraverseSteps,
  type PositionInput,
} from '@/lib/algorithms/linked-list-ops'
import {
  applyDagreLayout,
  baseEdgeStyle,
  buildFlowNode,
  infoOnlyStep,
  mapStepToNodeState,
  parseNumberList,
  parseOptionalInteger,
  type LinkedListNodeViewData,
} from './helpers'

export type SinglyListMode = 'create' | 'insert' | 'delete' | 'traverse'

interface Props {
  mode: SinglyListMode
}

const modeMeta: Record<
  SinglyListMode,
  { title: string; description: string; complexity: ComplexityInfo[]; pseudoCode: string[] }
> = {
  create: {
    title: 'Singly Linked List · Create',
    description: 'Build a list and link each node forward, ending at NULL.',
    complexity: [
      { operation: 'Create', time: 'O(n)', space: 'O(n)' },
    ],
    pseudoCode: [
      'head = NULL',
      'for value in input:',
      '  create node(value)',
      '  append at tail',
      'tail.next = NULL',
    ],
  },
  insert: {
    title: 'Singly Linked List · Insert',
    description: 'Insert at head, tail, or any index. Forward links preserved.',
    complexity: [
      { operation: 'Head insert', time: 'O(1)', space: 'O(1)' },
      { operation: 'Indexed insert', time: 'O(n)', space: 'O(1)' },
    ],
    pseudoCode: [
      'target = resolve(head, mode, index)',
      'walk to predecessor of target',
      'newNode.next = target',
      'predecessor.next = newNode',
      'if target was head: head = newNode',
    ],
  },
  delete: {
    title: 'Singly Linked List · Delete',
    description: 'Delete head, tail, or index. Reconnect surrounding nodes.',
    complexity: [
      { operation: 'Head delete', time: 'O(1)', space: 'O(1)' },
      { operation: 'Indexed delete', time: 'O(n)', space: 'O(1)' },
    ],
    pseudoCode: [
      'target = resolve(head, mode, index)',
      'walk to predecessor',
      'predecessor.next = target.next',
      'if deleting head: head = head.next',
      'free target',
    ],
  },
  traverse: {
    title: 'Singly Linked List · Traverse',
    description: 'Walk from head until current = NULL.',
    complexity: [{ operation: 'Traverse', time: 'O(n)', space: 'O(1)' }],
    pseudoCode: [
      'current = head',
      'while current != NULL:',
      '  visit current.value',
      '  current = current.next',
    ],
  },
}

export function SinglyLinkedListVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [listValues, setListValues] = useState<number[]>([12, 24, 36])
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

  const runCreate = (rawValues: string) => {
    const parsedValues = parseNumberList(rawValues)
    if (parsedValues.length === 0) {
      runner.setSteps(infoOnlyStep('Enter at least one number.'))
      setStatus('Provide values like 10, 20, 30.')
      return
    }
    setListValues(parsedValues)
    runner.setSteps(singlyCreateSteps(parsedValues))
    setStatus(`Created list of ${parsedValues.length} node${parsedValues.length === 1 ? '' : 's'}.`)
  }

  const runInsert = (rawValue: string, position: PositionInput) => {
    const value = Number.parseFloat(rawValue)
    if (!Number.isFinite(value)) {
      runner.setSteps(infoOnlyStep('Enter a numeric value.'))
      setStatus('Insert needs a numeric value.')
      return
    }
    const steps = singlyInsertSteps(listValues, value, position)
    const insertIndex = resolveInsertIndex(listValues.length, position)
    const nextValues = insertAt(listValues, value, insertIndex)
    setListValues(nextValues)
    runner.setSteps(steps)
    setStatus(`Insert ${value} at ${position.mode}.`)
  }

  const runDelete = (position: PositionInput) => {
    const steps = singlyDeleteSteps(listValues, position)
    const deleteIndex = resolveDeleteIndex(listValues.length, position)
    if (deleteIndex !== null) {
      setListValues(deleteAt(listValues, deleteIndex))
    }
    runner.setSteps(steps)
    setStatus(`Delete from ${position.mode}.`)
  }

  const runTraverse = () => {
    runner.setSteps(singlyTraverseSteps(listValues))
    setStatus(`Traverse ${listValues.length} node${listValues.length === 1 ? '' : 's'}.`)
  }

  const controlsByMode: { fields: FieldDef[]; actions: ActionDef[] } = (() => {
    if (mode === 'create') {
      return {
        fields: [{ name: 'values', label: 'Values', placeholder: '10, 20, 30' }],
        actions: [{ label: 'Create list', onClick: values => runCreate(values.values ?? '') }],
      }
    }
    if (mode === 'insert') {
      return {
        fields: [
          { name: 'value', label: 'Value', type: 'number', placeholder: '42' },
          { name: 'index', label: 'Index', type: 'number', placeholder: '2' },
        ],
        actions: [
          { label: 'Head', onClick: v => runInsert(v.value ?? '', buildPosition('head', v.index ?? '')) },
          { label: 'Tail', onClick: v => runInsert(v.value ?? '', buildPosition('tail', v.index ?? '')), variant: 'secondary' },
          { label: 'At index', onClick: v => runInsert(v.value ?? '', buildPosition('index', v.index ?? '')), variant: 'outline' },
        ],
      }
    }
    if (mode === 'delete') {
      return {
        fields: [{ name: 'index', label: 'Index', type: 'number', placeholder: '2' }],
        actions: [
          { label: 'Head', onClick: v => runDelete(buildPosition('head', v.index ?? '')), variant: 'destructive', disabled: listValues.length === 0 },
          { label: 'Tail', onClick: v => runDelete(buildPosition('tail', v.index ?? '')), variant: 'destructive', disabled: listValues.length === 0 },
          { label: 'At index', onClick: v => runDelete(buildPosition('index', v.index ?? '')), variant: 'outline', disabled: listValues.length === 0 },
        ],
      }
    }
    return {
      fields: [],
      actions: [{ label: 'Traverse', onClick: () => runTraverse(), disabled: listValues.length === 0 }],
    }
  })()

  const flowGraph = useMemo<{ nodes: Node<LinkedListNodeViewData>[]; edges: Edge[] }>(() => {
    const nodes: Node<LinkedListNodeViewData>[] = listValues.map((value, index) =>
      buildFlowNode(`node-${index}`, String(value), mapStepToNodeState(index, currentStep), { x: 0, y: 0 })
    )
    nodes.push(buildFlowNode('null-node', 'NULL', 'default', { x: 0, y: 0 }, true))

    const edges: Edge[] = []
    for (let index = 0; index < listValues.length - 1; index += 1) {
      const active = Boolean(currentStep?.indices.includes(index))
      const paint = baseEdgeStyle(active)
      edges.push({
        id: `next-${index}`,
        source: `node-${index}`,
        target: `node-${index + 1}`,
        type: 'smoothstep',
        style: paint.style,
        markerEnd: paint.markerEnd,
        animated: currentStep?.action === 'traverse' && active,
      })
    }
    if (listValues.length > 0) {
      const tailIndex = listValues.length - 1
      const paint = baseEdgeStyle(Boolean(currentStep?.indices.includes(tailIndex)))
      edges.push({
        id: 'tail-null',
        source: `node-${tailIndex}`,
        target: 'null-node',
        type: 'smoothstep',
        style: { ...paint.style, strokeDasharray: '6 4' },
        markerEnd: paint.markerEnd,
      })
    }
    return { nodes: applyDagreLayout(nodes, edges, 'LR'), edges }
  }, [currentStep, listValues])

  const meta = modeMeta[mode]

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
      title={meta.title}
      description={meta.description}
      complexityData={meta.complexity}
      controls={controls}
    >
      <VizShell
        canvasLabel={`List · length ${listValues.length}`}
        currentDescription={currentStep?.description}
        fallbackMessage={status}
        pseudoCode={meta.pseudoCode}
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
