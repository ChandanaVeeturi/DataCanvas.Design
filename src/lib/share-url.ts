// Encode dashboard + chart specs into a compact URL fragment. The recipient
// can then "apply" the spec to any local dataset (columns matched by name).

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { ChartSpec, DashboardSpec, Tile } from './types'

const VERSION = 1

interface SharePayload {
  v: number
  dashboard: Omit<DashboardSpec, 'datasetId'>
  charts: Omit<ChartSpec, 'datasetId'>[]
}

export function encodeSharePayload(dashboard: DashboardSpec, charts: ChartSpec[]): string {
  const tileChartIds = new Set(
    dashboard.tiles.filter((t): t is Tile & { kind: 'chart' } => t.kind === 'chart').map((t) => t.chartId),
  )
  const usedCharts = charts.filter((c) => tileChartIds.has(c.id))
  const payload: SharePayload = {
    v: VERSION,
    dashboard: stripDatasetId(dashboard),
    charts: usedCharts.map(stripDatasetId),
  }
  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const parsed = JSON.parse(json) as SharePayload
    if (parsed.v !== VERSION || !parsed.dashboard || !Array.isArray(parsed.charts)) return null
    return parsed
  } catch (err) {
    console.warn('Failed to decode share payload', err)
    return null
  }
}

function stripDatasetId<T extends { datasetId: string }>(obj: T): Omit<T, 'datasetId'> {
  const { datasetId: _drop, ...rest } = obj
  void _drop
  return rest
}

export function buildShareUrl(encoded: string): string {
  const u = new URL(window.location.href)
  u.pathname = '/'
  u.search = ''
  u.hash = `import=${encoded}`
  return u.toString()
}

export function readShareFromUrl(): SharePayload | null {
  const hash = window.location.hash
  if (!hash.startsWith('#import=')) return null
  return decodeSharePayload(hash.slice('#import='.length))
}

export function clearShareFromUrl() {
  // Remove hash without scroll jump
  const url = new URL(window.location.href)
  url.hash = ''
  window.history.replaceState({}, '', url.toString())
}

/**
 * Re-keys the imported dashboard + chart ids so they don't collide with
 * existing local ones, and rebinds tile.chartId references through the map.
 */
export function rekeyImported(payload: SharePayload, targetDatasetId: string) {
  const chartIdMap: Record<string, string> = {}
  const charts: ChartSpec[] = payload.charts.map((c) => {
    const newId = crypto.randomUUID()
    chartIdMap[c.id] = newId
    return { ...c, id: newId, datasetId: targetDatasetId, createdAt: Date.now() }
  })
  const tiles: Tile[] = payload.dashboard.tiles.map((t) => {
    if (t.kind === 'chart') {
      return { ...t, id: crypto.randomUUID(), chartId: chartIdMap[t.chartId] ?? t.chartId }
    }
    return { ...t, id: crypto.randomUUID() }
  })
  const layout = payload.dashboard.layout.map((l) => ({
    ...l,
    i: tiles[payload.dashboard.tiles.findIndex((t) => t.id === l.i)]?.id ?? l.i,
  }))
  const dashboard: DashboardSpec = {
    id: crypto.randomUUID(),
    datasetId: targetDatasetId,
    name: payload.dashboard.name,
    tiles,
    layout,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  return { dashboard, charts }
}
