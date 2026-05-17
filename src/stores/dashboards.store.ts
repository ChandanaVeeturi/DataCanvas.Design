import { create } from 'zustand'
import type { DashboardSpec } from '@/lib/types'
import { deleteDashboard, loadAllDashboards, putDashboard } from '@/lib/idb'

interface DashboardsState {
  dashboards: DashboardSpec[]
  hydrated: boolean
  hydrate: () => Promise<void>
  upsertDashboard: (dashboard: DashboardSpec) => Promise<void>
  removeDashboard: (id: string) => Promise<void>
  getDashboard: (id: string) => DashboardSpec | undefined
  getDashboardsForDataset: (datasetId: string) => DashboardSpec[]
}

export const useDashboardsStore = create<DashboardsState>((set, get) => ({
  dashboards: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const dashboards = await loadAllDashboards()
      set({ dashboards, hydrated: true })
    } catch (err) {
      console.error('Failed to hydrate dashboards', err)
      set({ hydrated: true })
    }
  },

  upsertDashboard: async (dashboard) => {
    set((s) => {
      const idx = s.dashboards.findIndex((d) => d.id === dashboard.id)
      if (idx === -1) return { dashboards: [dashboard, ...s.dashboards] }
      const next = [...s.dashboards]
      next[idx] = dashboard
      return { dashboards: next }
    })
    try {
      await putDashboard(dashboard)
    } catch (err) {
      console.error('Failed to persist dashboard', err)
    }
  },

  removeDashboard: async (id) => {
    set((s) => ({ dashboards: s.dashboards.filter((d) => d.id !== id) }))
    try {
      await deleteDashboard(id)
    } catch (err) {
      console.error('Failed to delete dashboard', err)
    }
  },

  getDashboard: (id) => get().dashboards.find((d) => d.id === id),
  getDashboardsForDataset: (datasetId) =>
    get().dashboards.filter((d) => d.datasetId === datasetId),
}))
