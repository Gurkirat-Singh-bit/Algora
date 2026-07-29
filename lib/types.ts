export type StepAction =
  | 'highlight'
  | 'compare'
  | 'swap'
  | 'insert'
  | 'delete'
  | 'traverse'
  | 'found'
  | 'info'

export interface Step {
  action: StepAction
  indices: number[]
  description: string
  highlightColor?: string
  pseudoCodeLine?: number
  edge?: readonly [number, number]
}

export interface NodeData {
  value: string | number
  state: 'default' | 'active' | 'comparing' | 'found' | 'deleting' | 'inserting'
  prevPointer?: boolean
  nextPointer?: boolean
}

export interface ComplexityInfo {
  operation: string
  time: string
  space: string
  best?: string
  worst?: string
  note?: string
}

export interface AnimationState {
  steps: Step[]
  currentStep: number
  isPlaying: boolean
  speed: number
  isComplete: boolean
}
