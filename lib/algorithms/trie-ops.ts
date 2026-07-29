import type { Step } from '@/lib/types'

export type TrieMode = 'insert' | 'search' | 'delete'

export interface TrieNodeRecord {
  id: number
  parentId: number | null
  character: string
  terminal: boolean
}

export interface TrieSnapshot {
  nodes: TrieNodeRecord[]
}

export interface TrieRun {
  steps: Step[]
  snapshots: TrieSnapshot[]
  nextTrie: TrieSnapshot
  word: string
}

export const triePseudoCode: Record<TrieMode, string[]> = {
  insert: [
    'node = root',
    'for character in word:',
    '  if child missing: create child',
    '  node = child',
    'mark node as terminal',
  ],
  search: [
    'node = root',
    'for character in word:',
    '  if child missing: return not found',
    '  node = child',
    'return node is terminal',
  ],
  delete: [
    'follow characters from root',
    'if word missing: return',
    'unmark terminal node',
    'prune non-terminal leaf nodes upward',
  ],
}

function cloneTrie(trie: TrieSnapshot): TrieSnapshot {
  return { nodes: trie.nodes.map(node => ({ ...node })) }
}

export function normalizeTrieWord(raw: string): string {
  const word = raw.trim().toLowerCase()
  if (!word) throw new Error('Provide a word.')
  if (!/^[a-z]+$/.test(word)) throw new Error('Trie words can contain letters a to z only.')
  if (word.length > 16) throw new Error('Trie words are limited to 16 letters.')
  return word
}

function findChild(nodes: TrieNodeRecord[], parentId: number, character: string): TrieNodeRecord | undefined {
  return nodes.find(node => node.parentId === parentId && node.character === character)
}

export function createTrie(words: readonly string[] = []): TrieSnapshot {
  const nodes: TrieNodeRecord[] = [
    { id: 0, parentId: null, character: '', terminal: false },
  ]

  for (const rawWord of words) {
    let word: string
    try {
      word = normalizeTrieWord(rawWord)
    } catch {
      continue
    }
    let currentId = 0
    for (const character of word) {
      let child = findChild(nodes, currentId, character)
      if (!child) {
        child = {
          id: nodes.length,
          parentId: currentId,
          character,
          terminal: false,
        }
        nodes.push(child)
      }
      currentId = child.id
    }
    const terminal = nodes.find(node => node.id === currentId)
    if (terminal) terminal.terminal = true
  }

  return { nodes }
}

export function runTrieOperation(
  source: TrieSnapshot,
  rawWord: string,
  mode: TrieMode
): TrieRun {
  const word = normalizeTrieWord(rawWord)
  const trie = cloneTrie(source)
  const steps: Step[] = []
  const snapshots: TrieSnapshot[] = []
  const push = (step: Step): void => {
    steps.push(step)
    snapshots.push(cloneTrie(trie))
  }

  let currentId = 0
  const path = [0]
  push({
    action: 'highlight',
    indices: [0],
    description: `Start at the root for "${word}".`,
    pseudoCodeLine: 0,
  })

  for (const character of word) {
    const child = findChild(trie.nodes, currentId, character)
    if (!child) {
      if (mode !== 'insert') {
        push({
          action: 'info',
          indices: [currentId],
          description: `No "${character}" edge exists. The word "${word}" is not stored.`,
          pseudoCodeLine: mode === 'search' ? 2 : 1,
        })
        return { steps, snapshots, nextTrie: trie, word }
      }

      const parentId = currentId
      const created: TrieNodeRecord = {
        id: trie.nodes.reduce((max, node) => Math.max(max, node.id), 0) + 1,
        parentId,
        character,
        terminal: false,
      }
      trie.nodes.push(created)
      currentId = created.id
      path.push(currentId)
      push({
        action: 'insert',
        indices: [currentId],
        description: `Create a "${character}" node.`,
        pseudoCodeLine: 2,
        edge: [parentId, created.id],
      })
      continue
    }

    push({
      action: 'compare',
      indices: [child.id],
      description: `Follow the existing "${character}" edge.`,
      pseudoCodeLine: mode === 'delete' ? 0 : 1,
      edge: [currentId, child.id],
    })
    currentId = child.id
    path.push(currentId)
  }

  const terminalNode = trie.nodes.find(node => node.id === currentId)
  if (!terminalNode) throw new Error('Trie path is inconsistent.')

  if (mode === 'insert') {
    terminalNode.terminal = true
    push({
      action: 'found',
      indices: [terminalNode.id],
      description: `Mark "${word}" as a complete word.`,
      pseudoCodeLine: 4,
    })
  } else if (mode === 'search') {
    push(terminalNode.terminal
      ? {
          action: 'found',
          indices: [terminalNode.id],
          description: `Found the complete word "${word}".`,
          pseudoCodeLine: 4,
        }
      : {
          action: 'info',
          indices: [terminalNode.id],
          description: `"${word}" is only a prefix, not a stored word.`,
          pseudoCodeLine: 4,
        })
  } else if (!terminalNode.terminal) {
    push({
      action: 'info',
      indices: [terminalNode.id],
      description: `"${word}" is not marked as a complete word.`,
      pseudoCodeLine: 1,
    })
  } else {
    terminalNode.terminal = false
    push({
      action: 'delete',
      indices: [terminalNode.id],
      description: `Remove the terminal marker from "${word}".`,
      pseudoCodeLine: 2,
    })

    for (let index = path.length - 1; index > 0; index -= 1) {
      const nodeId = path[index]
      const node = trie.nodes.find(candidate => candidate.id === nodeId)
      if (!node || node.terminal || trie.nodes.some(candidate => candidate.parentId === nodeId)) break
      push({
        action: 'delete',
        indices: [nodeId],
        description: `Prune unused leaf "${node.character}".`,
        pseudoCodeLine: 3,
      })
      trie.nodes = trie.nodes.filter(candidate => candidate.id !== nodeId)
    }

    push({
      action: 'info',
      indices: [0],
      description: `Deleted "${word}" while preserving shared prefixes.`,
      pseudoCodeLine: 3,
    })
  }

  return { steps, snapshots, nextTrie: trie, word }
}

export function listTrieWords(trie: TrieSnapshot): string[] {
  const children = new Map<number, TrieNodeRecord[]>()
  for (const node of trie.nodes) {
    if (node.parentId === null) continue
    const siblings = children.get(node.parentId) ?? []
    siblings.push(node)
    children.set(node.parentId, siblings)
  }
  for (const siblings of children.values()) {
    siblings.sort((a, b) => a.character.localeCompare(b.character))
  }

  const words: string[] = []
  const visit = (nodeId: number, prefix: string): void => {
    const node = trie.nodes.find(candidate => candidate.id === nodeId)
    if (node?.terminal) words.push(prefix)
    for (const child of children.get(nodeId) ?? []) {
      visit(child.id, `${prefix}${child.character}`)
    }
  }
  visit(0, '')
  return words
}
