import type { ChartType, Column } from '@/lib/types'

interface EncodingFieldDef {
  label: string
  opts: { value: string; label: string; hint?: string }[]
}

export interface EncodingLayout {
  x?: EncodingFieldDef
  y?: EncodingFieldDef
  series?: EncodingFieldDef
  size?: EncodingFieldDef
  /** Aggregation control is shown. */
  agg?: boolean
  /** Bin-count slider is shown (histogram). */
  bins?: boolean
}

function colOpts(cols: Column[], filter?: (c: Column) => boolean) {
  return cols
    .filter((c) => !c.hidden && (!filter || filter(c)))
    .map((c) => ({ value: c.id, label: c.name, hint: c.type }))
}

export function encodingLayoutFor(type: ChartType, cols: Column[]): EncodingLayout {
  const all = colOpts(cols)
  const numeric = colOpts(cols, (c) => c.type === 'number')
  const cats = colOpts(cols, (c) => c.type === 'categorical' || c.type === 'string' || c.type === 'boolean')
  const ordered = colOpts(cols, (c) => c.type === 'number' || c.type === 'date' || c.type === 'categorical')

  switch (type) {
    case 'bar':
      return {
        x: { label: 'Category (X)', opts: cats.length ? cats : all },
        y: { label: 'Value (Y)', opts: numeric },
        series: { label: 'Group / color', opts: cats },
        agg: true,
      }
    case 'line':
    case 'area':
      return {
        x: { label: 'X axis', opts: ordered },
        y: { label: 'Y axis', opts: numeric },
        series: { label: 'Series (color)', opts: cats },
        agg: true,
      }
    case 'scatter':
      return {
        x: { label: 'X (numeric)', opts: numeric },
        y: { label: 'Y (numeric)', opts: numeric },
        series: { label: 'Color', opts: cats },
        size: { label: 'Size', opts: numeric },
      }
    case 'pie':
    case 'donut':
      return {
        x: { label: 'Slice (category)', opts: cats.length ? cats : all },
        y: { label: 'Value (optional)', opts: numeric },
        agg: true,
      }
    case 'histogram':
      return {
        x: { label: 'Numeric column', opts: numeric },
        bins: true,
      }
    case 'boxplot':
      return {
        x: { label: 'Group by (optional)', opts: cats },
        y: { label: 'Numeric column', opts: numeric },
      }
    case 'heatmap':
      return {
        x: { label: 'X axis', opts: cats.length ? cats : all },
        series: { label: 'Y axis', opts: cats.length ? cats : all },
        y: { label: 'Value', opts: numeric },
        agg: true,
      }
    case 'treemap':
      return {
        x: { label: 'Leaf (category)', opts: cats.length ? cats : all },
        y: { label: 'Value (optional)', opts: numeric },
        series: { label: 'Group (optional)', opts: cats },
        agg: true,
      }
    case 'radar':
      return {
        x: { label: 'Group (category)', opts: cats },
        agg: true,
      }
    default:
      return {}
  }
}
