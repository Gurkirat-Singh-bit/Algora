'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ChevronRight, ChevronsLeft, ChevronsRight, Menu, Search, X } from 'lucide-react'

import { categories, iconMap, navItems, REPO_URL } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GithubIcon } from '@/components/shared/GithubIcon'
import { Logo } from '@/components/shared/Logo'
import { ShortcutsHelp } from '@/components/shared/ShortcutsHelp'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUIStore } from '@/store/useUIStore'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Sidebar() {
  const pathname = usePathname()
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore(s => s.setSidebarCollapsed)
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeCategory = useMemo(
    () => navItems.find(item => item.href === pathname)?.category,
    [pathname]
  )

  const normalizedSearch = search.trim().toLowerCase()

  const filteredGroups = useMemo(() => {
    return categories
      .map(category => ({
        category,
        items: navItems.filter(item => {
          if (item.category !== category) return false
          if (!normalizedSearch) return true
          return (
            item.label.toLowerCase().includes(normalizedSearch) ||
            item.summary.toLowerCase().includes(normalizedSearch)
          )
        }),
      }))
      .filter(g => g.items.length > 0)
  }, [normalizedSearch])

  const sectionCollapsed = useMemo<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const c of categories) {
      const override = sectionOverrides[c]
      if (override !== undefined) {
        map[c] = override
        continue
      }
      map[c] = !!normalizedSearch ? false : (activeCategory ? c !== activeCategory : false)
    }
    return map
  }, [sectionOverrides, activeCategory, normalizedSearch])

  const toggleSection = (category: string) => {
    setSectionOverrides(prev => ({ ...prev, [category]: !sectionCollapsed[category] }))
  }

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto px-3 pb-6">
      {filteredGroups.length === 0 ? (
        <div className="mx-2 mt-4 rounded-md bg-dsa-card px-3 py-4 text-xs text-dsa-muted">
          No matches.
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {filteredGroups.map(group => {
            const collapsed = sectionCollapsed[group.category]
            return (
              <section key={group.category}>
                <button
                  type="button"
                  onClick={() => toggleSection(group.category)}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-category text-dsa-muted-soft hover:text-dsa-text"
                >
                  <span>{group.category}</span>
                  <ChevronRight
                    className={cn('h-3 w-3 transition-transform', !collapsed && 'rotate-90')}
                    strokeWidth={2}
                  />
                </button>
                {!collapsed && (
                  <ul className="mt-1 space-y-px">
                    {group.items.map(item => {
                      const Icon = iconMap[item.icon]
                      const active = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                              'group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors',
                              active
                                ? 'bg-dsa-card text-dsa-text-strong'
                                : 'text-dsa-muted hover:bg-dsa-card/60 hover:text-dsa-text'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-3.5 w-3.5 shrink-0',
                                active ? 'text-dsa-primary-container' : 'text-dsa-muted-soft group-hover:text-dsa-text'
                              )}
                              strokeWidth={1.7}
                            />
                            <span className="truncate text-[13px] font-medium tracking-tight">{item.label}</span>
                            {active && (
                              <span className="ml-auto h-1 w-1 rounded-full bg-dsa-primary-container" />
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </nav>
  )

  return (
    <>
      {/* Mobile bar */}
      <header className="surface-floor fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-dsa-border px-3 md:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-dsa-text-strong">
          <Logo className="h-5 w-5" />
          <span className="text-[13px] font-semibold tracking-tight">Algora</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-4 w-4" strokeWidth={1.8} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm border-0 surface-floor p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">Browse data structure and algorithm topics.</SheetDescription>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-dsa-border px-4 py-3">
                  <Link href="/" onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-2">
                    <Logo className="h-5 w-5" />
                    <span className="text-[13px] font-semibold tracking-tight text-dsa-text-strong">Algora</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                    <X className="h-4 w-4" strokeWidth={1.8} />
                  </Button>
                </div>
                <div className="border-b border-dsa-border px-3 py-2.5">
                  <SearchBox value={search} onChange={setSearch} />
                </div>
                <NavList onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop rail */}
      <aside
        className={cn(
          'surface-floor fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-dsa-border transition-[width] duration-200 md:flex',
          sidebarCollapsed ? 'w-[3.5rem]' : 'w-[17rem]'
        )}
        style={{ width: sidebarCollapsed ? '3.5rem' : '17rem' }}
      >
        <div
          className={cn(
            'flex items-center border-b border-dsa-border',
            sidebarCollapsed ? 'h-14 justify-center' : 'h-14 justify-between px-4'
          )}
        >
          <Link
            href="/"
            className={cn(
              'inline-flex items-center gap-2 text-dsa-text-strong',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <Logo className="h-5 w-5" />
            {!sidebarCollapsed && (
              <span className="text-[13px] font-semibold tracking-tight">Algora</span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-0.5">
              <ThemeToggle compact />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Collapse sidebar"
                onClick={() => setSidebarCollapsed(true)}
                className="h-7 w-7 text-dsa-muted-soft"
              >
                <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
              </Button>
            </div>
          )}
        </div>

        {sidebarCollapsed ? (
          <>
            <TooltipProvider delayDuration={0}>
              <nav className="flex-1 overflow-y-auto py-3">
                <ul className="space-y-1 px-2">
                  {navItems.slice(1).map(item => {
                    const Icon = iconMap[item.icon]
                    const active = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              aria-label={item.label}
                              className={cn(
                                'flex h-9 items-center justify-center rounded-md transition-colors',
                                active
                                  ? 'bg-dsa-card text-dsa-primary-container'
                                  : 'text-dsa-muted-soft hover:bg-dsa-card hover:text-dsa-text'
                              )}
                            >
                              <Icon className="h-4 w-4" strokeWidth={1.7} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex flex-col gap-0.5">
                            <span className="font-medium text-dsa-text-strong">{item.label}</span>
                            <span className="max-w-[13rem] text-[11px] leading-4 text-dsa-muted">{item.summary}</span>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </TooltipProvider>
            <div className="flex flex-col items-center gap-1 border-t border-dsa-border py-2">
              <ThemeToggle compact />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Expand sidebar"
                onClick={() => setSidebarCollapsed(false)}
                className="h-7 w-7 text-dsa-muted-soft"
              >
                <ChevronsRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-dsa-border px-3 py-2.5">
              <SearchBox value={search} onChange={setSearch} />
            </div>
            <NavList />
            <div className="flex flex-col gap-2.5 border-t border-dsa-border px-4 py-3">
              {REPO_URL && (
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-dsa-muted transition-colors hover:text-dsa-text"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  Source on GitHub
                </a>
              )}
              <ShortcutsHelp />
            </div>
          </>
        )}
      </aside>
    </>
  )
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="group relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-dsa-muted-soft"
        strokeWidth={1.8}
      />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search topics"
        className="h-8 rounded-md border border-dsa-border bg-dsa-card pl-8 pr-2 text-[13px] placeholder:text-dsa-muted-soft focus:border-dsa-border-strong"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-dsa-border bg-dsa-bg px-1 py-px font-mono text-[10px] text-dsa-muted-soft md:inline-flex">
        /
      </kbd>
    </div>
  )
}
