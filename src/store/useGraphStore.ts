'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface GraphNodeRecord {
  id: number
  x: number
  y: number
  label?: string
}

export interface GraphEdgeRecord {
  id: string
  source: number
  target: number
  weight?: number
}

export interface GraphSnapshot {
  nodes: GraphNodeRecord[]
  edges: GraphEdgeRecord[]
  directed: boolean
  weighted: boolean
}

interface GraphState extends GraphSnapshot {
  selectedNodeId: number | null
  load: (snapshot: GraphSnapshot) => void
  reset: () => void
  addNode: (x: number, y: number) => number
  removeNode: (id: number) => void
  moveNode: (id: number, x: number, y: number) => void
  addEdge: (source: number, target: number, weight?: number) => void
  removeEdge: (id: string) => void
  setEdgeWeight: (id: string, weight: number) => void
  setDirected: (directed: boolean) => void
  setWeighted: (weighted: boolean) => void
  setSelectedNode: (id: number | null) => void
}

const DEFAULT_GRAPH: GraphSnapshot = {
  nodes: [
    { id: 0, x: 110, y: 120 },
    { id: 1, x: 300, y: 60 },
    { id: 2, x: 530, y: 92 },
    { id: 3, x: 205, y: 255 },
    { id: 4, x: 410, y: 235 },
    { id: 5, x: 620, y: 255 },
    { id: 6, x: 760, y: 130 },
  ],
  edges: [
    { id: '0-1', source: 0, target: 1 },
    { id: '0-2', source: 0, target: 2 },
    { id: '1-3', source: 1, target: 3 },
    { id: '1-4', source: 1, target: 4 },
    { id: '2-5', source: 2, target: 5 },
    { id: '2-6', source: 2, target: 6 },
    { id: '4-5', source: 4, target: 5 },
  ],
  directed: false,
  weighted: false,
}

function edgeId(source: number, target: number, directed: boolean): string {
  if (directed) return `${source}->${target}`
  return source < target ? `${source}-${target}` : `${target}-${source}`
}

export const useGraphStore = create<GraphState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_GRAPH,
      selectedNodeId: null,
      load: snapshot =>
        set({
          nodes: snapshot.nodes,
          edges: snapshot.edges,
          directed: snapshot.directed,
          weighted: snapshot.weighted,
          selectedNodeId: null,
        }),
      reset: () => set({ ...DEFAULT_GRAPH, selectedNodeId: null }),
      addNode: (x, y) => {
        const nodes = get().nodes
        const id = nodes.length === 0 ? 0 : Math.max(...nodes.map(n => n.id)) + 1
        set({ nodes: [...nodes, { id, x, y }] })
        return id
      },
      removeNode: id => {
        set(state => ({
          nodes: state.nodes.filter(n => n.id !== id),
          edges: state.edges.filter(e => e.source !== id && e.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        }))
      },
      moveNode: (id, x, y) => {
        set(state => ({
          nodes: state.nodes.map(n => (n.id === id ? { ...n, x, y } : n)),
        }))
      },
      addEdge: (source, target, weight) => {
        if (source === target) return
        const { directed, edges } = get()
        const id = edgeId(source, target, directed)
        if (edges.some(e => e.id === id)) return
        set({ edges: [...edges, { id, source, target, ...(weight !== undefined ? { weight } : {}) }] })
      },
      removeEdge: id => {
        set(state => ({ edges: state.edges.filter(e => e.id !== id) }))
      },
      setEdgeWeight: (id, weight) => {
        set(state => ({
          edges: state.edges.map(e => (e.id === id ? { ...e, weight } : e)),
        }))
      },
      setDirected: directed => {
        set(state => {
          const remapped = state.edges.map(e => ({ ...e, id: edgeId(e.source, e.target, directed) }))
          const seen = new Set<string>()
          const dedup = remapped.filter(e => {
            if (seen.has(e.id)) return false
            seen.add(e.id)
            return true
          })
          return { directed, edges: dedup }
        })
      },
      setWeighted: weighted => {
        set(state => ({
          weighted,
          edges: state.edges.map(e =>
            weighted && e.weight === undefined ? { ...e, weight: 1 } : e
          ),
        }))
      },
      setSelectedNode: id => set({ selectedNodeId: id }),
    }),
    {
      name: 'dsa-graph',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
