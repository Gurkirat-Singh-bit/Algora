'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-lg space-y-4 rounded-lg surface-low p-6 ghost-outline">
          <div className="inline-flex items-center gap-2 text-dsa-delete">
            <AlertTriangle className="h-5 w-5" strokeWidth={1.6} />
            <span className="text-sm font-semibold uppercase tracking-[0.14em]">Visualizer crashed</span>
          </div>
          <p className="text-sm text-dsa-muted">{this.state.error.message}</p>
          <Button onClick={this.reset} variant="outline" size="sm" className="gap-2">
            <RefreshCcw className="h-3.5 w-3.5" strokeWidth={1.7} />
            Try again
          </Button>
        </div>
      </div>
    )
  }
}
