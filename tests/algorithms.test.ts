import { describe, expect, test } from 'bun:test'

import {
  buildBstFromValues,
  removeFromValues,
} from '@/lib/algorithms/bst-ops'
import {
  buildHeapArray,
  heapExtractSteps,
  heapInsertSteps,
  type HeapType,
} from '@/lib/algorithms/heap-ops'
import {
  createHashTable,
  hashIndex,
  runHashTableOperation,
} from '@/lib/algorithms/hash-table-ops'
import {
  factorialCallStackSteps,
  fibonacciCallTreeSteps,
} from '@/lib/algorithms/recursion-ops'
import { runSearchingOperation } from '@/lib/algorithms/searching-ops'
import {
  runSortingOperation,
  type SortingMethod,
} from '@/lib/algorithms/sorting-ops'
import {
  createTrie,
  listTrieWords,
  runTrieOperation,
} from '@/lib/algorithms/trie-ops'
import {
  createUnionFind,
  runFind,
  runUnion,
  unionFindGroups,
} from '@/lib/algorithms/union-find-ops'

const sortingMethods: SortingMethod[] = [
  'bubble',
  'selection',
  'insertion',
  'merge',
  'quick',
]

function isHeap(values: number[], type: HeapType): boolean {
  return values.every((value, index) => {
    const left = index * 2 + 1
    const right = index * 2 + 2
    const ordered = (child: number) => child >= values.length
      || (type === 'min' ? value <= values[child] : value >= values[child])
    return ordered(left) && ordered(right)
  })
}

describe('sorting algorithms', () => {
  for (const method of sortingMethods) {
    test(`${method} sort produces an ascending final snapshot`, () => {
      const run = runSortingOperation(method, [5, -1, 5, 3, 0, 2])
      expect(run.snapshots.at(-1)).toEqual([-1, 0, 2, 3, 5, 5])
      expect(run.steps.length).toBeGreaterThan(0)
    })
  }
})

describe('heap algorithms', () => {
  for (const type of ['min', 'max'] as const) {
    test(`${type} heap keeps its invariant across build, insert, and extract`, () => {
      const built = buildHeapArray([7, 2, 9, 1, 6, 8], type)
      expect(isHeap(built, type)).toBe(true)

      const inserted = heapInsertSteps(built, 3, type).nextHeap
      expect(isHeap(inserted, type)).toBe(true)

      const extracted = heapExtractSteps(inserted, type)
      expect(isHeap(extracted.nextHeap, type)).toBe(true)
      expect(extracted.extracted).toBe(type === 'min' ? 1 : 9)
    })
  }
})

describe('tree and search algorithms', () => {
  test('BST deletion preserves the actual successor-based tree shape', () => {
    const nextValues = removeFromValues([40, 20, 60, 10, 30, 50, 70], 40)
    const root = buildBstFromValues(nextValues)

    expect(root?.value).toBe(50)
    expect(root?.left?.value).toBe(20)
    expect(root?.right?.value).toBe(60)
    expect(root?.right?.left).toBeNull()
  })

  test('binary search sorts a copy and finds the target', () => {
    const input = [21, 4, 13, 8]
    const run = runSearchingOperation('binary', input, 13)

    expect(input).toEqual([21, 4, 13, 8])
    expect(run.array).toEqual([4, 8, 13, 21])
    expect(run.context.autoSorted).toBe(true)
    expect(run.steps.some(step => step.action === 'found')).toBe(true)
  })
})

describe('recursion traces', () => {
  test('factorial and fibonacci return expected results', () => {
    expect(factorialCallStackSteps(6).result).toBe(720)
    expect(fibonacciCallTreeSteps(8).result).toBe(21)
  })

  test('recursion inputs are clamped to visualizer-safe limits', () => {
    expect(factorialCallStackSteps(100).result).toBe(3_628_800)
    expect(fibonacciCallTreeSteps(100).result).toBe(21)
  })
})

describe('hash table traces', () => {
  test('handles negative keys and separate-chaining collisions', () => {
    expect(hashIndex(-1, 7)).toBe(6)
    const table = createHashTable([1, 8, 15, -1], 7)
    expect(table[1]).toEqual([1, 8, 15])
    expect(table[6]).toEqual([-1])
  })

  test('insert, search, and delete preserve bucket state', () => {
    const table = createHashTable([1, 8], 7)
    const inserted = runHashTableOperation(table, 15, 'insert')
    expect(inserted.nextTable[1]).toEqual([1, 8, 15])
    expect(inserted.steps.at(-1)?.action).toBe('insert')

    const searched = runHashTableOperation(inserted.nextTable, 8, 'search')
    expect(searched.steps.at(-1)?.action).toBe('found')

    const deleted = runHashTableOperation(inserted.nextTable, 8, 'delete')
    expect(deleted.nextTable[1]).toEqual([1, 15])
    expect(table[1]).toEqual([1, 8])
  })
})

describe('trie traces', () => {
  test('shares prefixes and distinguishes words from prefixes', () => {
    const trie = createTrie(['car', 'card', 'cat'])
    expect(listTrieWords(trie)).toEqual(['car', 'card', 'cat'])

    const prefixSearch = runTrieOperation(trie, 'ca', 'search')
    expect(prefixSearch.steps.at(-1)?.description).toContain('only a prefix')

    const wordSearch = runTrieOperation(trie, 'car', 'search')
    expect(wordSearch.steps.at(-1)?.action).toBe('found')
  })

  test('deleting a word preserves its shared prefix', () => {
    const trie = createTrie(['car', 'card', 'care'])
    const deleted = runTrieOperation(trie, 'card', 'delete')
    expect(listTrieWords(deleted.nextTrie)).toEqual(['car', 'care'])
  })
})

describe('disjoint set traces', () => {
  test('unions components by rank', () => {
    let state = createUnionFind(6)
    state = runUnion(state, 0, 1).nextState
    state = runUnion(state, 2, 3).nextState
    state = runUnion(state, 1, 3).nextState

    expect(unionFindGroups(state)).toEqual([[0, 1, 2, 3], [4], [5]])
  })

  test('find compresses a deep parent path', () => {
    const state = {
      parent: [0, 0, 1, 2],
      rank: [1, 0, 0, 0],
    }
    const run = runFind(state, 3)

    expect(run.root).toBe(0)
    expect(run.nextState.parent).toEqual([0, 0, 0, 0])
    expect(state.parent).toEqual([0, 0, 1, 2])
  })
})
