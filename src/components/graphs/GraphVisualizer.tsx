'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Check, Link2, Network, Pencil, Play, Plus, RefreshCcw, Trash2, Upload, Download, MousePointer2 } from 'lucide-react'

import { AdjacencyDisplay } from '@/components/graphs/AdjacencyDisplay'
import { Button } from '@/components/ui/button'
import { CodeHighlight } from '@/components/shared/CodeHighlight'
import { ControlPanel } from '@/components/shared/ControlPanel'
import { StepController } from '@/components/shared/StepController'
import { StepLog } from '@/components/shared/StepLog'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import {
  DEFAULT_FIT_OPTIONS,
  DEFAULT_PRO_OPTIONS,
  STABLE_EDGE_TYPES,
  STABLE_NODE_TYPES,
} from '@/components/shared/reactflowConfig'
import { useStepRunner } from '@/hooks/useStepRunner'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { useGraphStore, type GraphSnapshot } from '@/store/useGraphStore'
import { buildShareUrl, readShareFromHash } from '@/lib/share'
import {
  bfsSteps,
  buildAdjacencyFromSnapshot,
  dfsSteps,
} from '@/lib/algorithms/graph-ops'
import type { ComplexityInfo, NodeData, Step } from '@/lib/types'
import { cn } from '@/lib/utils'

export type GraphTraversalMode = 'bfs' | 'dfs'

interface Props {
  mode: GraphTraversalMode
}

const modeMeta: Record<
  GraphTraversalMode,
  { title: string; description: string; pseudoCode: string[]; complexity: ComplexityInfo[] }
> = {
  bfs: {
    title: 'Graph Traversal: Breadth-First Search',
    description: 'Visit graph level by level using a queue. Build your own graph or use the default.',
    pseudoCode: [
      'queue = [start], visited = {start}',
      'while queue not empty:',
      '  node = queue.dequeue()',
      '  for neighbor in adjacency[node]:',
      '    if neighbor not visited: visited.add(neighbor), queue.enqueue(neighbor)',
    ],
    complexity: [{ operation: 'BFS', time: 'O(V + E)', space: 'O(V)' }],
  },
  dfs: {
    title: 'Graph Traversal: Depth-First Search',
    description: 'Explore as deep as possible using a stack. Build your own graph or use the default.',
    pseudoCode: [
      'stack = [start], visited = {}',
      'while stack not empty:',
      '  node = stack.pop()',
      '  if node not visited: visit and push neighbors',
    ],
    complexity: [{ operation: 'DFS', time: 'O(V + E)', space: 'O(V)' }],
  },
}

function nodeStateFromStep(nodeId: number, step: Step | null): NodeData['state'] {
  if (!step || !step.indices.includes(nodeId)) return 'default'
  if (step.action === 'traverse') return 'found'
  if (step.action === 'compare') return 'comparing'
  if (step.action === 'insert') return 'inserting'
  return 'active'
}

function stateColor(state: NodeData['state']): string {
  if (state === 'active') return 'var(--dsa-active)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'comparing') return 'var(--dsa-compare)'
  if (state === 'inserting') return 'var(--dsa-insert)'
  return 'var(--dsa-elevated)'
}

function stateText(state: NodeData['state']): string {
  return state === 'default' ? 'var(--dsa-text-strong)' : 'var(--on-accent)'
}

function GraphCanvas({ mode }: Props) {
  const runner = useStepRunner()
  const {
    nodes: storeNodes,
    edges: storeEdges,
    directed,
    weighted,
    addNode,
    removeNode,
    moveNode,
    addEdge,
    removeEdge,
    setEdgeWeight,
    setDirected,
    setWeighted,
    selectedNodeId,
    setSelectedNode,
    reset,
    load,
  } = useGraphStore()

  const [editMode, setEditMode] = useState(false)
  const [status, setStatus] = useState('Run traversal or switch to Edit mode to build a custom graph.')
  const [linkCopied, setLinkCopied] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  useEffect(() => {
    const shared = readShareFromHash<GraphSnapshot>('g')
    if (shared && Array.isArray(shared.nodes) && Array.isArray(shared.edges)) {
      load(shared)
    }
  }, [load])

  const meta = modeMeta[mode]

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

  const adjacency = useMemo(
    () => buildAdjacencyFromSnapshot({ nodes: storeNodes, edges: storeEdges, directed }),
    [storeNodes, storeEdges, directed]
  )

  const visitedSet = useMemo(() => {
    const set = new Set<number>()
    if (runner.currentStep < 0) return set
    for (let i = 0; i <= runner.currentStep; i += 1) {
      const step = runner.steps[i]
      if (step && step.action === 'traverse') {
        for (const idx of step.indices) set.add(idx)
      }
    }
    return set
  }, [runner.steps, runner.currentStep])

  const activeEdgeKey = useMemo(() => {
    const step = runner.currentStepData
    if (!step || step.action !== 'compare' || step.indices.length < 2) return null
    const [a, b] = step.indices
    return directed ? `${a}->${b}` : a < b ? `${a}-${b}` : `${b}-${a}`
  }, [runner.currentStepData, directed])

  const flowNodes: Node[] = useMemo(() => {
    return storeNodes.map(n => {
      const state = nodeStateFromStep(n.id, runner.currentStepData)
      const visited = visitedSet.has(n.id)
      const isSelected = selectedNodeId === n.id
      return {
        id: String(n.id),
        position: { x: n.x, y: n.y },
        data: { label: `${n.id}` },
        draggable: true,
        connectable: editMode,
        selectable: true,
        style: {
          width: 56,
          height: 56,
          borderRadius: 999,
          border: isSelected
            ? '2px solid var(--dsa-primary-container)'
            : visited
              ? '2px solid var(--dsa-primary-container)'
              : state === 'default'
                ? '1px solid var(--dsa-border-strong)'
                : '1px solid transparent',
          background: stateColor(state),
          color: stateText(state),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono-stack)',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.04em',
          transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
        },
      }
    })
  }, [storeNodes, runner.currentStepData, visitedSet, selectedNodeId, editMode])

  const flowEdges: Edge[] = useMemo(() => {
    const traversedKeys = new Set<string>()
    if (runner.currentStep >= 0) {
      for (let i = 0; i <= runner.currentStep; i += 1) {
        const step = runner.steps[i]
        if (step && (step.action === 'compare' || step.action === 'traverse') && step.indices.length >= 2) {
          const [a, b] = step.indices
          const key = directed ? `${a}->${b}` : a < b ? `${a}-${b}` : `${b}-${a}`
          traversedKeys.add(key)
        }
      }
    }

    return storeEdges.map(e => {
      const isActive = activeEdgeKey === e.id
      const isTraversed = traversedKeys.has(e.id) && !isActive
      const label = weighted ? String(e.weight ?? 1) : undefined
      return {
        id: e.id,
        source: String(e.source),
        target: String(e.target),
        type: 'smoothstep',
        animated: isActive,
        markerEnd: directed ? { type: MarkerType.ArrowClosed, color: 'var(--dsa-outline)' } : undefined,
        label,
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: 'var(--dsa-card)', opacity: 0.9 },
        labelStyle: { fill: 'var(--dsa-text)', fontFamily: 'var(--font-mono-stack)', fontWeight: 600, fontSize: 11 },
        style: {
          stroke: isActive
            ? 'var(--dsa-primary-container)'
            : isTraversed
              ? 'var(--dsa-primary-dim)'
              : 'var(--dsa-outline)',
          strokeWidth: isActive ? 2.4 : isTraversed ? 2 : 1.6,
          opacity: isActive ? 1 : isTraversed ? 0.85 : 0.55,
        },
      }
    })
  }, [storeEdges, activeEdgeKey, runner.steps, runner.currentStep, directed, weighted])

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position && change.dragging === false) {
          const id = Number(change.id)
          moveNode(id, change.position.x, change.position.y)
        }
        if (change.type === 'remove') {
          removeNode(Number(change.id))
        }
        if (change.type === 'select' && change.selected) {
          setSelectedNode(Number(change.id))
        }
      }
    },
    [moveNode, removeNode, setSelectedNode]
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === 'remove') removeEdge(change.id)
      }
    },
    [removeEdge]
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      addEdge(Number(connection.source), Number(connection.target), weighted ? 1 : undefined)
    },
    [addEdge, weighted]
  )

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!editMode) {
        setSelectedNode(null)
        return
      }
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addNode(pos.x - 28, pos.y - 28)
    },
    [editMode, addNode, screenToFlowPosition, setSelectedNode]
  )

  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (!weighted) return
      const current = storeEdges.find(e => e.id === edge.id)?.weight ?? 1
      const input = window.prompt('Edge weight:', String(current))
      if (input === null) return
      const next = Number(input)
      if (Number.isFinite(next)) setEdgeWeight(edge.id, next)
    },
    [weighted, storeEdges, setEdgeWeight]
  )

  const handleRun = (values: Record<string, string>) => {
    const start = Number(values.start)
    if (!Number.isInteger(start)) {
      const message = 'Provide an integer start node.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
      return
    }
    if (!(start in adjacency)) {
      const message = `Node ${start} is not in the graph.`
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
      return
    }
    const steps = mode === 'bfs' ? bfsSteps(adjacency, start) : dfsSteps(adjacency, start)
    runner.setSteps(steps)
    setStatus(`${meta.title} generated ${steps.length} step(s) from start ${start}.`)
  }

  const handleAddNodeButton = () => {
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    const flowPos = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    addNode(flowPos.x - 28, flowPos.y - 28)
  }

  const handleExport = () => {
    const snapshot: GraphSnapshot = { nodes: storeNodes, edges: storeEdges, directed, weighted }
    const json = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'graph.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShareLink = async () => {
    const snapshot: GraphSnapshot = { nodes: storeNodes, edges: storeEdges, directed, weighted }
    const url = buildShareUrl('g', snapshot)
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setStatus('Permalink copied to clipboard.')
      setTimeout(() => setLinkCopied(false), 1800)
    } catch {
      window.prompt('Copy this share URL:', url)
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as GraphSnapshot
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error('Invalid graph schema')
        }
        load(parsed)
        setStatus(`Imported ${parsed.nodes.length} node(s), ${parsed.edges.length} edge(s).`)
      } catch (error) {
        setStatus(`Import failed: ${(error as Error).message}`)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const visitOrder = useMemo(
    () => runner.steps.filter(s => s.action === 'traverse' && s.indices.length > 0).map(s => s.indices[0]),
    [runner.steps]
  )

  const controls = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-md surface-low p-1">
          <Button
            variant={editMode ? 'ghost' : 'default'}
            size="sm"
            onClick={() => setEditMode(false)}
            className={cn('gap-2 px-3', !editMode && undefined)}
          >
            <Play className="h-3.5 w-3.5" strokeWidth={1.7} />
            Run
          </Button>
          <Button
            variant={editMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setEditMode(true)}
            className={cn('gap-2 px-3')}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.7} />
            Edit
          </Button>
        </div>

        <div className="h-6 w-px bg-[var(--ghost-border)]" />

        <Button variant="outline" size="sm" onClick={handleAddNodeButton} className="gap-1.5" disabled={!editMode}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.7} />
          Add Node
        </Button>
        <Button variant="outline" size="sm" onClick={() => reset()} className="gap-1.5">
          <RefreshCcw className="h-3.5 w-3.5" strokeWidth={1.7} />
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={() => load({ nodes: [], edges: [], directed, weighted })} className="gap-1.5">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
          Clear
        </Button>

        <div className="h-6 w-px bg-[var(--ghost-border)]" />

        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-dsa-muted hover:text-dsa-text">
          <input
            type="checkbox"
            checked={directed}
            onChange={event => setDirected(event.target.checked)}
            className="accent-[var(--primary-container)]"
          />
          Directed
        </label>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-dsa-muted hover:text-dsa-text">
          <input
            type="checkbox"
            checked={weighted}
            onChange={event => setWeighted(event.target.checked)}
            className="accent-[var(--primary-container)]"
          />
          Weighted
        </label>

        <div className="h-6 w-px bg-[var(--ghost-border)]" />

        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" strokeWidth={1.7} />
          Export
        </Button>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md ghost-outline bg-transparent px-3 py-1.5 text-xs text-dsa-muted hover:text-dsa-text">
          <Upload className="h-3.5 w-3.5" strokeWidth={1.7} />
          Import
          <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
        <Button variant="outline" size="sm" onClick={handleShareLink} className="gap-1.5">
          {linkCopied ? <Check className="h-3.5 w-3.5" strokeWidth={1.7} /> : <Link2 className="h-3.5 w-3.5" strokeWidth={1.7} />}
          {linkCopied ? 'Copied' : 'Share'}
        </Button>
      </div>

      <div className="rounded-md surface-low p-3 text-xs text-dsa-muted">
        {editMode ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><MousePointer2 className="h-3.5 w-3.5" /> Click canvas = add node</span>
            <span>Drag handle from one node onto another = connect</span>
            <span>Select + Backspace = delete</span>
            {weighted && <span>Double-click edge = set weight</span>}
          </div>
        ) : (
          <span>Drag nodes to rearrange. Switch to <span className="text-dsa-text">Edit</span> to modify graph topology.</span>
        )}
      </div>

      <ControlPanel
        fields={[{ name: 'start', label: 'Start Node', type: 'number', placeholder: '0' }]}
        actions={[{ label: `Run ${mode.toUpperCase()}`, onClick: handleRun }]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-3 rounded-md surface-low p-3">
          <StepController
            isPlaying={runner.isPlaying}
            isComplete={runner.isComplete}
            hasSteps={runner.steps.length > 0}
            speed={runner.speed}
            onPlay={runner.play}
            onPause={runner.pause}
            onStepForward={runner.stepForward}
            onStepBackward={runner.stepBackward}
            onReset={runner.reset}
            onSpeedChange={runner.setSpeed}
          />
          <p className="text-xs text-dsa-muted">{status}</p>
          <p className="text-xs text-dsa-muted">
            <span className="text-dsa-text">Visit order:</span> {visitOrder.length ? visitOrder.join(' → ') : 'pending'}
          </p>
          <p className="text-[11px] text-dsa-muted">
            Shortcuts: <kbd className="rounded bg-dsa-card px-1">Space</kbd> play/pause ·{' '}
            <kbd className="rounded bg-dsa-card px-1">←/→</kbd> step ·{' '}
            <kbd className="rounded bg-dsa-card px-1">R</kbd> reset ·{' '}
            <kbd className="rounded bg-dsa-card px-1">1-5</kbd> speed
          </p>
        </div>

        <div className="space-y-3">
          <CodeHighlight lines={meta.pseudoCode} highlightLine={runner.currentStepData?.pseudoCodeLine} />
          <StepLog steps={runner.steps} currentStep={runner.currentStep} onJump={runner.jumpToStep} />
        </div>
      </div>
    </div>
  )

  return (
    <VisualizerLayout
      title={meta.title}
      description={meta.description}
      complexityData={meta.complexity}
      controls={controls}
    >
      <div className="grid h-full min-h-80 grid-cols-1 gap-3 p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div ref={wrapperRef} className="relative h-105 rounded-md surface-low md:h-125">
          {editMode && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-dsa-primary-container bg-dsa-card px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-primary-container">
              <Pencil className="h-3 w-3" strokeWidth={1.8} />
              Edit
            </div>
          )}
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={STABLE_NODE_TYPES}
            edgeTypes={STABLE_EDGE_TYPES}
            fitView
            fitViewOptions={DEFAULT_FIT_OPTIONS}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onPaneClick={handlePaneClick}
            onEdgeDoubleClick={handleEdgeDoubleClick}
            nodesDraggable
            nodesConnectable={editMode}
            elementsSelectable
            deleteKeyCode={editMode ? ['Backspace', 'Delete'] : null}
            connectionRadius={32}
            proOptions={DEFAULT_PRO_OPTIONS}
          >
            <Background color="rgba(131,148,143,0.18)" gap={28} variant={BackgroundVariant.Dots} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <div className="space-y-3">
          <div className="rounded-md surface-low p-3">
            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-category text-dsa-muted">
              <Network className="h-3.5 w-3.5" strokeWidth={1.7} /> Graph stats
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Stat label="Nodes" value={storeNodes.length} />
              <Stat label="Edges" value={storeEdges.length} />
              <Stat label="Visited" value={visitedSet.size} />
            </div>
          </div>
          <AdjacencyDisplay adjacency={adjacency} activeNode={runner.currentStepData?.indices[0] ?? null} />
        </div>
      </div>
    </VisualizerLayout>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-dsa-card px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-category text-dsa-muted">{label}</div>
      <div className="text-base font-semibold tabular-nums text-dsa-text">{value}</div>
    </div>
  )
}

export function GraphVisualizer(props: Props) {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  )
}
