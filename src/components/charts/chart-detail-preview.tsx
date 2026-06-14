'use client'
import { useState } from 'react'
import { ChartPreview } from './chart-preview'
import type { ChartDef } from '@/data/charts/types'

interface Props {
  chart: ChartDef
}

export function ChartDetailPreview({ chart }: Props) {
  const [height, setHeight] = useState(320)

  const data = Array.isArray(chart.exampleData)
    ? (chart.exampleData as Record<string, unknown>[])
    : []

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">{chart.name} · Example Data</span>
        <div className="flex items-center gap-1">
          {[200, 320, 420].map((h) => (
            <button
              key={h}
              onClick={() => setHeight(h)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${height === h ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {h === 200 ? 'S' : h === 320 ? 'M' : 'L'}
            </button>
          ))}
        </div>
      </div>
      {/* Chart */}
      <div className="p-6">
        <ChartPreview chartId={chart.id} data={data} height={height} />
      </div>
    </div>
  )
}
