import { Sidebar } from '@/components/shared/Sidebar'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="min-h-screen pt-14 md:pl-(--sidebar-width) md:pt-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </>
  )
}
