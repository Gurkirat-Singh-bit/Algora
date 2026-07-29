'use client'

import { useMemo, useState } from 'react'
import dagre from '@dagrejs/dagre'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'

import {
  createTrie,
  listTrieWords,
  runTrieOperation,
  triePseudoCode,
  type TrieMode,
  type TrieSnapshot,
} from '@/lib/algorithms/trie-ops'
import type { ComplexityInfo, NodeData, Step } from '@/lib/types'
import { ControlPanel } from '@/components/shared/ControlPanel'
import {
  DEFAULT_FIT_OPTIONS,
  DEFAULT_PRO_OPTIONS,
  STABLE_EDGE_TYPES,
  STABLE_NODE_TYPES,
} from '@/components/shared/reactflowConfig'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizControlsBar } from '@/components/shared/VizControls'
import { VizShell } from '@/components/shared/VizShell'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { useStepRunner } from '@/hooks/useStepRunner'

interface Props {
  mode: TrieMode
}

const INITIAL_WORDS = ['car', 'card', 'care', 'cat', 'dog']
const INITIAL_TRIE = createTrie(INITIAL_WORDS)

const meta: Record<
  TrieMode,
  { title: string; description: string; complexity: ComplexityInfo[]; action: string }
> = {
  insert: {
    title: 'Trie Insert',
    description: 'Share existing prefixes, create missing character nodes, and mark the completed word.',
    complexity: [{ operation: 'Insert', time: 'O(L)', space: 'O(L)', note: 'L is the word length.' }],
    action: 'Insert word',
  },
  search: {
    title: 'Trie Search',
    description: 'Follow one character edge per input letter, then verify the terminal marker.',
    complexity: [{ operation: 'Search', time: 'O(L)', space: 'O(1)' }],
    action: 'Search word',
  },
  delete: {
    title: 'Trie Delete',
    description: 'Remove a terminal marker and prune only the suffix nodes no other word needs.',
    complexity: [{ operation: 'Delete', time: 'O(L)', space: 'O(L)' }],
    action: 'Delete word',
  },
}

function stateForNode(nodeId: number, step: Step | null): NodeData['state'] {
  if (!step?.indices.includes(nodeId)) return 'default'
  if (step.action === 'compare') return 'comparing'
  if (step.action === 'found') return 'found'
  if (step.action === 'insert') return 'inserting'
  if (step.action === 'delete') return 'deleting'
  return 'active'
}

function stateColor(state: NodeData['state']): string {
  if (state === 'comparing') return 'var(--dsa-compare)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'inserting') return 'var(--dsa-insert)'
  if (state === 'deleting') return 'var(--dsa-delete)'
  if (state === 'active') return 'var(--dsa-active)'
  return 'var(--dsa-elevated)'
}

function buildFlow(snapshot: TrieSnapshot, step: Step | null): { nodes: Node[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: 'TB', ranksep: 70, nodesep: 30, marginx: 24, marginy: 24 })

  for (const node of snapshot.nodes) {
    graph.setNode(String(node.id), { width: 52, height: 52 })
  }
  for (const node of snapshot.nodes) {
    if (node.parentId !== null) graph.setEdge(String(node.parentId), String(node.id))
  }
  dagre.layout(graph)

  const nodes: Node[] = snapshot.nodes.map(node => {
    const position = graph.node(String(node.id)) as { x: number; y: number }
    const state = stateForNode(node.id, step)
    const active = state !== 'default'
    return {
      id: String(node.id),
      position: { x: position.x - 26, y: position.y - 26 },
      data: { label: node.id === 0 ? 'root' : node.terminal ? `${node.character} •` : node.character },
      draggable: false,
      selectable: false,
      ariaLabel: node.id === 0
        ? 'Trie root'
        : `Character ${node.character}${node.terminal ? ', word ending' : ''}`,
      style: {
        minWidth: node.id === 0 ? 64 : 52,
        width: node.id === 0 ? 64 : 52,
        height: 52,
        borderRadius: node.id === 0 ? 8 : 999,
        border: node.terminal
          ? '3px double var(--dsa-primary-container)'
          : active
            ? '1px solid transparent'
            : '1px solid var(--dsa-border-strong)',
        background: stateColor(state),
        color: active ? 'var(--on-accent)' : 'var(--dsa-text-strong)',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-mono-stack)',
        fontWeight: 600,
        fontSize: node.id === 0 ? 11 : 15,
      },
    }
  })

  const activeEdge = step?.edge
  const edges: Edge[] = snapshot.nodes.flatMap(node => {
    if (node.parentId === null) return []
    const active = activeEdge?.[0] === node.parentId && activeEdge[1] === node.id
    return [{
      id: `${node.parentId}-${node.id}`,
      source: String(node.parentId),
      target: String(node.id),
      type: 'smoothstep',
      animated: active,
      style: {
        stroke: active ? 'var(--dsa-primary-container)' : 'var(--dsa-outline)',
        strokeWidth: active ? 2.2 : 1.5,
        opacity: active ? 1 : 0.65,
      },
    }]
  })

  return { nodes, edges }
}

export function TrieVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [trie, setTrie] = useState<TrieSnapshot>(INITIAL_TRIE)
  const [snapshots, setSnapshots] = useState<TrieSnapshot[]>([INITIAL_TRIE])
  const [status, setStatus] = useState('Run an operation to trace a word character by character.')
  const presentation = meta[mode]

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

  const displayedTrie = snapshots[runner.currentStep] ?? trie
  const flow = useMemo(
    () => buildFlow(displayedTrie, runner.currentStepData),
    [displayedTrie, runner.currentStepData]
  )
  const words = useMemo(() => listTrieWords(displayedTrie), [displayedTrie])

  const handleRun = (values: Record<string, string>) => {
    try {
      const run = runTrieOperation(trie, values.word ?? '', mode)
      setTrie(run.nextTrie)
      setSnapshots(run.snapshots)
      runner.setSteps(run.steps)
      setStatus(`${presentation.action}: ${run.word}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid word.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
    }
  }

  const resetTrie = () => {
    const next = createTrie(INITIAL_WORDS)
    setTrie(next)
    setSnapshots([next])
    runner.setSteps([])
    setStatus('Restored the example trie.')
  }

  return (
    <VisualizerLayout
      title={presentation.title}
      description={presentation.description}
      complexityData={presentation.complexity}
      controls={(
        <div className="space-y-3">
          <ControlPanel
            fields={[{ name: 'word', label: 'Word', placeholder: 'cart' }]}
            actions={[
              { label: presentation.action, onClick: handleRun },
              { label: 'Reset trie', onClick: resetTrie, variant: 'outline' },
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
      )}
    >
      <VizShell
        canvasLabel={`Prefix tree · ${words.length} words`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={triePseudoCode[mode]}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
        canvasFooter={`Stored words: ${words.length ? words.join(', ') : 'none'}`}
      >
        <ReactFlow
          nodes={flow.nodes}
          edges={flow.edges}
          nodeTypes={STABLE_NODE_TYPES}
          edgeTypes={STABLE_EDGE_TYPES}
          fitView
          fitViewOptions={DEFAULT_FIT_OPTIONS}
          nodesConnectable={false}
          nodesDraggable={false}
          elementsSelectable={false}
          minZoom={0.3}
          maxZoom={1.6}
          proOptions={DEFAULT_PRO_OPTIONS}
        >
          <Background color="oklch(0.42 0.009 150 / 0.4)" gap={28} variant={BackgroundVariant.Dots} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </VizShell>
    </VisualizerLayout>
  )
}
