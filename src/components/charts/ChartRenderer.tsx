import { useEffect, useMemo, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTheme } from 'next-themes'
import type { EChartsInstance } from 'echarts-for-react'
import type { ChartSpec, Dataset } from '@/lib/types'
import { buildChartOption } from '@/lib/chart-data'

interface ChartRendererProps {
  spec: ChartSpec
  dataset: Dataset
  className?: string
  onReady?: (instance: EChartsInstance) => void
  /**
   * Fired when the user clicks an element inside the chart. The name is the
   * category/slice/leaf label as understood by ECharts.
   */
  onElementClick?: (info: { name: string; seriesName?: string }) => void
}

export function ChartRenderer({ spec, dataset, className, onReady, onElementClick }: ChartRendererProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const instanceRef = useRef<EChartsInstance | null>(null)

  const option = useMemo(() => {
    const base = buildChartOption(spec, dataset)
    return {
      backgroundColor: 'transparent',
      textStyle: { color: isDark ? '#e2e8f0' : '#0f172a', fontFamily: 'Inter, ui-sans-serif, system-ui' },
      ...base,
    }
  }, [spec, dataset, isDark])

  useEffect(() => {
    const inst = instanceRef.current
    if (inst) inst.resize()
  }, [spec.type])

  return (
    <div className={className}>
      <ReactECharts
        notMerge
        lazyUpdate
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
        theme={isDark ? 'dark' : undefined}
        onEvents={
          onElementClick
            ? {
                click: (params: { name?: string; seriesName?: string; data?: unknown }) => {
                  const name = typeof params?.name === 'string' && params.name.length > 0 ? params.name : null
                  if (!name) return
                  onElementClick({ name, seriesName: params?.seriesName })
                },
              }
            : undefined
        }
        onChartReady={(inst) => {
          instanceRef.current = inst
          onReady?.(inst)
        }}
      />
    </div>
  )
}
