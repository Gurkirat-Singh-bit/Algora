import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'

import {
  learningGuideBySlug,
  learningGuides,
} from '@/constants/learning'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return learningGuides.map(guide => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = learningGuideBySlug.get(slug)
  if (!guide) return {}
  return {
    title: `${guide.title} guide | Algora`,
    description: guide.purpose,
  }
}

export default async function LearningGuidePage({ params }: Props) {
  const { slug } = await params
  const guide = learningGuideBySlug.get(slug)
  if (!guide) notFound()

  const currentIndex = learningGuides.findIndex(item => item.slug === slug)
  const previous = currentIndex > 0 ? learningGuides[currentIndex - 1] : null
  const next = currentIndex < learningGuides.length - 1
    ? learningGuides[currentIndex + 1]
    : null

  return (
    <article className="px-4 pb-20 pt-8 sm:px-6 md:px-10 md:pt-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/learn"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-dsa-muted transition-colors hover:text-dsa-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dsa-primary-container/40 md:min-h-8"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Learning path
        </Link>

        <header className="border-b border-dsa-border pb-8 pt-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-category text-dsa-muted-soft">
            <span className="rounded-sm bg-dsa-card px-2 py-1">{guide.level}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              {guide.minutes} minute guide
            </span>
          </div>
          <h1 className="text-display text-3xl font-semibold text-dsa-text-strong sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[15px] leading-7 text-dsa-muted">
            {guide.purpose}
          </p>
          <Link
            href={guide.visualizerHref}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-dsa-primary-container px-4 text-sm font-medium text-[var(--on-accent)] transition-colors hover:bg-dsa-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dsa-primary-container/45 focus-visible:ring-offset-2 focus-visible:ring-offset-dsa-bg"
          >
            Open visualizer
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="space-y-10">
            <section aria-labelledby="mental-model">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-muted-soft">
                Mental model
              </p>
              <h2 id="mental-model" className="mt-2 text-xl font-semibold text-dsa-text-strong">
                {guide.mentalModel}
              </h2>
            </section>

            <GuideList
              id="invariants"
              eyebrow="Keep true"
              title="Invariants"
              items={guide.invariants}
            />
            <GuideList
              id="walkthrough"
              eyebrow="Use the visualizer"
              title="Walkthrough"
              items={guide.walkthrough}
              ordered
            />
            <GuideList
              id="practice"
              eyebrow="Check understanding"
              title="Practice prompts"
              items={guide.practice}
            />
          </div>

          <aside className="h-fit border-t border-dsa-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-muted-soft">
              Prerequisites
            </p>
            {guide.prerequisites.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-dsa-muted">Start here. No prior topic is required.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {guide.prerequisites.map(prerequisite => {
                  const item = learningGuideBySlug.get(prerequisite)
                  return (
                    <li key={prerequisite}>
                      <Link
                        href={`/learn/${prerequisite}`}
                        className="inline-flex min-h-11 items-center text-sm text-dsa-muted transition-colors hover:text-dsa-primary-container md:min-h-8"
                      >
                        {item?.title ?? prerequisite}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </aside>
        </div>

        <nav
          aria-label="Guide pagination"
          className="grid gap-px overflow-hidden rounded-md border border-dsa-border bg-dsa-border sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={`/learn/${previous.slug}`}
              className="flex min-h-20 flex-col justify-center surface-floor px-4 py-3 transition-colors hover:bg-dsa-card"
            >
              <span className="font-mono text-[10px] uppercase tracking-category text-dsa-muted-soft">Previous</span>
              <span className="mt-1 text-sm font-medium text-dsa-text-strong">{previous.title}</span>
            </Link>
          ) : <span className="hidden surface-floor sm:block" />}
          {next ? (
            <Link
              href={`/learn/${next.slug}`}
              className="flex min-h-20 flex-col items-end justify-center surface-floor px-4 py-3 text-right transition-colors hover:bg-dsa-card"
            >
              <span className="font-mono text-[10px] uppercase tracking-category text-dsa-muted-soft">Next</span>
              <span className="mt-1 text-sm font-medium text-dsa-text-strong">{next.title}</span>
            </Link>
          ) : <span className="hidden surface-floor sm:block" />}
        </nav>
      </div>
    </article>
  )
}

function GuideList({
  id,
  eyebrow,
  title,
  items,
  ordered = false,
}: {
  id: string
  eyebrow: string
  title: string
  items: string[]
  ordered?: boolean
}) {
  const List = ordered ? 'ol' : 'ul'
  return (
    <section aria-labelledby={id}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-muted-soft">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-xl font-semibold text-dsa-text-strong">{title}</h2>
      <List className="mt-4 divide-y divide-dsa-border border-y border-dsa-border">
        {items.map((item, index) => (
          <li key={item} className="flex gap-4 py-4 text-sm leading-6 text-dsa-muted">
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-dsa-primary-container">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </List>
    </section>
  )
}
