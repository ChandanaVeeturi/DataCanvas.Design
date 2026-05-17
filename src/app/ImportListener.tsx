import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Database, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDatasetsStore } from '@/stores/datasets.store'
import { useChartsStore } from '@/stores/charts.store'
import { useDashboardsStore } from '@/stores/dashboards.store'
import { clearShareFromUrl, readShareFromUrl, rekeyImported } from '@/lib/share-url'
import { toast } from '@/stores/toast.store'

/**
 * Listens for #import=... in the URL and offers to apply the imported
 * dashboard + chart specs to a local dataset of the user's choosing.
 *
 * Mounted once at the app root.
 */
export function ImportListener() {
  const navigate = useNavigate()
  const datasets = useDatasetsStore((s) => s.datasets)
  const hydrated = useDatasetsStore((s) => s.hydrated)
  const upsertChart = useChartsStore((s) => s.upsertChart)
  const upsertDashboard = useDashboardsStore((s) => s.upsertDashboard)

  const [payload, setPayload] = useState(() => readShareFromUrl())
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    const onHash = () => setPayload(readShareFromUrl())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (!payload || !hydrated) return null

  const dismiss = () => {
    clearShareFromUrl()
    setPayload(null)
    setPicked(null)
  }

  const handleImport = async () => {
    if (!picked) return
    const { dashboard, charts } = rekeyImported(payload, picked)
    for (const chart of charts) await upsertChart(chart)
    await upsertDashboard(dashboard)
    clearShareFromUrl()
    setPayload(null)
    setPicked(null)
    toast.success(`Imported dashboard "${dashboard.name}"`, `${dashboard.tiles.length} tiles · ${charts.length} charts`)
    navigate(`/workspace/${picked}`)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg border bg-card shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Share2 className="h-3 w-3 text-primary" />
            Import shared dashboard
          </div>
          <h3 className="mt-1 text-base font-semibold">{payload.dashboard.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a local dataset to apply this dashboard to. Column references are matched by name —
            choose one with the same columns the original used.
          </p>
        </div>

        <div className="max-h-[40vh] overflow-auto p-2">
          {datasets.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              <Database className="mx-auto mb-2 h-5 w-5" />
              You don't have any datasets loaded yet. Load a sample or upload one, then come back to this URL.
            </div>
          ) : (
            <ul className="space-y-1">
              {datasets.map((d) => {
                const active = picked === d.id
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setPicked(d.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                        active
                          ? 'border-primary/60 bg-primary/10'
                          : 'border-border hover:bg-accent/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Database className={`h-3.5 w-3.5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>
                          <span className="block text-sm font-medium">{d.name}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            {d.rowCount.toLocaleString()} rows · {d.columns.length} columns
                          </span>
                        </span>
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t bg-card/40 px-5 py-3">
          <span className="text-[10px] text-muted-foreground">
            {payload.dashboard.tiles.length} tile{payload.dashboard.tiles.length === 1 ? '' : 's'} ·{' '}
            {payload.charts.length} chart spec{payload.charts.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={dismiss}>Dismiss</Button>
            <Button size="sm" disabled={!picked} onClick={() => void handleImport()}>
              Apply to dataset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
