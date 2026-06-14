'use client'
import { useState, useCallback } from 'react'
import { ChartPreview } from '@/components/charts/chart-preview'
import { CHARTS } from '@/data/charts'
import { Sparkles, ClipboardPaste, RotateCcw, ChevronRight } from 'lucide-react'

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

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, unknown> = {}
    headers.forEach((h, i) => {
      const v = vals[i] ?? ''
      row[h] = v !== '' && !isNaN(Number(v)) ? Number(v) : v
    })
    return row
  })
}

// ── Parse pasted input: tries JSON first, then CSV ────────────────────────────
function parseInput(text: string): { data: Record<string, unknown>[]; format: 'json' | 'csv' } | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  // Try JSON
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed) && parsed.length > 0) return { data: parsed, format: 'json' }
  } catch { /* fall through to CSV */ }
  // Try CSV
  const csv = parseCSV(trimmed)
  if (csv.length > 0) return { data: csv, format: 'csv' }
  return null
}

// ── Data analyzer → chart suggestions ─────────────────────────────────────────
interface Suggestion {
  chartId: string
  score: number
  reason: string
}

function analyzeData(data: Record<string, unknown>[]): Suggestion[] {
  if (!data.length) return []
  const keys = Object.keys(data[0])
  const numericKeys = keys.filter(k => data.slice(0, 10).every(row => {
    const v = row[k]
    return typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v)))
  }))
  const stringKeys = keys.filter(k => !numericKeys.includes(k))
  const hasTime = keys.some(k => /date|time|month|year|week|day|quarter|period|hour/i.test(k))
  const rowCount = data.length
  const suggestions: Suggestion[] = []

  if (hasTime && numericKeys.length === 1) {
    suggestions.push({ chartId: 'line-chart', score: 95, reason: 'Time-series with one metric — perfect for trends' })
    suggestions.push({ chartId: 'area-chart', score: 85, reason: 'Area chart highlights volume changes over time' })
    suggestions.push({ chartId: 'bar-chart', score: 65, reason: 'Bar chart works for discrete time periods' })
  } else if (hasTime && numericKeys.length >= 2) {
    suggestions.push({ chartId: 'multi-line', score: 95, reason: 'Multiple metrics over time — Multi-line is ideal' })
    suggestions.push({ chartId: 'stacked-area', score: 80, reason: 'Stacked area shows cumulative growth' })
    suggestions.push({ chartId: 'grouped-bar', score: 65, reason: 'Grouped bars compare values at each time point' })
  } else if (stringKeys.length >= 1 && numericKeys.length === 1) {
    suggestions.push({ chartId: 'bar-chart', score: 90, reason: 'Categories + one metric — classic Bar chart' })
    suggestions.push({ chartId: 'horizontal-bar', score: 82, reason: 'Better when category names are long' })
    if (rowCount <= 7) {
      suggestions.push({ chartId: 'pie-chart', score: 75, reason: 'Few categories — Pie shows share of total' })
    } else {
      suggestions.push({ chartId: 'treemap', score: 70, reason: 'Many categories — Treemap uses space efficiently' })
    }
  } else if (stringKeys.length >= 1 && numericKeys.length >= 2) {
    suggestions.push({ chartId: 'grouped-bar', score: 90, reason: 'Multiple metrics per category — Grouped Bar' })
    suggestions.push({ chartId: 'stacked-bar', score: 82, reason: 'Stacked Bar shows part-to-whole breakdown' })
    suggestions.push({ chartId: 'radar-chart', score: 70, reason: 'Radar chart compares all metrics at once' })
  } else if (numericKeys.length === 2 && stringKeys.length === 0) {
    suggestions.push({ chartId: 'scatter-plot', score: 95, reason: 'Two numeric variables — Scatter Plot reveals correlation' })
    suggestions.push({ chartId: 'line-chart', score: 60, reason: 'Line chart if one variable is ordered' })
  } else if (numericKeys.length >= 3 && stringKeys.length === 0) {
    suggestions.push({ chartId: 'scatter-plot', score: 88, reason: 'Numeric-only data — Scatter Plot for relationships' })
    suggestions.push({ chartId: 'radar-chart', score: 78, reason: 'Radar chart compares multiple dimensions' })
    suggestions.push({ chartId: 'histogram', score: 65, reason: 'Histogram for distribution of one variable' })
  } else if (rowCount > 20 && numericKeys.length === 1) {
    suggestions.push({ chartId: 'histogram', score: 92, reason: 'Large dataset, one metric — Histogram for distribution' })
    suggestions.push({ chartId: 'bar-chart', score: 65, reason: 'Bar chart if categories are meaningful' })
  }

  if (!suggestions.length) {
    suggestions.push({ chartId: 'bar-chart', score: 70, reason: 'Bar chart is a safe default for most datasets' })
    suggestions.push({ chartId: 'line-chart', score: 60, reason: 'Line chart if data has natural ordering' })
  }

  return suggestions.slice(0, 3)
}

// ── Paste + Suggest panel ─────────────────────────────────────────────────────
function PastePanel({
  onApply,
}: {
  onApply: (chartId: string, data: Record<string, unknown>[]) => void
}) {
  const [paste, setPaste] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [parsedData, setParsedData] = useState<Record<string, unknown>[] | null>(null)
  const [detectedFormat, setDetectedFormat] = useState<'json' | 'csv' | null>(null)

  const handlePaste = (text: string) => {
    setPaste(text)
    setParseError(null)
    setSuggestions([])
    setParsedData(null)
    setDetectedFormat(null)
    if (!text.trim()) return
    const result = parseInput(text)
    if (!result) {
      setParseError('Could not parse. Paste valid JSON array or CSV with headers.')
      return
    }
    setParsedData(result.data)
    setDetectedFormat(result.format)
    setSuggestions(analyzeData(result.data))
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-auto p-4">
      {/* Paste area */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <ClipboardPaste className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paste Your Data</p>
        </div>
        <textarea
          className="w-full resize-none rounded-lg border border-input bg-background font-mono text-xs p-3 focus:outline-none focus:ring-2 focus:ring-ring"
          rows={7}
          placeholder={"Paste CSV or JSON here…\n\nCSV example:\nmonth,revenue\nJan,4200\nFeb,5800\n\nJSON example:\n[{\"month\":\"Jan\",\"revenue\":4200}]"}
          value={paste}
          onChange={e => handlePaste(e.target.value)}
          spellCheck={false}
        />
        {parseError && (
          <p className="text-xs text-destructive mt-1">{parseError}</p>
        )}
        {detectedFormat && parsedData && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ✓ Detected {detectedFormat.toUpperCase()} — {parsedData.length} rows, {Object.keys(parsedData[0]).length} columns
          </p>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && parsedData && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Charts</p>
          </div>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => {
              const chart = CHARTS.find(c => c.id === s.chartId)
              return (
                <button
                  key={s.chartId}
                  onClick={() => onApply(s.chartId, parsedData)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all hover:border-primary/60 hover:bg-primary/5 group ${
                    i === 0 ? 'border-primary/40 bg-primary/5' : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      {i === 0 && (
                        <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded px-1 py-0.5 leading-none">BEST</span>
                      )}
                      <span className="text-xs font-semibold">{chart?.name || s.chartId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground font-mono">{s.score}%</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{s.reason}</p>
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Click a suggestion to apply it instantly</p>
        </div>
      )}

      {!paste && (
        <div className="text-center py-4 text-xs text-muted-foreground">
          <Sparkles className="h-6 w-6 mx-auto mb-2 opacity-30" />
          Paste data above and we'll suggest<br />the best chart types for it
        </div>
      )}
    </div>
  )
}

// ── JSON editor panel ─────────────────────────────────────────────────────────
function JsonEditor({
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
      if (Array.isArray(parsed)) { setError(null); onChange(parsed) }
      else setError('Must be an array of objects')
    } catch { setError('Invalid JSON') }
  }

  return (
    <div className="flex flex-col gap-2 h-full p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">JSON Editor</p>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      <textarea
        className="flex-1 w-full resize-none rounded-lg border border-input bg-background font-mono text-xs p-3 focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px]"
        value={raw}
        onChange={e => { setRaw(e.target.value); handleChange(e.target.value) }}
        spellCheck={false}
      />
    </div>
  )
}

// ── Main playground ───────────────────────────────────────────────────────────
export function PlaygroundClient() {
  const [activeChart, setActiveChart] = useState('bar-chart')
  const [data, setData] = useState<Record<string, unknown>[]>(getDefaultData('bar-chart'))
  const [rightTab, setRightTab] = useState<'paste' | 'json'>('paste')

  const handleChartChange = useCallback((chartId: string) => {
    setActiveChart(chartId)
    setData(getDefaultData(chartId))
  }, [])

  const handleApplySuggestion = useCallback((chartId: string, newData: Record<string, unknown>[]) => {
    setActiveChart(chartId)
    setData(newData)
    setRightTab('json')
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

      {/* Right: Paste + Suggest / JSON editor */}
      <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-border flex">
          <button
            onClick={() => setRightTab('paste')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              rightTab === 'paste'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Paste & Detect
          </button>
          <button
            onClick={() => setRightTab('json')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              rightTab === 'json'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            JSON Editor
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-auto">
          {rightTab === 'paste'
            ? <PastePanel onApply={handleApplySuggestion} />
            : <JsonEditor data={data} onChange={setData} />
          }
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => { setData(getDefaultData(activeChart)); setRightTab('json') }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg py-2 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to example data
          </button>
        </div>
      </div>
    </div>
  )
}
