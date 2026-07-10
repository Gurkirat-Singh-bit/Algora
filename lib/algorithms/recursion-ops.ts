import type { Step } from '@/lib/types'

export const factorialPseudoCode = [
  'factorial(n):',
  '  if n <= 1: return 1',
  '  return n * factorial(n - 1)',
]

export const fibonacciPseudoCode = [
  'fibonacci(n):',
  '  if n <= 1: return n',
  '  if memo[n] exists: return memo[n]',
  '  memo[n] = fibonacci(n - 1) + fibonacci(n - 2)',
  '  return memo[n]',
]

export interface FactorialRun {
  steps: Step[]
  snapshots: string[][]
  result: number
}

export interface FibonacciNode {
  id: number
  n: number
  parentId: number | null
  depth: number
  cached: boolean
  value?: number
}

export interface FibonacciRun {
  steps: Step[]
  nodes: FibonacciNode[]
  edges: Array<{ source: number; target: number }>
  result: number
}

export function factorialCallStackSteps(n: number): FactorialRun {
  const steps: Step[] = []
  const snapshots: string[][] = []
  const stack: string[] = []

  const pushSnapshot = (): void => {
    snapshots.push([...stack])
  }

  const factorial = (value: number): number => {
    stack.push(`fact(${value})`)
    steps.push({
      action: 'insert',
      indices: [stack.length - 1],
      description: `Push frame fact(${value}) onto the call stack.`,
      pseudoCodeLine: 0,
    })
    pushSnapshot()

    if (value <= 1) {
      steps.push({
        action: 'found',
        indices: [stack.length - 1],
        description: `Base case reached for fact(${value}) = 1.`,
        pseudoCodeLine: 1,
      })
      const frameIndex = stack.length - 1
      stack.pop()
      steps.push({
        action: 'delete',
        indices: [frameIndex],
        description: `Return 1 and pop fact(${value}) frame.`,
        pseudoCodeLine: 1,
      })
      pushSnapshot()
      return 1
    }

    steps.push({
      action: 'highlight',
      indices: [stack.length - 1],
      description: `Need fact(${value - 1}) before resolving fact(${value}).`,
      pseudoCodeLine: 2,
    })

    const child = factorial(value - 1)
    const result = value * child

    steps.push({
      action: 'info',
      indices: [stack.length - 1],
      description: `Resolve fact(${value}) = ${value} * ${child} = ${result}.`,
      pseudoCodeLine: 2,
    })

    const frameIndex = stack.length - 1
    stack.pop()
    steps.push({
      action: 'delete',
      indices: [frameIndex],
      description: `Pop frame fact(${value}) and return ${result}.`,
      pseudoCodeLine: 2,
    })
    pushSnapshot()

    return result
  }

  const clamped = Math.max(0, Math.min(10, Math.floor(n)))
  const result = factorial(clamped)

  steps.push({
    action: 'info',
    indices: [],
    description: `Factorial complete: fact(${clamped}) = ${result}.`,
  })

  if (snapshots.length === 0) {
    snapshots.push([])
  }

  return { steps, snapshots, result }
}

export function fibonacciCallTreeSteps(n: number): FibonacciRun {
  const steps: Step[] = []
  const nodes: FibonacciNode[] = []
  const edges: Array<{ source: number; target: number }> = []
  const memo = new Map<number, number>()

  const fib = (value: number, parentId: number | null, depth: number): number => {
    const id = nodes.length
    const node: FibonacciNode = { id, n: value, parentId, depth, cached: false }
    nodes.push(node)

    if (parentId !== null) {
      edges.push({ source: parentId, target: id })
    }

    steps.push({
      action: 'insert',
      indices: [id],
      description: `Call fib(${value}).`,
      pseudoCodeLine: 0,
    })

    if (value <= 1) {
      node.value = value
      steps.push({
        action: 'found',
        indices: [id],
        description: `Base case: fib(${value}) = ${value}.`,
        pseudoCodeLine: 1,
      })
      return value
    }

    if (memo.has(value)) {
      const cached = memo.get(value) ?? 0
      node.cached = true
      node.value = cached
      steps.push({
        action: 'highlight',
        indices: [id],
        description: `Reuse memoized fib(${value}) = ${cached}.`,
        pseudoCodeLine: 2,
      })
      return cached
    }

    const left = fib(value - 1, id, depth + 1)
    const right = fib(value - 2, id, depth + 1)
    const total = left + right

    memo.set(value, total)
    node.value = total

    steps.push({
      action: 'info',
      indices: [id],
      description: `fib(${value}) = fib(${value - 1}) + fib(${value - 2}) = ${total}.`,
      pseudoCodeLine: 3,
    })

    return total
  }

  const clamped = Math.max(0, Math.min(8, Math.floor(n)))
  const result = fib(clamped, null, 0)

  steps.push({
    action: 'info',
    indices: [],
    description: `Fibonacci complete: fib(${clamped}) = ${result}.`,
    pseudoCodeLine: 4,
  })

  return { steps, nodes, edges, result }
}
