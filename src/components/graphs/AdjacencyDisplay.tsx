'use client'

import { useMemo, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildAdjacencyMatrix, type GraphAdjList } from '@/lib/algorithms/graph-ops'

interface Props {
  adjacency: GraphAdjList
  activeNode: number | null
}

type ViewMode = 'list' | 'matrix'

export function AdjacencyDisplay({ adjacency, activeNode }: Props) {
  const [view, setView] = useState<ViewMode>('list')

  const nodes = useMemo(() => Object.keys(adjacency).map(Number).sort((a, b) => a - b), [adjacency])
  const matrix = useMemo(() => buildAdjacencyMatrix(nodes, adjacency), [nodes, adjacency])

  return (
    <div className="rounded-lg border border-dsa-border bg-dsa-panel/45 p-3">
      <Tabs value={view} onValueChange={value => setView(value as ViewMode)} className="space-y-3">
        <TabsList className="grid w-full max-w-52 grid-cols-2">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="matrix">Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-2">
          {nodes.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-dsa-muted">
              Add a node to build the adjacency view.
            </p>
          ) : nodes.map(node => (
            <div
              key={node}
              className="rounded-md px-2 py-1.5 text-xs"
              style={{
                background:
                  activeNode === node
                    ? 'color-mix(in srgb, var(--dsa-primary-container) 20%, var(--dsa-panel))'
                    : 'transparent',
              }}
            >
              <span className="font-mono font-semibold text-dsa-text">{node}</span>
              <span className="font-mono text-dsa-muted">: [{(adjacency[node] ?? []).join(', ')}]</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="matrix" className="max-w-full overflow-x-auto">
          {nodes.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-dsa-muted">
              Add a node to build the matrix.
            </p>
          ) : (
          <table className="w-full min-w-max border-collapse font-mono text-xs">
            <caption className="sr-only">Graph adjacency matrix</caption>
            <thead>
              <tr>
                <th className="border border-dsa-border px-2 py-1 text-dsa-muted">#</th>
                {nodes.map(col => (
                  <th key={col} className="border border-dsa-border px-2 py-1 text-dsa-muted">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map((rowNode, rowIndex) => (
                <tr key={rowNode}>
                  <th
                    className="border border-dsa-border px-2 py-1 text-dsa-muted"
                    style={{
                      background:
                        activeNode === rowNode
                          ? 'color-mix(in srgb, var(--dsa-primary-container) 20%, var(--dsa-panel))'
                          : undefined,
                    }}
                  >
                    {rowNode}
                  </th>
                  {nodes.map((colNode, colIndex) => {
                    const activeCell = activeNode === rowNode || activeNode === colNode
                    return (
                      <td
                        key={`${rowNode}-${colNode}`}
                        className="border border-dsa-border px-2 py-1 text-center"
                        style={{
                          color: matrix[rowIndex][colIndex] ? 'var(--dsa-text)' : 'var(--dsa-muted)',
                          background: activeCell ? 'rgba(140,191,98,0.12)' : undefined,
                        }}
                      >
                        {matrix[rowIndex][colIndex]}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
