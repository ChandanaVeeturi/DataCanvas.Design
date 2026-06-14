'use client'
import { useState, useCallback } from 'react'
import { ChartPreview } from '@/components/charts/chart-preview'
import { CHARTS } from '@/data/charts'

const PLAYGROUND_CHARTS = [
  'bar-chart', 'grouped-bar', 'horizontal-bar', 'stacked-bar',
  'line-chart', 'multi-line', 'area-chart', 'stacked-area',
  'scatter-plot', 'pie-chart', 'donut-chart', 'radar-chart',
  'treemap', 'funnel-chart', 'histogram',
]

const DEFAULT_DATA: Record<string, Record<string, unknown>[]> = {
  'bar-chart': [
    { category: 'Product A', value: 42000 },
    { category: 'Product B', value: 35000 },
    { category: 'Product C', value: 28000 },
    { category: 'Product D', value: 51000 },
    { category: 'Product E', value: 19000 },
  ],
  'line-chart': [
    { month: 'Jan', value: 4200 },
    { month: 'Feb', value: 5800 },
    { month: 'Mar', value: 5200 },
    { month: 'Apr', value: 7100 },
    { month: 'May', value: 6800 },
    { month: 'Jun', value: 8400 },
  ],
  'area-chart': [
    { month: 'Jan', users: 12000 },
    { month: 'Feb', users: 15000 },
    { month: 'Mar', users: 14200 },
    { month: 'Apr', users: 18500 },
    { month: 'May', users: 21000 },
    { month: 'Jun', users: 24500 },
  ],
  'pie-chart': [
    { name: 'Product A', value: 42 },
    { name: 'Product B', value: 28 },
    { name: 'Product C', value: 18 },
    { name: 'Other', value: 12 },
  ],
  'scatter-plot': [
    { x: 45, y: 72 }, { x: 52, y: 85 }, { x: 38, y: 61 },
    { x: 61, y: 92 }, { x: 29, y: 48 }, { x: 74, y: 88 },
    { x: 55, y: 79 }, { x: 42, y: 65 }, { x: 67, y: 95 },
  ],
  'funnel-chart': [
    { stage: 'Awareness', value: 50000, fill: 'hsl(239, 84%, 60%)' },
    { stage: 'Interest', value: 32000, fill: 'hsl(239, 84%, 65%)' },
    { stage: 'Consideration', value: 18000, fill: 'hsl(239, 84%, 70%)' },
    { stage: 'Purchase', value: 4200, fill: 'hsl(239, 84%, 75%)' },
  ],
}

function getDefaultData(chartId: string): Record<string, unknown>[] {
  if (DEFAULT_DATA[chartId]) return DEFAULT_DATA[chartId]
  const chart = CHARTS.find(c => c.id === chartId)
  return Array.isArray(chart?.exampleData) ? (chart.exampleData as Record<string, unknown>[]) : DEFAULT_DATA['bar-chart']
}

function DataEditor({
  data,
  onChange,
}: {
  data: Record<string, unknown>[]
  onChange: (d: Record<string, unknown>[]) => void
}) {
  const [raw, setRaw] = useState(JSON.stringify(data, null, 2))
  const [error, setError] = useState<string | null>(null)

  const handleChange = (val: string) => {
    setRaw(val)
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) {
        setError(null)
        onChange(parsed)
      } else {
        setError('Data must be an array of objects')
      }
    } catch {
      setError('Invalid JSON')
    }
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Edit Data</p>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      <textarea
        className="flex-1 w-full resize-none rounded-lg border border-input bg-background font-mono text-xs p-3 focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px]"
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  )
}

export function PlaygroundClient() {
  const [activeChart, setActiveChart] = useState('bar-chart')
  const [data, setData] = useState<Record<string, unknown>[]>(getDefaultData('bar-chart'))
  const [showEditor, setShowEditor] = useState(true)

  const handleChartChange = useCallback((chartId: string) => {
    setActiveChart(chartId)
    setData(getDefaultData(chartId))
  }, [])

  const chart = CHARTS.find(c => c.id === activeChart)

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Chart type picker */}
      <div className="w-52 shrink-0 border-r border-border bg-card overflow-y-auto flex flex-col">
        <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">Chart Type</p>
        <div className="flex flex-col py-2">
          {PLAYGROUND_CHARTS.map((id) => {
            const c = CHARTS.find(ch => ch.id === id)
            return (
              <button
                key={id}
                onClick={() => handleChartChange(id)}
                className={`px-4 py-2.5 text-sm text-left font-medium transition-colors ${
                  activeChart === id
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary border-l-2 border-transparent'
                }`}
              >
                {c?.name || id}
              </button>
            )
          })}
        </div>
      </div>

      {/* Center: Chart preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border px-5 py-2.5 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{chart?.name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground capitalize">{chart?.category}</span>
          </div>
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
          >
            {showEditor ? 'Hide Editor' : 'Show Editor'}
          </button>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <ChartPreview chartId={activeChart} data={data} height={400} />
        </div>
        {chart && (
          <div className="border-t border-border px-5 py-3 bg-card/50">
            <p className="text-xs text-muted-foreground">{chart.description}</p>
            <a href={`/charts/${chart.category}/${chart.id}`} className="text-xs text-primary hover:underline mt-0.5 inline-block">
              View full guide →
            </a>
          </div>
        )}
      </div>

      {/* Right: Data editor */}
      {showEditor && (
        <div className="w-72 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Editor</p>
            <p className="text-xs text-muted-foreground mt-0.5">Edit JSON to update the chart</p>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <DataEditor data={data} onChange={setData} />
          </div>
          <div className="border-t border-border p-3">
            <button
              onClick={() => setData(getDefaultData(activeChart))}
              className="w-full text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg py-2 transition-colors"
            >
              Reset to example data
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
