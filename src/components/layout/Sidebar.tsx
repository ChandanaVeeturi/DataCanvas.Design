import { Link, useLocation } from 'react-router-dom'
import { FileSpreadsheet, Plus, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDatasetsStore } from '@/stores/datasets.store'

export function Sidebar() {
  const datasets = useDatasetsStore((s) => s.datasets)
  const location = useLocation()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card/40 md:flex">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Datasets
        </span>
        <Link
          to="/"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          aria-label="Upload dataset"
        >
          <Plus className="h-3.5 w-3.5" />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-auto px-2 pb-4">
        {datasets.length === 0 ? (
          <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-border/70 px-3 py-4 text-xs text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" />
            <p className="leading-snug">
              No datasets yet. Drop a CSV or Excel file on the landing page to get
              started.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {datasets.map((d) => {
              const to = `/workspace/${d.id}`
              const active = location.pathname === to
              return (
                <li key={d.id}>
                  <Link
                    to={to}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-accent/15 text-foreground'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                    )}
                  >
                    <Table2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{d.name}</span>
                    <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/70">
                      {d.rowCount.toLocaleString()}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      <div className="border-t px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">
        <p>Your files never leave the browser.</p>
        <p className="text-muted-foreground/60">
          Persisted locally with IndexedDB · survives reloads.
        </p>
      </div>
    </aside>
  )
}
