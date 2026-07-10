import type { ComplexityInfo, Step } from '@/lib/types'

import {
  binarySearchPseudoCode,
  binarySearchSteps,
  linearSearchPseudoCode,
  linearSearchSteps,
} from './array-ops'

export type SearchingMethod = 'linear' | 'binary'

export interface SearchingMethodMeta {
  method: SearchingMethod
  label: string
  description: string
  complexity: ComplexityInfo[]
  pseudoCode: string[]
}

export interface SearchingRunContext {
  method: SearchingMethod
  target: number
  sortedInput: boolean
  autoSorted: boolean
}

export interface SearchingExecution {
  array: number[]
  steps: Step[]
  context: SearchingRunContext
}

const linearComplexity: ComplexityInfo[] = [
  {
    operation: 'Linear Search',
    time: 'O(n)',
    space: 'O(1)',
    best: 'O(1)',
    worst: 'O(n)',
    note: 'No sort requirement; scans left to right.',
  },
]

const binaryComplexity: ComplexityInfo[] = [
  {
    operation: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    best: 'O(1)',
    worst: 'O(log n)',
    note: 'Requires ascending order. Input is auto-sorted if needed.',
  },
]

export const searchingMethodMeta: Record<SearchingMethod, SearchingMethodMeta> = {
  linear: {
    method: 'linear',
    label: 'Linear Search',
    description: 'Sequential comparison across each array element.',
    complexity: linearComplexity,
    pseudoCode: linearSearchPseudoCode,
  },
  binary: {
    method: 'binary',
    label: 'Binary Search',
    description: 'Halves the active range using low/high/mid pointers.',
    complexity: binaryComplexity,
    pseudoCode: binarySearchPseudoCode,
  },
}

export const searchingMethods: SearchingMethod[] = ['linear', 'binary']

export const searchingPseudoCode = {
  linear: linearSearchPseudoCode,
  binary: binarySearchPseudoCode,
} satisfies Record<SearchingMethod, string[]>

export const searchingComplexity = {
  linear: linearComplexity,
  binary: binaryComplexity,
} satisfies Record<SearchingMethod, ComplexityInfo[]>

export function isSortedAscending(array: number[]): boolean {
  for (let i = 1; i < array.length; i += 1) {
    if (array[i] < array[i - 1]) {
      return false
    }
  }
  return true
}

export function normalizeSearchingArray(
  method: SearchingMethod,
  array: number[]
): { array: number[]; sortedInput: boolean; autoSorted: boolean } {
  const sortedInput = isSortedAscending(array)

  if (method === 'binary' && !sortedInput) {
    const sortedArray = [...array].sort((a, b) => a - b)
    return { array: sortedArray, sortedInput, autoSorted: true }
  }

  return { array: [...array], sortedInput, autoSorted: false }
}

export function runLinearSearch(array: number[], target: number): SearchingExecution {
  return {
    array: [...array],
    steps: linearSearchSteps(array, target),
    context: {
      method: 'linear',
      target,
      sortedInput: isSortedAscending(array),
      autoSorted: false,
    },
  }
}

export function runBinarySearch(array: number[], target: number): SearchingExecution {
  const normalized = normalizeSearchingArray('binary', array)

  return {
    array: normalized.array,
    steps: binarySearchSteps(normalized.array, target),
    context: {
      method: 'binary',
      target,
      sortedInput: normalized.sortedInput,
      autoSorted: normalized.autoSorted,
    },
  }
}

export function runSearchingOperation(
  method: SearchingMethod,
  array: number[],
  target: number
): SearchingExecution {
  return method === 'linear' ? runLinearSearch(array, target) : runBinarySearch(array, target)
}

export { binarySearchSteps, linearSearchSteps }