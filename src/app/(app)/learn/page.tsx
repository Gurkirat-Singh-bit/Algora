import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { iconMap, navItems } from '@/constants/navigation'
import { Logo } from '@/components/shared/Logo'

const modules = [
  {
    id: '01',
    title: 'Arrays · Indexing',
    description: 'Index-based storage, shifts, insertion and deletion patterns.',
    topics: ['/arrays'],
    emphasis: 'Start here',
  },
  {
    id: '02',
    title: 'Linked Lists',
    description: 'Pointer-based storage. Singly, doubly, and circular variants.',
    topics: ['/singly-linked-list', '/doubly-linked-list', '/circular-linked-list'],
    emphasis: 'Core',
  },
  {
    id: '03',
    title: 'Stacks · Queues',
    description: 'LIFO and FIFO. Circular queue and deque included.',
    topics: ['/stack', '/queue'],
    emphasis: 'Core',
  },
  {
    id: '04',
    title: 'Recursion · Searching · Sorting',
    description: 'Algorithmic thinking on top of basic structures.',
    topics: ['/recursion', '/searching', '/sorting'],
    emphasis: 'Core',
  },
  {
    id: '05',
    title: 'Trees · Graphs',
    description: 'Hierarchical and network-shaped problem models.',
    topics: ['/binary-tree', '/bst', '/heap', '/graphs'],
    emphasis: 'Advanced',
  },
  {
    id: '06',
    title: 'Hashing · Prefixes · Sets',
    description: 'Fast key lookup, prefix trees, and dynamic connectivity.',
    topics: ['/hash-table', '/trie', '/union-find'],
    emphasis: 'Advanced',
  },
]

export default function HomePage() {
  const topicByHref = new Map(navItems.map(item => [item.href, item]))

  return (
    <div className="px-5 pb-20 pt-10 md:px-10 md:pt-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <section className="flex flex-col gap-5">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-dsa-border bg-dsa-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-category text-dsa-muted">
            <Logo className="h-3 w-3" />
            Curriculum
          </div>
          <h1 className="text-display max-w-3xl text-4xl font-semibold text-dsa-text-strong md:text-5xl">
            Learning path.
          </h1>
          <p className="max-w-[60ch] text-[15px] leading-7 text-dsa-muted">
            Work top to bottom, or jump to any topic. Each module builds on the last,
            following a common DSA course sequence from arrays to graphs.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/learn/arrays"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-dsa-primary-container px-4 text-[13px] font-medium tracking-tight text-[oklch(0.16_0.020_150)] transition-colors hover:bg-dsa-active"
            >
              Read the first guide
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Link>
            <Link
              href="/graphs"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-dsa-border px-4 text-[13px] font-medium tracking-tight text-dsa-text hover:bg-dsa-card hover:border-dsa-border-strong"
            >
              Open graph editor
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-dsa-border" />

        <section className="flex flex-col gap-10">
          {modules.map(module => (
            <div key={module.id} className="grid grid-cols-1 gap-6 md:grid-cols-[10rem_minmax(0,1fr)]">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
                  Module {module.id}
                </span>
                <h2 className="text-display text-lg font-semibold text-dsa-text-strong md:text-xl">
                  {module.title}
                </h2>
                <p className="text-[13px] leading-5 text-dsa-muted">{module.description}</p>
                <span className="mt-1 inline-flex w-fit items-center rounded-sm bg-dsa-card px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-data text-dsa-muted">
                  {module.emphasis}
                </span>
              </div>

              <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-dsa-border surface-floor sm:grid-cols-2">
                {module.topics.map(href => {
                  const item = topicByHref.get(href)
                  if (!item) return null
                  const Icon = iconMap[item.icon]
                  return (
                    <li key={item.href}>
                      <Link
                        href={`/learn/${item.href.slice(1)}`}
                        className="group flex h-full items-center gap-3 bg-dsa-bg/60 p-4 transition-colors hover:bg-dsa-card"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dsa-border bg-dsa-card text-dsa-muted group-hover:border-dsa-border-strong group-hover:text-dsa-primary-container">
                          <Icon className="h-4 w-4" strokeWidth={1.7} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-medium tracking-tight text-dsa-text-strong">
                              {item.label}
                            </span>
                            <ArrowUpRight
                              className="h-3.5 w-3.5 shrink-0 text-dsa-muted-soft group-hover:text-dsa-primary-container"
                              strokeWidth={1.8}
                            />
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-dsa-muted">{item.summary}</p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>

        <div className="h-px w-full bg-dsa-border" />

        <section className="grid grid-cols-1 gap-6 md:grid-cols-[10rem_minmax(0,1fr)]">
          <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
            How to use
          </span>
          <ol className="space-y-2 text-[13px] leading-6 text-dsa-muted">
            <li>
              <span className="mr-2 font-mono tabular-nums text-dsa-muted-soft">01</span>
              Open a topic. Type or paste an input.
            </li>
            <li>
              <span className="mr-2 font-mono tabular-nums text-dsa-muted-soft">02</span>
              Press <span className="font-mono text-dsa-text">Generate steps</span> or run the operation.
            </li>
            <li>
              <span className="mr-2 font-mono tabular-nums text-dsa-muted-soft">03</span>
              Use <span className="font-mono text-dsa-text">Space</span> to play, <span className="font-mono text-dsa-text">←/→</span> to step, <span className="font-mono text-dsa-text">1-5</span> for speed.
            </li>
            <li>
              <span className="mr-2 font-mono tabular-nums text-dsa-muted-soft">04</span>
              Click any line in the step log to jump there.
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}
