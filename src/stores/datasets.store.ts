import { create } from 'zustand'
import type { Dataset } from '@/lib/types'
import { deleteDataset, loadAllDatasets, putDataset } from '@/lib/idb'

interface DatasetsState {
  datasets: Dataset[]
  hydrated: boolean
  hydrate: () => Promise<void>
  addDataset: (dataset: Dataset) => Promise<void>
  removeDataset: (id: string) => Promise<void>
  updateDataset: (id: string, patch: Partial<Dataset>) => Promise<void>
}

export const useDatasetsStore = create<DatasetsState>((set, get) => ({
  datasets: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const datasets = await loadAllDatasets()
      set({ datasets, hydrated: true })
    } catch (err) {
      console.error('Failed to hydrate datasets', err)
      set({ hydrated: true })
    }
  },

  addDataset: async (dataset) => {
    set((s) => ({
      datasets: [dataset, ...s.datasets.filter((d) => d.id !== dataset.id)],
    }))
    try {
      await putDataset(dataset)
    } catch (err) {
      console.error('Failed to persist dataset', err)
    }
  },

  removeDataset: async (id) => {
    set((s) => ({ datasets: s.datasets.filter((d) => d.id !== id) }))
    try {
      await deleteDataset(id)
    } catch (err) {
      console.error('Failed to delete dataset', err)
    }
  },

  updateDataset: async (id, patch) => {
    const current = get().datasets.find((d) => d.id === id)
    if (!current) return
    const updated = { ...current, ...patch }
    set((s) => ({ datasets: s.datasets.map((d) => (d.id === id ? updated : d)) }))
    try {
      await putDataset(updated)
    } catch (err) {
      console.error('Failed to persist dataset', err)
    }
  },
}))
