import type { Aggregator, CellValue, ChartSpec, Column, DataRow, Dataset } from './types'

type EChartsOption = Record<string, unknown>

const PALETTE = [
  '#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#10b981',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#3b82f6',
]

function toNumber(v: CellValue): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'boolean') return v ? 1 : 0
  if (v instanceof Date) return v.getTime()
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toKey(v: CellValue): string {
  if (v === null || v === undefined) return '(null)'
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v)
}

function aggregate(values: number[], agg: Aggregator): number {
  if (values.length === 0) return 0
  switch (agg) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'count':
      return values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid]
    }
    default:
      return values[0] ?? 0
  }
}

function findColumn(dataset: Dataset, id?: string): Column | undefined {
  if (!id) return undefined
  return dataset.columns.find((c) => c.id === id)
}

function tooltip() {
  return {
    trigger: 'item' as const,
    backgroundColor: 'rgba(20, 20, 30, 0.92)',
    borderWidth: 0,
    textStyle: { color: '#fff', fontSize: 12 },
    extraCssText: 'border-radius:6px;backdrop-filter:blur(8px);',
  }
}

function gridDefault() {
  return { left: 56, right: 24, top: 32, bottom: 48, containLabel: true }
}

function buildBar(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const xCol = findColumn(dataset, spec.encoding.x)
  const yCol = findColumn(dataset, spec.encoding.y)
  if (!xCol || !yCol) return placeholder('Select X and Y columns')

  const seriesCol = findColumn(dataset, spec.encoding.series)
  const buckets = new Map<string, Map<string, number[]>>()

  for (const row of dataset.rows) {
    const xKey = toKey(row[xCol.id])
    const sKey = seriesCol ? toKey(row[seriesCol.id]) : '__single__'
    const y = toNumber(row[yCol.id])
    if (y === null && spec.aggregate !== 'count') continue
    if (!buckets.has(xKey)) buckets.set(xKey, new Map())
    const inner = buckets.get(xKey)!
    if (!inner.has(sKey)) inner.set(sKey, [])
    inner.get(sKey)!.push(y ?? 0)
  }

  const xKeys = Array.from(buckets.keys())
  const seriesKeys = seriesCol
    ? Array.from(new Set(Array.from(buckets.values()).flatMap((m) => Array.from(m.keys()))))
    : ['__single__']

  const series = seriesKeys.map((sk, i) => ({
    name: sk === '__single__' ? yCol.name : sk,
    type: 'bar' as const,
    stack: spec.options.stacked ? 'total' : undefined,
    itemStyle: { color: PALETTE[i % PALETTE.length], borderRadius: [4, 4, 0, 0] },
    data: xKeys.map((xk) => {
      const vals = buckets.get(xk)?.get(sk) ?? []
      return vals.length === 0 ? null : aggregate(vals, spec.aggregate)
    }),
    emphasis: { focus: 'series' },
  }))

  const horizontal = spec.options.horizontal
  return {
    tooltip: { ...tooltip(), trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: spec.options.showLegend !== false && seriesCol
      ? { top: 0, textStyle: { color: 'inherit' } }
      : undefined,
    grid: gridDefault(),
    xAxis: horizontal
      ? { type: 'value', splitLine: { lineStyle: { opacity: 0.2 } } }
      : { type: 'category', data: xKeys, axisLabel: { rotate: xKeys.length > 8 ? 30 : 0 } },
    yAxis: horizontal
      ? { type: 'category', data: xKeys }
      : {
          type: spec.options.logScale ? 'log' : 'value',
          splitLine: { lineStyle: { opacity: 0.2 } },
        },
    series,
  }
}

function buildLine(spec: ChartSpec, dataset: Dataset, asArea = false): EChartsOption {
  const xCol = findColumn(dataset, spec.encoding.x)
  const yCol = findColumn(dataset, spec.encoding.y)
  if (!xCol || !yCol) return placeholder('Select X and Y columns')

  const seriesCol = findColumn(dataset, spec.encoding.series)
  const isTimeX = xCol.type === 'date' || xCol.type === 'number'

  const buckets = new Map<string, Array<[number | string, number]>>()
  for (const row of dataset.rows) {
    const x = row[xCol.id]
    const y = toNumber(row[yCol.id])
    if (y === null) continue
    const sKey = seriesCol ? toKey(row[seriesCol.id]) : '__single__'
    if (!buckets.has(sKey)) buckets.set(sKey, [])
    const xv = isTimeX ? (toNumber(x) ?? 0) : toKey(x)
    buckets.get(sKey)!.push([xv, y])
  }

  for (const arr of buckets.values()) arr.sort((a, b) => (a[0] < b[0] ? -1 : 1))

  const series = Array.from(buckets.entries()).map(([sk, data], i) => ({
    name: sk === '__single__' ? yCol.name : sk,
    type: 'line' as const,
    smooth: spec.options.smooth ?? false,
    symbol: 'circle',
    symbolSize: 6,
    showSymbol: data.length <= 80,
    sampling: 'lttb',
    stack: spec.options.stacked && asArea ? 'total' : undefined,
    areaStyle: asArea ? { opacity: 0.25 } : undefined,
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    lineStyle: { color: PALETTE[i % PALETTE.length], width: 2 },
    data,
    emphasis: { focus: 'series' },
  }))

  return {
    tooltip: { ...tooltip(), trigger: 'axis' },
    legend: spec.options.showLegend !== false && seriesCol
      ? { top: 0, textStyle: { color: 'inherit' } }
      : undefined,
    grid: gridDefault(),
    xAxis: {
      type: xCol.type === 'date' ? 'time' : isTimeX ? 'value' : 'category',
      boundaryGap: false,
      splitLine: { lineStyle: { opacity: 0.15 } },
    },
    yAxis: {
      type: spec.options.logScale ? 'log' : 'value',
      splitLine: { lineStyle: { opacity: 0.2 } },
    },
    series,
  }
}

function buildScatter(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const xCol = findColumn(dataset, spec.encoding.x)
  const yCol = findColumn(dataset, spec.encoding.y)
  if (!xCol || !yCol) return placeholder('Select X and Y columns')

  const seriesCol = findColumn(dataset, spec.encoding.series)
  const sizeCol = findColumn(dataset, spec.encoding.size)

  const sizeValues = sizeCol
    ? dataset.rows.map((r) => toNumber(r[sizeCol.id])).filter((v): v is number => v !== null)
    : []
  const sizeMin = sizeValues.length ? Math.min(...sizeValues) : 0
  const sizeMax = sizeValues.length ? Math.max(...sizeValues) : 1
  const scaleSize = (v: number | null) => {
    if (v === null || sizeMax === sizeMin) return 10
    return 6 + ((v - sizeMin) / (sizeMax - sizeMin)) * 28
  }

  const grouped = new Map<string, Array<[number, number, number | null]>>()
  for (const row of dataset.rows) {
    const x = toNumber(row[xCol.id])
    const y = toNumber(row[yCol.id])
    if (x === null || y === null) continue
    const sKey = seriesCol ? toKey(row[seriesCol.id]) : yCol.name
    const sz = sizeCol ? toNumber(row[sizeCol.id]) : null
    if (!grouped.has(sKey)) grouped.set(sKey, [])
    grouped.get(sKey)!.push([x, y, sz])
  }

  const series = Array.from(grouped.entries()).map(([name, data], i) => ({
    name,
    type: 'scatter' as const,
    symbolSize: sizeCol ? (d: number[]) => scaleSize(d[2] as number | null) : 10,
    itemStyle: { color: PALETTE[i % PALETTE.length], opacity: 0.75 },
    data,
    emphasis: { focus: 'series', itemStyle: { opacity: 1 } },
  }))

  return {
    tooltip: {
      ...tooltip(),
      trigger: 'item',
      formatter: (p: { seriesName: string; data: number[] }) =>
        `<b>${p.seriesName}</b><br/>${xCol.name}: ${p.data[0]}<br/>${yCol.name}: ${p.data[1]}` +
        (sizeCol ? `<br/>${sizeCol.name}: ${p.data[2]}` : ''),
    },
    legend: spec.options.showLegend !== false && seriesCol
      ? { top: 0, textStyle: { color: 'inherit' } }
      : undefined,
    grid: gridDefault(),
    xAxis: { type: 'value', name: xCol.name, nameGap: 28, nameLocation: 'middle', splitLine: { lineStyle: { opacity: 0.2 } } },
    yAxis: { type: 'value', name: yCol.name, splitLine: { lineStyle: { opacity: 0.2 } } },
    series,
  }
}

function buildPie(spec: ChartSpec, dataset: Dataset, donut = false): EChartsOption {
  const nameCol = findColumn(dataset, spec.encoding.x)
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!nameCol) return placeholder('Select a Category column')

  const buckets = new Map<string, number[]>()
  for (const row of dataset.rows) {
    const k = toKey(row[nameCol.id])
    if (!buckets.has(k)) buckets.set(k, [])
    if (valueCol) {
      const v = toNumber(row[valueCol.id])
      if (v !== null) buckets.get(k)!.push(v)
    } else {
      buckets.get(k)!.push(1)
    }
  }

  const data = Array.from(buckets.entries())
    .map(([name, vals], i) => ({
      name,
      value: aggregate(vals, valueCol ? spec.aggregate : 'count'),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }))
    .sort((a, b) => b.value - a.value)

  return {
    tooltip: tooltip(),
    legend: spec.options.showLegend !== false ? { left: 'left', top: 'middle', orient: 'vertical', textStyle: { color: 'inherit' } } : undefined,
    series: [
      {
        type: 'pie',
        radius: donut ? ['45%', '72%'] : ['0%', '72%'],
        center: ['58%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
        label: { color: 'inherit' },
        data,
      },
    ],
  }
}

function buildHistogram(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const col = findColumn(dataset, spec.encoding.x)
  if (!col) return placeholder('Select a numeric column')
  const values = dataset.rows
    .map((r) => toNumber(r[col.id]))
    .filter((v): v is number => v !== null)
  if (values.length === 0) return placeholder('No numeric values in column')

  const min = Math.min(...values)
  const max = Math.max(...values)
  const binCount = spec.options.binCount ?? Math.min(30, Math.max(8, Math.round(Math.sqrt(values.length))))
  const width = (max - min) / binCount || 1
  const bins = Array.from({ length: binCount }, (_, i) => ({
    range: [min + i * width, min + (i + 1) * width],
    count: 0,
  }))
  for (const v of values) {
    const idx = Math.min(binCount - 1, Math.floor((v - min) / width))
    bins[idx].count++
  }
  const labels = bins.map(
    (b) => `${b.range[0].toFixed(1)}–${b.range[1].toFixed(1)}`,
  )
  return {
    tooltip: { ...tooltip(), trigger: 'axis' },
    grid: gridDefault(),
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { opacity: 0.2 } } },
    series: [
      {
        type: 'bar',
        data: bins.map((b) => b.count),
        itemStyle: { color: PALETTE[0], borderRadius: [4, 4, 0, 0] },
        barCategoryGap: '6%',
      },
    ],
  }
}

function buildBoxplot(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const yCol = findColumn(dataset, spec.encoding.y)
  if (!yCol) return placeholder('Select a numeric Y column')
  const groupCol = findColumn(dataset, spec.encoding.x)

  const groups = new Map<string, number[]>()
  for (const row of dataset.rows) {
    const v = toNumber(row[yCol.id])
    if (v === null) continue
    const k = groupCol ? toKey(row[groupCol.id]) : yCol.name
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(v)
  }
  const categories = Array.from(groups.keys())
  const data = categories.map((c) => {
    const sorted = groups.get(c)!.sort((a, b) => a - b)
    const q = (p: number) => sorted[Math.floor((sorted.length - 1) * p)]
    return [q(0), q(0.25), q(0.5), q(0.75), q(1)]
  })
  return {
    tooltip: { ...tooltip(), trigger: 'item' },
    grid: gridDefault(),
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value', name: yCol.name, splitLine: { lineStyle: { opacity: 0.2 } } },
    series: [
      {
        type: 'boxplot',
        data,
        itemStyle: { color: PALETTE[0] + '33', borderColor: PALETTE[0] },
      },
    ],
  }
}

function buildHeatmap(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const xCol = findColumn(dataset, spec.encoding.x)
  const yCol = findColumn(dataset, spec.encoding.series)
  const vCol = findColumn(dataset, spec.encoding.y)
  if (!xCol || !yCol || !vCol) return placeholder('Pick X, Series (Y axis), and Value columns')

  const xs = new Set<string>()
  const ys = new Set<string>()
  const cells = new Map<string, number[]>()
  for (const row of dataset.rows) {
    const xk = toKey(row[xCol.id])
    const yk = toKey(row[yCol.id])
    const v = toNumber(row[vCol.id])
    if (v === null) continue
    xs.add(xk)
    ys.add(yk)
    const key = `${xk}${yk}`
    if (!cells.has(key)) cells.set(key, [])
    cells.get(key)!.push(v)
  }
  const xKeys = Array.from(xs)
  const yKeys = Array.from(ys)
  const data: Array<[number, number, number]> = []
  let max = -Infinity
  let min = Infinity
  for (let xi = 0; xi < xKeys.length; xi++) {
    for (let yi = 0; yi < yKeys.length; yi++) {
      const vals = cells.get(`${xKeys[xi]}${yKeys[yi]}`)
      if (!vals) continue
      const v = aggregate(vals, spec.aggregate)
      data.push([xi, yi, v])
      if (v > max) max = v
      if (v < min) min = v
    }
  }
  return {
    tooltip: { ...tooltip(), position: 'top' },
    grid: { ...gridDefault(), bottom: 64 },
    xAxis: { type: 'category', data: xKeys, splitArea: { show: true } },
    yAxis: { type: 'category', data: yKeys, splitArea: { show: true } },
    visualMap: {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 4,
      inRange: { color: ['#1e3a8a', '#6366f1', '#06b6d4', '#facc15', '#f97316', '#dc2626'] },
      textStyle: { color: 'inherit' },
    },
    series: [
      {
        type: 'heatmap',
        data,
        emphasis: { itemStyle: { borderColor: '#fff', borderWidth: 1 } },
      },
    ],
  }
}

function buildTreemap(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const nameCol = findColumn(dataset, spec.encoding.x)
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!nameCol) return placeholder('Select a Category column')
  const groupCol = findColumn(dataset, spec.encoding.series)

  const groups = new Map<string, Map<string, number[]>>()
  for (const row of dataset.rows) {
    const k = toKey(row[nameCol.id])
    const g = groupCol ? toKey(row[groupCol.id]) : '__root__'
    const v = valueCol ? toNumber(row[valueCol.id]) ?? 0 : 1
    if (!groups.has(g)) groups.set(g, new Map())
    const inner = groups.get(g)!
    if (!inner.has(k)) inner.set(k, [])
    inner.get(k)!.push(v)
  }

  const data = Array.from(groups.entries()).map(([g, inner], gi) => ({
    name: g === '__root__' ? nameCol.name : g,
    itemStyle: { color: PALETTE[gi % PALETTE.length] },
    children: Array.from(inner.entries()).map(([k, vs]) => ({
      name: k,
      value: aggregate(vs, valueCol ? spec.aggregate : 'count'),
    })),
  }))
  return {
    tooltip: tooltip(),
    series: [
      {
        type: 'treemap',
        roam: false,
        breadcrumb: { show: false },
        label: { show: true, color: '#fff' },
        upperLabel: { show: groupCol ? true : false, color: '#fff', height: 22 },
        levels: [
          { itemStyle: { gapWidth: 4, borderWidth: 0 } },
          { itemStyle: { gapWidth: 2, borderWidth: 0 } },
        ],
        data,
      },
    ],
  }
}

function buildRadar(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const groupCol = findColumn(dataset, spec.encoding.x)
  if (!groupCol) return placeholder('Select a Category column for groups')
  const numericCols = dataset.columns.filter((c) => c.type === 'number')
  if (numericCols.length < 3) return placeholder('Need at least 3 numeric columns in the dataset')

  const groups = new Map<string, Record<string, number[]>>()
  for (const row of dataset.rows) {
    const k = toKey(row[groupCol.id])
    if (!groups.has(k)) groups.set(k, Object.fromEntries(numericCols.map((c) => [c.id, [] as number[]])))
    const bucket = groups.get(k)!
    for (const c of numericCols) {
      const v = toNumber(row[c.id])
      if (v !== null) bucket[c.id].push(v)
    }
  }
  const maxByCol: Record<string, number> = {}
  for (const c of numericCols) {
    const all = Array.from(groups.values()).flatMap((g) => g[c.id])
    maxByCol[c.id] = all.length ? Math.max(...all) : 1
  }
  return {
    tooltip: tooltip(),
    legend: { top: 0, textStyle: { color: 'inherit' } },
    radar: {
      indicator: numericCols.map((c) => ({ name: c.name, max: maxByCol[c.id] })),
      splitArea: { areaStyle: { color: ['rgba(99,102,241,0.04)', 'rgba(99,102,241,0.08)'] } },
    },
    series: [
      {
        type: 'radar',
        data: Array.from(groups.entries()).map(([name, bucket], i) => ({
          name,
          value: numericCols.map((c) => aggregate(bucket[c.id], spec.aggregate)),
          areaStyle: { opacity: 0.18, color: PALETTE[i % PALETTE.length] },
          lineStyle: { color: PALETTE[i % PALETTE.length], width: 2 },
          itemStyle: { color: PALETTE[i % PALETTE.length] },
        })),
      },
    ],
  }
}

function placeholder(msg: string): EChartsOption {
  return {
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: { text: msg, fill: '#94a3b8', fontSize: 13 },
    },
  }
}

export function buildChartOption(spec: ChartSpec, dataset: Dataset): EChartsOption {
  switch (spec.type) {
    case 'bar':
      return buildBar(spec, dataset)
    case 'line':
      return buildLine(spec, dataset)
    case 'area':
      return buildLine(spec, dataset, true)
    case 'scatter':
      return buildScatter(spec, dataset)
    case 'pie':
      return buildPie(spec, dataset, false)
    case 'donut':
      return buildPie(spec, dataset, true)
    case 'histogram':
      return buildHistogram(spec, dataset)
    case 'boxplot':
      return buildBoxplot(spec, dataset)
    case 'heatmap':
      return buildHeatmap(spec, dataset)
    case 'treemap':
      return buildTreemap(spec, dataset)
    case 'radar':
      return buildRadar(spec, dataset)
    default:
      return placeholder('Unsupported chart type')
  }
}

export function defaultSpecFor(type: ChartSpec['type'], dataset: Dataset, datasetId: string): ChartSpec {
  const cols = dataset.columns
  const num = cols.find((c) => c.type === 'number')
  const cat = cols.find((c) => c.type === 'categorical' || c.type === 'string')
  const date = cols.find((c) => c.type === 'date')

  const base: ChartSpec = {
    id: crypto.randomUUID(),
    datasetId,
    type,
    title: `New ${type} chart`,
    encoding: {},
    aggregate: 'sum',
    options: { showLegend: true, showGrid: true },
    createdAt: Date.now(),
  }

  switch (type) {
    case 'bar':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'sum' }
    case 'line':
    case 'area':
      return { ...base, encoding: { x: (date ?? num)?.id, y: num?.id }, aggregate: 'avg', options: { ...base.options, smooth: true } }
    case 'scatter': {
      const nums = cols.filter((c) => c.type === 'number')
      return { ...base, encoding: { x: nums[0]?.id, y: nums[1]?.id, series: cat?.id }, aggregate: 'none' }
    }
    case 'pie':
    case 'donut':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'sum' }
    case 'histogram':
      return { ...base, encoding: { x: num?.id }, aggregate: 'count', options: { ...base.options, binCount: 20 } }
    case 'boxplot':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'none' }
    case 'heatmap': {
      const cats = cols.filter((c) => c.type === 'categorical' || c.type === 'string')
      return { ...base, encoding: { x: cats[0]?.id, series: cats[1]?.id, y: num?.id }, aggregate: 'avg' }
    }
    case 'treemap':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'sum' }
    case 'radar':
      return { ...base, encoding: { x: cat?.id }, aggregate: 'avg' }
    default:
      return base
  }
}

export type { DataRow }
