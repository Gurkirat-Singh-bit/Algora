import type { Step } from '@/lib/types'

export type HeapType = 'min' | 'max'

export interface HeapRun {
  steps: Step[]
  snapshots: number[][]
  nextHeap: number[]
  extracted?: number
}

export const heapInsertPseudoCode = [
  'heap.push(value)',
  'index = heap.length - 1',
  'while index > 0 and heap[index] violates heap-order with parent:',
  '  swap(heap[index], heap[parent])',
  '  index = parent',
]

export const heapExtractPseudoCode = [
  'if heap empty: return',
  'swap(heap[0], heap[last])',
  'remove last (old root)',
  'siftDown from index 0',
]

function shouldSwap(parent: number, child: number, type: HeapType): boolean {
  return type === 'min' ? parent > child : parent < child
}

function clone(values: number[]): number[] {
  return [...values]
}

export function buildHeapArray(values: number[], type: HeapType): number[] {
  const heap = clone(values)

  const siftDown = (index: number): void => {
    let current = index

    while (true) {
      const left = current * 2 + 1
      const right = current * 2 + 2
      let target = current

      if (left < heap.length && shouldSwap(heap[target], heap[left], type)) {
        target = left
      }

      if (right < heap.length && shouldSwap(heap[target], heap[right], type)) {
        target = right
      }

      if (target === current) {
        break
      }

      ;[heap[current], heap[target]] = [heap[target], heap[current]]
      current = target
    }
  }

  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i -= 1) {
    siftDown(i)
  }

  return heap
}

export function heapInsertSteps(heap: number[], value: number, type: HeapType): HeapRun {
  const working = clone(heap)
  const steps: Step[] = []
  const snapshots: number[][] = [clone(working)]

  working.push(value)
  let index = working.length - 1

  steps.push({
    action: 'insert',
    indices: [index],
    description: `Insert ${value} at index ${index}.`,
    pseudoCodeLine: 0,
  })
  snapshots.push(clone(working))

  while (index > 0) {
    const parent = Math.floor((index - 1) / 2)

    steps.push({
      action: 'compare',
      indices: [parent, index],
      description: `Compare parent ${working[parent]} with child ${working[index]}.`,
      pseudoCodeLine: 2,
    })

    if (!shouldSwap(working[parent], working[index], type)) {
      break
    }

    ;[working[parent], working[index]] = [working[index], working[parent]]
    steps.push({
      action: 'swap',
      indices: [parent, index],
      description: `Swap to restore ${type}-heap order.`,
      pseudoCodeLine: 3,
    })
    snapshots.push(clone(working))

    index = parent
  }

  steps.push({ action: 'info', indices: [index], description: 'Insert complete.' })
  return { steps, snapshots, nextHeap: working }
}

export function heapExtractSteps(heap: number[], type: HeapType): HeapRun {
  const working = clone(heap)
  const steps: Step[] = []
  const snapshots: number[][] = [clone(working)]

  if (working.length === 0) {
    return {
      steps: [{ action: 'info', indices: [], description: 'Heap is empty. Nothing to extract.', pseudoCodeLine: 0 }],
      snapshots,
      nextHeap: working,
    }
  }

  const rootValue = working[0]
  const lastIndex = working.length - 1

  steps.push({
    action: 'highlight',
    indices: [0],
    description: `Extract root ${rootValue}.`,
    pseudoCodeLine: 1,
  })

  ;[working[0], working[lastIndex]] = [working[lastIndex], working[0]]
  steps.push({
    action: 'swap',
    indices: [0, lastIndex],
    description: 'Swap root with last element.',
    pseudoCodeLine: 1,
  })
  snapshots.push(clone(working))

  working.pop()
  steps.push({
    action: 'delete',
    indices: [lastIndex],
    description: `Remove former root ${rootValue}.`,
    pseudoCodeLine: 2,
  })
  snapshots.push(clone(working))

  let current = 0
  while (current < working.length) {
    const left = current * 2 + 1
    const right = current * 2 + 2
    let target = current

    if (left < working.length && shouldSwap(working[target], working[left], type)) {
      target = left
    }

    if (right < working.length && shouldSwap(working[target], working[right], type)) {
      target = right
    }

    if (target === current) {
      break
    }

    steps.push({
      action: 'compare',
      indices: [current, target],
      description: `Heap-order violated at index ${current}.`,
      pseudoCodeLine: 3,
    })

    ;[working[current], working[target]] = [working[target], working[current]]
    steps.push({
      action: 'swap',
      indices: [current, target],
      description: `Swap indices ${current} and ${target}.`,
      pseudoCodeLine: 3,
    })
    snapshots.push(clone(working))

    current = target
  }

  steps.push({ action: 'info', indices: [0], description: `Extract complete. Removed ${rootValue}.` })

  return {
    steps,
    snapshots,
    nextHeap: working,
    extracted: rootValue,
  }
}
