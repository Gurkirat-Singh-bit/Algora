import Link from 'next/link'
import { ArrowRight, Gauge, ListTree, MousePointerClick, SquareCode } from 'lucide-react'

import { categories, iconMap, navItems, REPO_URL } from '@/constants/navigation'
import { Logo } from '@/components/shared/Logo'
import { GithubIcon } from '@/components/shared/GithubIcon'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const features = [
  {
    icon: MousePointerClick,
    title: 'Run any operation',
    body: 'Type an input, trigger insert, search, traverse, or sort, and watch the structure mutate step by step.',
  },
  {
    icon: SquareCode,
    title: 'Pseudocode in sync',
    body: 'The active line of pseudocode moves with the animation, so you see the code and the effect together.',
  },
  {
    icon: ListTree,
    title: 'Scrub the trace',
    body: 'Play, pause, step forward and back, or click any line in the log to jump straight to that moment.',
  },
  {
    icon: Gauge,
    title: 'Runs in your browser',
    body: 'No backend, no account, nothing uploaded. Every trace is computed locally and instantly.',
  },
]

const topicCount = navItems.filter(item => item.href !== '/learn').length

export default function LandingPage() {
  return (
    <div className="min-h-screen surface-bg text-dsa-text">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-dsa-border bg-dsa-surface">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-dsa-text-strong">
            <Logo className="h-6 w-6" />
            <span className="text-[15px] font-semibold tracking-tight">Algora</span>
          </Link>
          <div className="flex items-center gap-1.5">
            {REPO_URL && (
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Source on GitHub"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-dsa-muted transition-colors hover:bg-dsa-card hover:text-dsa-text"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            )}
            <ThemeToggle compact />
            <Link
              href="/learn"
              className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-md bg-dsa-primary-container px-3 text-[13px] font-medium tracking-tight text-[oklch(0.16_0.020_150)] transition-colors hover:bg-dsa-active"
            >
              Start learning
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl px-5 md:px-8">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 pb-16 pt-16 text-center md:pt-24">
          <Logo className="h-16 w-16 md:h-20 md:w-20" />
          <div className="inline-flex items-center gap-2 rounded-full border border-dsa-border bg-dsa-card px-3 py-1 font-mono text-[10px] uppercase tracking-category text-dsa-muted">
            {topicCount} interactive topics
          </div>
          <h1 className="text-display max-w-3xl text-4xl font-semibold leading-[1.05] text-dsa-text-strong md:text-6xl">
            See how data structures actually work.
          </h1>
          <p className="max-w-[58ch] text-[15px] leading-7 text-dsa-muted md:text-base">
            Algora is a step-through visualizer for data structures and algorithms.
            Pick a topic, run an operation, and watch every index, pointer, and swap
            unfold, one step at a time.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
            <Link
              href="/learn"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-dsa-primary-container px-5 text-sm font-medium tracking-tight text-[oklch(0.16_0.020_150)] transition-colors hover:bg-dsa-active"
            >
              Start learning
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/arrays"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-dsa-border px-5 text-sm font-medium tracking-tight text-dsa-text transition-colors hover:border-dsa-border-strong hover:bg-dsa-card"
            >
              Try arrays first
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-dsa-border bg-dsa-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="flex flex-col gap-3 surface-floor p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-dsa-border bg-dsa-card text-dsa-primary-container">
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight text-dsa-text-strong">{f.title}</h3>
                <p className="text-[13px] leading-5 text-dsa-muted">{f.body}</p>
              </div>
            )
          })}
        </section>

        {/* Topics */}
        <section className="py-20">
          <div className="mb-8 flex flex-col gap-1">
            <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
              Everything covered
            </span>
            <h2 className="text-display text-2xl font-semibold text-dsa-text-strong md:text-3xl">
              One tool for the whole syllabus.
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            {categories.map(category => {
              const items = navItems.filter(i => i.category === category && i.href !== '/learn')
              if (items.length === 0) return null
              return (
                <div key={category} className="grid grid-cols-1 gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-category text-dsa-muted-soft">
                    {category}
                  </span>
                  <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-dsa-border bg-dsa-border sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(item => {
                      const Icon = iconMap[item.icon]
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="group flex h-full items-center gap-3 surface-floor p-4 transition-colors hover:bg-dsa-card"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dsa-border bg-dsa-card text-dsa-muted group-hover:border-dsa-border-strong group-hover:text-dsa-primary-container">
                              <Icon className="h-4 w-4" strokeWidth={1.7} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[14px] font-medium tracking-tight text-dsa-text-strong">{item.label}</div>
                              <p className="mt-0.5 truncate text-[12px] text-dsa-muted">{item.summary}</p>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20 flex flex-col items-center gap-5 rounded-xl border border-dsa-border surface-floor px-6 py-14 text-center">
          <Logo className="h-10 w-10" />
          <h2 className="text-display max-w-xl text-2xl font-semibold text-dsa-text-strong md:text-3xl">
            Ready to watch an algorithm run?
          </h2>
          <Link
            href="/learn"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-dsa-primary-container px-5 text-sm font-medium tracking-tight text-[oklch(0.16_0.020_150)] transition-colors hover:bg-dsa-active"
          >
            Open the learning path
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-dsa-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-[13px] text-dsa-muted md:flex-row md:px-8">
          <div className="inline-flex items-center gap-2">
            <Logo className="h-4 w-4" />
            <span className="text-dsa-text">Algora</span>
            <span className="text-dsa-muted-soft">MIT licensed</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/learn" className="transition-colors hover:text-dsa-text">Learning path</Link>
            {REPO_URL && (
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-dsa-text"
              >
                <GithubIcon className="h-4 w-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
