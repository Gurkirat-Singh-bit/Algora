'use client'

import { useState } from 'react'
import { Camera, Check } from 'lucide-react'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'

interface Props {
  targetSelector?: string
  filename?: string
}

export function ExportButton({ targetSelector = '[data-canvas]', filename = 'visualizer.png' }: Props) {
  const [done, setDone] = useState(false)

  const handle = async () => {
    const target = document.querySelector(targetSelector) as HTMLElement | null
    if (!target) return
    try {
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#131313',
        filter: node => {
          if (!(node instanceof HTMLElement)) return true
          return !node.classList?.contains('react-flow__attribution')
        },
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      setDone(true)
      setTimeout(() => setDone(false), 1600)
    } catch (error) {
      console.error('Export failed', error)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handle} className="gap-1.5">
      {done ? <Check className="h-3.5 w-3.5" strokeWidth={1.7} /> : <Camera className="h-3.5 w-3.5" strokeWidth={1.7} />}
      {done ? 'Saved' : 'PNG'}
    </Button>
  )
}
