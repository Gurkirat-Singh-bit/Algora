'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { Step, AnimationState } from '@/lib/types'
import { speedToMs } from '@/lib/utils'

export function useAnimationEngine() {
  const [state, setState] = useState<AnimationState>({
    steps: [],
    currentStep: -1,
    isPlaying: false,
    speed: 3,
    isComplete: false,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const setSteps = useCallback((steps: Step[]) => {
    clearTimer()
    setState(prev => ({
      steps,
      currentStep: steps.length > 0 ? 0 : -1,
      isPlaying: false,
      speed: prev.speed,
      isComplete: steps.length === 0,
    }))
  }, [clearTimer])

  const play = useCallback(() => {
    setState(prev => {
      if (prev.isComplete || prev.steps.length === 0) return prev
      return { ...prev, isPlaying: true }
    })
  }, [])

  const pause = useCallback(() => {
    clearTimer()
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [clearTimer])

  const stepForward = useCallback(() => {
    clearTimer()
    setState(prev => {
      if (prev.currentStep >= prev.steps.length - 1) return { ...prev, isPlaying: false, isComplete: true }
      return { ...prev, currentStep: prev.currentStep + 1, isPlaying: false }
    })
  }, [clearTimer])

  const stepBackward = useCallback(() => {
    clearTimer()
    setState(prev => {
      if (prev.currentStep <= 0) return { ...prev, isPlaying: false }
      return { ...prev, currentStep: prev.currentStep - 1, isPlaying: false, isComplete: false }
    })
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setState(prev => ({ ...prev, currentStep: prev.steps.length > 0 ? 0 : -1, isPlaying: false, isComplete: false }))
  }, [clearTimer])

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }))
  }, [])

  const jumpToStep = useCallback((index: number) => {
    clearTimer()
    setState(prev => {
      if (prev.steps.length === 0) return prev
      const clamped = Math.max(0, Math.min(prev.steps.length - 1, index))
      return {
        ...prev,
        currentStep: clamped,
        isPlaying: false,
        isComplete: clamped >= prev.steps.length - 1,
      }
    })
  }, [clearTimer])

  useEffect(() => {
    if (state.isPlaying && !state.isComplete) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.currentStep >= prev.steps.length - 1) {
            clearTimer()
            return { ...prev, isPlaying: false, isComplete: true }
          }
          return { ...prev, currentStep: prev.currentStep + 1 }
        })
      }, speedToMs(state.speed))
    } else {
      clearTimer()
    }
    return clearTimer
  }, [state.isPlaying, state.speed, state.isComplete, clearTimer])

  return {
    steps: state.steps,
    currentStep: state.currentStep,
    isPlaying: state.isPlaying,
    speed: state.speed,
    isComplete: state.isComplete,
    setSteps,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    jumpToStep,
  }
}
