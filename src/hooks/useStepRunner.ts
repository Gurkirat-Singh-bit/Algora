'use client'
import { useAnimationEngine } from './useAnimationEngine'
import type { Step } from '@/lib/types'

export function useStepRunner() {
  const engine = useAnimationEngine()
  const currentStepData: Step | null =
    engine.steps.length > 0 && engine.currentStep >= 0
      ? engine.steps[engine.currentStep]
      : null

  return { ...engine, currentStepData }

}
