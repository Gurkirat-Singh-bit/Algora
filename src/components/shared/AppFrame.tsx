'use client'

import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Sidebar } from '@/components/shared/Sidebar'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

export function AppFrame({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed)

  return (
    <>
      <Sidebar />
      <div
        id="main-content"
        tabIndex={-1}
        className={cn(
          'min-h-screen pt-14 outline-none transition-[padding] duration-200 md:pt-0',
          sidebarCollapsed ? 'md:pl-14' : 'md:pl-68'
        )}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </>
  )
}
