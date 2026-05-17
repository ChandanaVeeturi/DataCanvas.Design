import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Database,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Table2,
  Trash2,
} from 'lucide-react'
import { usePaletteStore } from '@/stores/palette.store'
import { useDatasetsStore } from '@/stores/datasets.store'
import { useChartsStore } from '@/stores/charts.store'
import { useDashboardsStore } from '@/stores/dashboards.store'
import { clearAll } from '@/lib/idb'
import { toast } from '@/stores/toast.store'
import { cn } from '@/lib/utils'

type Command = {
  id: string
  label: string
  description?: string
  group: 'Navigation' | 'Datasets' | 'Charts' | 'Dashboards' | 'Actions'
  icon: typeof Database
  keywords?: string
  run: () => void
}

function fuzzyScore(haystack: string, needle: string): number {
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase().trim()
  if (n === '') return 1
  if (h.includes(n)) return 2 + (h.startsWith(n) ? 1 : 0)
  // Subsequence match
  let hi = 0
  let matched = 0
  for (let i = 0; i < n.length; i++) {
    const c = n[i]
    while (hi < h.length && h[hi] !== c) hi++
    if (hi >= h.length) return 0
    matched++
    hi++
  }
  return matched / n.length
}

export function CommandPalette() {
  const open = usePaletteStore((s) => s.open)
  const setOpen = usePaletteStore((s) => s.setOpen)
  const navigate = useNavigate()
  const datasets = useDatasetsStore((s) => s.datasets)
  const charts = useChartsStore((s) => s.charts)
  const dashboards = useDashboardsStore((s) => s.dashboards)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // Defer to next tick so focus actually lands after dialog mounts
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [
      { id: 'nav-home', label: 'Home', group: 'Navigation', icon: Home, run: () => navigate('/') },
      { id: 'nav-gallery', label: 'Chart library', description: 'Browse all chart types', group: 'Navigation', icon: BookOpen, run: () => navigate('/gallery') },
      { id: 'nav-settings', label: 'Settings', group: 'Navigation', icon: Settings, run: () => navigate('/settings') },
    ]
    for (const d of datasets) {
      cmds.push({
        id: `ds-${d.id}`,
        label: d.name,
        description: `${d.rowCount.toLocaleString()} rows · ${d.columns.length} columns`,
        group: 'Datasets',
        icon: Database,
        keywords: d.sourceFile,
        run: () => navigate(`/workspace/${d.id}`),
      })
    }
    for (const c of charts) {
      const ds = datasets.find((d) => d.id === c.datasetId)
      cmds.push({
        id: `chart-${c.id}`,
        label: c.title,
        description: `${c.type}${ds ? ` · ${ds.name}` : ''}`,
        group: 'Charts',
        icon: BarChart3,
        keywords: `${c.type} ${ds?.name ?? ''}`,
        run: () => ds && navigate(`/workspace/${ds.id}`),
      })
    }
    for (const d of dashboards) {
      const ds = datasets.find((x) => x.id === d.datasetId)
      cmds.push({
        id: `dash-${d.id}`,
        label: d.name,
        description: `${d.tiles.length} tiles${ds ? ` · ${ds.name}` : ''}`,
        group: 'Dashboards',
        icon: LayoutDashboard,
        keywords: ds?.name ?? '',
        run: () => ds && navigate(`/workspace/${ds.id}`),
      })
    }
    cmds.push({
      id: 'action-clear-all',
      label: 'Clear all local data',
      description: 'Delete every dataset, chart, and dashboard from IndexedDB',
      group: 'Actions',
      icon: Trash2,
      run: async () => {
        if (!confirm('This will permanently delete every dataset, chart, and dashboard stored in this browser. Continue?')) return
        await clearAll()
        toast.success('Local data cleared', 'Reload the page to start fresh.')
      },
    })
    return cmds
  }, [datasets, charts, dashboards, navigate])

  const results = useMemo(() => {
    if (!query.trim()) return commands.slice(0, 30)
    return commands
      .map((c) => {
        const score = Math.max(
          fuzzyScore(c.label, query),
          fuzzyScore(c.group, query),
          c.keywords ? fuzzyScore(c.keywords, query) : 0,
        )
        return { c, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map((r) => r.c)
  }, [commands, query])

  // Reset active when results change
  useEffect(() => {
    setActive(0)
  }, [results.length, query])

  // Keep active item in view
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLLIElement>(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  if (!open) return null

  const runActive = () => {
    const cmd = results[active]
    if (!cmd) return
    setOpen(false)
    cmd.run()
  }

  // Group results for display
  const grouped: Array<{ group: Command['group']; items: { cmd: Command; idx: number }[] }> = []
  results.forEach((cmd, idx) => {
    const last = grouped[grouped.length - 1]
    if (last && last.group === cmd.group) {
      last.items.push({ cmd, idx })
    } else {
      grouped.push({ group: cmd.group, items: [{ cmd, idx }] })
    }
  })

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-background/70 px-4 pt-[10vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-xl border bg-card shadow-2xl animate-fade-in"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => Math.min(i + 1, results.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                runActive()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
              }
            }}
            placeholder="Search datasets, charts, dashboards, actions…"
            className="h-7 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[50vh] overflow-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto mb-1 h-4 w-4" />
              No matches for "{query}"
            </li>
          ) : (
            grouped.map((group) => (
              <li key={group.group} className="mb-1">
                <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </div>
                <ul>
                  {group.items.map(({ cmd, idx }) => {
                    const Icon = cmd.icon
                    const isActive = idx === active
                    return (
                      <li key={cmd.id} data-idx={idx}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(idx)}
                          onClick={runActive}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
                            isActive
                              ? 'bg-primary/10 text-foreground'
                              : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                          )}
                        >
                          <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="min-w-0 flex-1 truncate">
                            <span className="text-foreground">{cmd.label}</span>
                            {cmd.description && (
                              <span className="ml-2 text-xs text-muted-foreground">{cmd.description}</span>
                            )}
                          </span>
                          {isActive && <ArrowRight className="h-3 w-3 text-primary" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t bg-card/40 px-3 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-medium">↑↓</kbd>
            navigate
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 font-medium">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <Table2 className="h-3 w-3" />
            {results.length} {results.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
      </div>
    </div>
  )
}
