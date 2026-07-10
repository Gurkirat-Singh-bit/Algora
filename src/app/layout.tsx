import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Sidebar } from '@/components/shared/Sidebar'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Algora',
  description: 'Step-through visualizer for data structures and algorithms.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-color-scheme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen surface-bg font-sans text-dsa-text antialiased">
        <ThemeProvider>
          <Sidebar />
          <div className="min-h-screen pt-14 md:pl-(--sidebar-width) md:pt-0">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
