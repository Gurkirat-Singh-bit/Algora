'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Keyboard, X } from 'lucide-react'

const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ['Space'], label: 'Play / pause (reset when complete)' },
  { keys: ['←', '→'], label: 'Step backward / forward' },
  { keys: ['R'], label: 'Reset to the first step' },
  { keys: ['1', '–', '5'], label: 'Set playback speed (slow to fast)' },
]

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-dsa-border bg-dsa-card px-1.5 font-mono text-[11px] text-dsa-text">
      {children}
    </kbd>
  )
}

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false)

  // Open with "?" from anywhere (ignoring text fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      e.preventDefault()
      setOpen(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-category text-dsa-muted-soft transition-colors hover:text-dsa-text"
        >
          <Keyboard className="h-3.5 w-3.5" strokeWidth={1.7} />
          Shortcuts
          <span className="ml-0.5 rounded border border-dsa-border px-1 text-dsa-muted-soft group-hover:text-dsa-text">?</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-dsa-border bg-dsa-surface p-5 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-[15px] font-semibold tracking-tight text-dsa-text-strong">
              Keyboard shortcuts
            </Dialog.Title>
            <Dialog.Close className="rounded-sm text-dsa-muted transition-colors hover:text-dsa-text">
              <X className="h-4 w-4" strokeWidth={1.8} />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Keyboard shortcuts for controlling the visualizer playback.
          </Dialog.Description>
          <ul className="flex flex-col divide-y divide-dsa-border">
            {shortcuts.map(s => (
              <li key={s.label} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-[13px] text-dsa-muted">{s.label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {s.keys.map((k, i) => (k === '–' ? <span key={i} className="text-dsa-muted-soft">to</span> : <Key key={i}>{k}</Key>))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-4 text-dsa-muted-soft">
            Shortcuts work while a visualizer is open and focused. On touch devices, use the on-screen playback controls.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
