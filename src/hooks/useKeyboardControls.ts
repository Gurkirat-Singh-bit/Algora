'use client'

import { useEffect } from 'react'

interface Controls {
  isPlaying: boolean
  hasSteps: boolean
  isComplete: boolean
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  reset: () => void
  setSpeed: (speed: number) => void
}

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return EDITABLE_TAGS.has(target.tagName)
}

export function useKeyboardControls(controls: Controls) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isEditable(event.target)) return

      switch (event.key) {
        case ' ':
        case 'Spacebar':
          if (!controls.hasSteps) return
          event.preventDefault()
          if (controls.isComplete) {
            controls.reset()
            return
          }
          if (controls.isPlaying) controls.pause()
          else controls.play()
          break
        case 'ArrowRight':
          if (!controls.hasSteps) return
          event.preventDefault()
          controls.stepForward()
          break
        case 'ArrowLeft':
          if (!controls.hasSteps) return
          event.preventDefault()
          controls.stepBackward()
          break
        case 'r':
        case 'R':
          if (!controls.hasSteps) return
          event.preventDefault()
          controls.reset()
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault()
          controls.setSpeed(Number(event.key))
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [controls])
}
