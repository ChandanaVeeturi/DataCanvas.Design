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

function buildFunnel(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const nameCol = findColumn(dataset, spec.encoding.x)
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!nameCol) return placeholder('Select a Stage/Category column')

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
    .sort((a, b) => spec.options.ascending ? a.value - b.value : b.value - a.value)

  return {
    tooltip: tooltip(),
    legend: spec.options.showLegend !== false
      ? { top: 0, textStyle: { color: 'inherit' } }
      : undefined,
    series: [{
      type: 'funnel',
      left: '10%',
      width: '80%',
      top: 32,
      bottom: 16,
      sort: spec.options.ascending ? 'ascending' : 'descending',
      label: { show: true, position: 'inside', color: '#fff', fontWeight: 'bold', fontSize: 12 },
      itemStyle: { borderWidth: 0 },
      emphasis: { label: { fontSize: 14 } },
      data,
    }],
  }
}

function buildGauge(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!valueCol) return placeholder('Select a Value column')

  const vals = dataset.rows.map((r) => toNumber(r[valueCol.id])).filter((v): v is number => v !== null)
  if (vals.length === 0) return placeholder('No numeric values in column')

  const value = aggregate(vals, spec.aggregate)
  const absMax = Math.max(Math.abs(Math.min(...vals)), Math.abs(Math.max(...vals)))
  const gaugeMax = Math.ceil(absMax * 1.25) || 100

  return {
    tooltip: { ...tooltip(), formatter: '{b}: {c}' },
    series: [{
      type: 'gauge',
      min: 0,
      max: gaugeMax,
      progress: { show: true, width: 16 },
      axisLine: { lineStyle: { width: 16, color: [[1, 'rgba(100,100,100,0.15)']] } },
      axisTick: { show: false },
      splitLine: { length: 12, lineStyle: { width: 2, color: 'inherit' } },
      axisLabel: { distance: 22, color: 'inherit', fontSize: 11 },
      pointer: { itemStyle: { color: PALETTE[0] } },
      anchor: { show: true, showAbove: true, size: 20, itemStyle: { borderWidth: 8, borderColor: PALETTE[0] } },
      title: { offsetCenter: [0, '75%'], color: 'inherit', fontSize: 13 },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 'bold',
        offsetCenter: [0, '-20%'],
        color: PALETTE[0],
        formatter: (v: number) => v % 1 === 0 ? String(v) : v.toFixed(2),
      },
      data: [{ value: Number(value.toFixed(4)), name: valueCol.name }],
    }],
  }
}

function buildSankey(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const sourceCol = findColumn(dataset, spec.encoding.x)
  const targetCol = findColumn(dataset, spec.encoding.series)
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!sourceCol || !targetCol) return placeholder('Select Source and Target columns')

  const flows = new Map<string, number[]>()
  const nodeSet = new Set<string>()

  for (const row of dataset.rows) {
    const src = toKey(row[sourceCol.id])
    const tgt = toKey(row[targetCol.id])
    if (src === tgt) continue
    nodeSet.add(src)
    nodeSet.add(tgt)
    const key = `${src}\x00${tgt}`
    if (!flows.has(key)) flows.set(key, [])
    const v = valueCol ? toNumber(row[valueCol.id]) : 1
    flows.get(key)!.push(v ?? 1)
  }

  if (nodeSet.size === 0) return placeholder('No valid flows — ensure Source ≠ Target')

  const nodes = Array.from(nodeSet).map((name) => ({ name }))
  const links = Array.from(flows.entries()).map(([key, vals]) => {
    const sep = key.indexOf('\x00')
    return {
      source: key.slice(0, sep),
      target: key.slice(sep + 1),
      value: aggregate(vals, valueCol ? spec.aggregate : 'count'),
    }
  })

  return {
    tooltip: { ...tooltip(), trigger: 'item' },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      nodeGap: 12,
      nodeWidth: 20,
      nodes,
      links,
      lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.4 },
      label: { color: 'inherit', fontSize: 12 },
      itemStyle: { borderWidth: 0 },
    }],
  }
}

function buildSunburst(spec: ChartSpec, dataset: Dataset): EChartsOption {
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

  const data = groupCol
    ? Array.from(groups.entries()).map(([g, inner], gi) => ({
        name: g,
        itemStyle: { color: PALETTE[gi % PALETTE.length] },
        children: Array.from(inner.entries()).map(([k, vs]) => ({
          name: k,
          value: aggregate(vs, valueCol ? spec.aggregate : 'count'),
        })),
      }))
    : Array.from(groups.get('__root__')?.entries() ?? []).map(([k, vs], i) => ({
        name: k,
        value: aggregate(vs, valueCol ? spec.aggregate : 'count'),
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      }))

  return {
    tooltip: tooltip(),
    series: [{
      type: 'sunburst',
      data,
      radius: ['15%', '85%'],
      label: { rotate: 'radial', color: 'inherit', fontSize: 11, overflow: 'truncate' },
      emphasis: { focus: 'ancestor' },
      levels: [
        {},
        { r0: '15%', r: '50%', label: { align: 'right' } },
        { r0: '50%', r: '83%', label: { position: 'outsideSlice' } },
      ],
    }],
  }
}

function buildWaterfall(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const xCol = findColumn(dataset, spec.encoding.x)
  const yCol = findColumn(dataset, spec.encoding.y)
  if (!xCol || !yCol) return placeholder('Select Category and Value columns')

  const buckets = new Map<string, number[]>()
  for (const row of dataset.rows) {
    const k = toKey(row[xCol.id])
    const v = toNumber(row[yCol.id])
    if (v === null) continue
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k)!.push(v)
  }

  const categories = Array.from(buckets.keys())
  const values = categories.map((c) => aggregate(buckets.get(c)!, spec.aggregate))

  const helpers: number[] = []
  const gains: (number | string)[] = []
  const losses: (number | string)[] = []
  let running = 0

  for (const v of values) {
    if (v >= 0) {
      helpers.push(running)
      gains.push(v)
      losses.push('-')
    } else {
      helpers.push(running + v)
      gains.push('-')
      losses.push(-v)
    }
    running += v
  }

  return {
    tooltip: { ...tooltip(), trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Gain', 'Loss'], top: 0, textStyle: { color: 'inherit' } },
    grid: { ...gridDefault(), top: 40 },
    xAxis: { type: 'category', data: categories, axisLabel: { rotate: categories.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { opacity: 0.2 } } },
    series: [
      {
        name: 'Base',
        type: 'bar',
        stack: 'wf',
        silent: true,
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
        data: helpers,
      },
      {
        name: 'Gain',
        type: 'bar',
        stack: 'wf',
        itemStyle: { color: PALETTE[4], borderRadius: [4, 4, 0, 0] },
        data: gains,
      },
      {
        name: 'Loss',
        type: 'bar',
        stack: 'wf',
        itemStyle: { color: PALETTE[6], borderRadius: [4, 4, 0, 0] },
        data: losses,
      },
    ],
  }
}

function buildCalendar(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const dateCol = findColumn(dataset, spec.encoding.x)
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!dateCol) return placeholder('Select a Date column')

  const buckets = new Map<string, number[]>()
  for (const row of dataset.rows) {
    const d = row[dateCol.id]
    if (!d) continue
    let dateStr: string
    if (d instanceof Date) {
      dateStr = d.toISOString().slice(0, 10)
    } else {
      const n = toNumber(d)
      dateStr = n !== null ? new Date(n).toISOString().slice(0, 10) : String(d).slice(0, 10)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue
    if (!buckets.has(dateStr)) buckets.set(dateStr, [])
    if (valueCol) {
      const v = toNumber(row[valueCol.id])
      if (v !== null) buckets.get(dateStr)!.push(v)
    } else {
      buckets.get(dateStr)!.push(1)
    }
  }

  if (buckets.size === 0) return placeholder('No valid dates found — ensure column contains date values')

  const data = Array.from(buckets.entries()).map(([date, vals]) => [
    date,
    aggregate(vals, valueCol ? spec.aggregate : 'count'),
  ])

  const sorted = Array.from(buckets.keys()).sort()
  const yearFrom = Number(sorted[0].slice(0, 4))
  const yearTo = Number(sorted[sorted.length - 1].slice(0, 4))
  const years = Array.from({ length: Math.min(yearTo - yearFrom + 1, 3) }, (_, i) => yearTo - i).reverse()

  const allVals = data.map((d) => d[1] as number)
  const minVal = Math.min(...allVals)
  const maxVal = Math.max(...allVals)

  return {
    tooltip: {
      ...tooltip(),
      formatter: (p: { data: [string, number] }) => `${p.data?.[0]}: ${p.data?.[1]}`,
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 0,
      inRange: { color: ['#dbeafe', '#818cf8', '#4338ca'] },
      textStyle: { color: 'inherit' },
    },
    calendar: years.map((year, i) => ({
      top: 50 + i * 150,
      left: 36,
      right: 8,
      cellSize: ['auto', 14],
      range: String(year),
      itemStyle: { borderWidth: 0.5, borderColor: 'rgba(128,128,128,0.2)' },
      yearLabel: { show: true, color: 'inherit', fontSize: 12 },
      monthLabel: { color: 'inherit', fontSize: 10 },
      dayLabel: { color: 'inherit', firstDay: 1, fontSize: 10 },
    })),
    series: years.map((year, i) => ({
      type: 'heatmap',
      coordinateSystem: 'calendar',
      calendarIndex: i,
      data: data.filter((d) => (d[0] as string).startsWith(String(year))),
    })),
  }
}

function buildRose(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const nameCol = findColumn(dataset, spec.encoding.x)
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!nameCol) return placeholder('Select a Category column')

  const seriesCol = findColumn(dataset, spec.encoding.series)
  const buckets = new Map<string, Map<string, number[]>>()

  for (const row of dataset.rows) {
    const k = toKey(row[nameCol.id])
    const s = seriesCol ? toKey(row[seriesCol.id]) : '__single__'
    if (!buckets.has(k)) buckets.set(k, new Map())
    const inner = buckets.get(k)!
    if (!inner.has(s)) inner.set(s, [])
    const v = valueCol ? toNumber(row[valueCol.id]) : 1
    inner.get(s)!.push(v ?? 1)
  }

  const categories = Array.from(buckets.keys())
  const seriesKeys = seriesCol
    ? Array.from(new Set(Array.from(buckets.values()).flatMap((m) => Array.from(m.keys()))))
    : ['__single__']

  const series = seriesKeys.map((sk, i) => ({
    name: sk === '__single__' ? (valueCol?.name ?? 'Count') : sk,
    type: 'bar',
    coordinateSystem: 'polar' as const,
    stack: spec.options.stacked ? 'total' : undefined,
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: categories.map((c) => {
      const vals = buckets.get(c)?.get(sk) ?? []
      return vals.length === 0 ? 0 : aggregate(vals, spec.aggregate)
    }),
  }))

  return {
    tooltip: { ...tooltip(), trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: spec.options.showLegend !== false && seriesCol
      ? { top: 0, textStyle: { color: 'inherit' } }
      : undefined,
    polar: { radius: ['10%', '78%'] },
    angleAxis: { type: 'category', data: categories, startAngle: 90 },
    radiusAxis: { splitLine: { lineStyle: { opacity: 0.2 } } },
    series,
  }
}

function buildStream(spec: ChartSpec, dataset: Dataset): EChartsOption {
  const timeCol = findColumn(dataset, spec.encoding.x)
  const seriesCol = findColumn(dataset, spec.encoding.series)
  const valueCol = findColumn(dataset, spec.encoding.y)
  if (!timeCol || !seriesCol) return placeholder('Select a Time/X column and a Stream (Series) column')

  const flows = new Map<string, Map<string, number[]>>()
  for (const row of dataset.rows) {
    const t = row[timeCol.id]
    if (!t) continue
    let tKey: string
    if (t instanceof Date) tKey = t.toISOString().slice(0, 10)
    else tKey = toKey(t)
    const s = toKey(row[seriesCol.id])
    const v = valueCol ? toNumber(row[valueCol.id]) : 1
    if (!flows.has(tKey)) flows.set(tKey, new Map())
    const tf = flows.get(tKey)!
    if (!tf.has(s)) tf.set(s, [])
    tf.get(s)!.push(v ?? 1)
  }

  const data: [string, number, string][] = []
  for (const [time, streamMap] of flows.entries()) {
    for (const [stream, vals] of streamMap.entries()) {
      data.push([time, aggregate(vals, valueCol ? spec.aggregate : 'count'), stream])
    }
  }

  if (data.length === 0) return placeholder('No stream data to display')

  const streamNames = Array.from(new Set(data.map((d) => d[2])))
  const isDate = timeCol.type === 'date'

  return {
    tooltip: { ...tooltip(), trigger: 'axis' },
    legend: spec.options.showLegend !== false
      ? { data: streamNames, top: 0, textStyle: { color: 'inherit' } }
      : undefined,
    singleAxis: {
      type: isDate ? 'time' : 'category',
      bottom: 40,
      top: spec.options.showLegend !== false ? 44 : 16,
      height: '55%',
      axisLabel: { color: 'inherit', interval: 'auto' },
      axisLine: { lineStyle: { opacity: 0.4 } },
    },
    series: [{
      type: 'themeRiver',
      emphasis: { focus: 'series' },
      label: { show: false },
      data,
    }],
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
    case 'funnel':
      return buildFunnel(spec, dataset)
    case 'gauge':
      return buildGauge(spec, dataset)
    case 'sankey':
      return buildSankey(spec, dataset)
    case 'sunburst':
      return buildSunburst(spec, dataset)
    case 'waterfall':
      return buildWaterfall(spec, dataset)
    case 'calendar':
      return buildCalendar(spec, dataset)
    case 'rose':
      return buildRose(spec, dataset)
    case 'stream':
      return buildStream(spec, dataset)
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
    case 'funnel':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'sum' }
    case 'gauge':
      return { ...base, encoding: { y: num?.id }, aggregate: 'avg' }
    case 'sankey': {
      const cats2 = cols.filter((c) => c.type === 'categorical' || c.type === 'string')
      return { ...base, encoding: { x: cats2[0]?.id, series: cats2[1]?.id, y: num?.id }, aggregate: 'count' }
    }
    case 'sunburst':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'sum' }
    case 'waterfall':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'sum' }
    case 'calendar':
      return { ...base, encoding: { x: (date ?? num)?.id, y: num?.id }, aggregate: 'count' }
    case 'rose':
      return { ...base, encoding: { x: cat?.id, y: num?.id }, aggregate: 'sum' }
    case 'stream': {
      const cats3 = cols.filter((c) => c.type === 'categorical' || c.type === 'string')
      return { ...base, encoding: { x: (date ?? num)?.id, series: cats3[0]?.id, y: num?.id }, aggregate: 'sum' }
    }
    default:
      return base
  }
}

export type { DataRow }
