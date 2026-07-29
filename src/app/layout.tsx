import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/shared/ThemeProvider'

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
      <body className="min-h-screen overflow-x-hidden surface-bg font-sans text-dsa-text antialiased">
        <ThemeProvider>
          <a
            href="#main-content"
            className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-md bg-dsa-primary-container px-4 py-2 text-sm font-semibold text-[var(--on-accent)] transition-transform focus:translate-y-0"
          >
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
