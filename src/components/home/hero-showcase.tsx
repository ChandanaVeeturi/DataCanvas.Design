'use client'
import { useState } from 'react'
import { ChartPreview } from '@/components/charts/chart-preview'
import { CHARTS } from '@/data/charts'

const SHOWCASE_CHARTS = ['bar-chart', 'line-chart', 'pie-chart', 'scatter-plot', 'funnel-chart', 'treemap']

export function HeroShowcase() {
  const [active, setActive] = useState('bar-chart')
  const chart = CHARTS.find(c => c.id === active)

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-border bg-muted/50 flex overflow-x-auto">
        {SHOWCASE_CHARTS.map((id) => {
          const c = CHARTS.find(ch => ch.id === id)
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {c?.name}
            </button>
          )
        })}
      </div>
      {/* Chart preview */}
      <div className="p-6">
        <ChartPreview chartId={active} data={(chart?.exampleData as Record<string, unknown>[]) || []} height={260} />
      </div>
      {/* Chart info */}
      {chart && (
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{chart.name}</p>
            <p className="text-xs text-muted-foreground">{chart.description.slice(0, 60)}…</p>
          </div>
          <a
            href={`/charts/${chart.category}/${chart.id}`}
            className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
          >
            View guide →
          </a>
        </div>
      )}
    </div>
  )
}
