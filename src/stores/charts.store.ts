import { create } from 'zustand'
import type { ChartSpec } from '@/lib/types'
import { deleteChart, loadAllCharts, putChart } from '@/lib/idb'

interface ChartsState {
  charts: ChartSpec[]
  hydrated: boolean
  hydrate: () => Promise<void>
  upsertChart: (chart: ChartSpec) => Promise<void>
  removeChart: (id: string) => Promise<void>
  duplicateChart: (id: string) => Promise<ChartSpec | undefined>
  getChart: (id: string) => ChartSpec | undefined
  getChartsForDataset: (datasetId: string) => ChartSpec[]
}

export const useChartsStore = create<ChartsState>((set, get) => ({
  charts: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const charts = await loadAllCharts()
      set({ charts, hydrated: true })
    } catch (err) {
      console.error('Failed to hydrate charts', err)
      set({ hydrated: true })
    }
  },

  upsertChart: async (chart) => {
    set((s) => {
      const idx = s.charts.findIndex((c) => c.id === chart.id)
      if (idx === -1) return { charts: [chart, ...s.charts] }
      const next = [...s.charts]
      next[idx] = chart
      return { charts: next }
    })
    try {
      await putChart(chart)
    } catch (err) {
      console.error('Failed to persist chart', err)
    }
  },

  removeChart: async (id) => {
    set((s) => ({ charts: s.charts.filter((c) => c.id !== id) }))
    try {
      await deleteChart(id)
    } catch (err) {
      console.error('Failed to delete chart', err)
    }
  },

  duplicateChart: async (id) => {
    const original = get().charts.find((c) => c.id === id)
    if (!original) return undefined
    const copy: ChartSpec = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (copy)`,
      createdAt: Date.now(),
    }
    set((s) => ({ charts: [copy, ...s.charts] }))
    try {
      await putChart(copy)
    } catch (err) {
      console.error('Failed to persist chart copy', err)
    }
    return copy
  },

  getChart: (id) => get().charts.find((c) => c.id === id),
  getChartsForDataset: (datasetId) =>
    get().charts.filter((c) => c.datasetId === datasetId),
}))
