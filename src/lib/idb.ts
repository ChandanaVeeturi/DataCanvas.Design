import { openDB, type IDBPDatabase } from 'idb'
import type { ChartSpec, DashboardSpec, Dataset } from './types'

const DB_NAME = 'datacanvas'
const DB_VERSION = 2
const STORE_DATASETS = 'datasets'
const STORE_CHARTS = 'charts'
const STORE_DASHBOARDS = 'dashboards'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_DATASETS)) {
          db.createObjectStore(STORE_DATASETS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_CHARTS)) {
          const store = db.createObjectStore(STORE_CHARTS, { keyPath: 'id' })
          store.createIndex('datasetId', 'datasetId', { unique: false })
        }
        if (oldVersion < 2 && !db.objectStoreNames.contains(STORE_DASHBOARDS)) {
          const store = db.createObjectStore(STORE_DASHBOARDS, { keyPath: 'id' })
          store.createIndex('datasetId', 'datasetId', { unique: false })
        }
      },
    })
  }
  return dbPromise
}

/**
 * IndexedDB can't structured-clone `Date` inside arbitrary objects reliably
 * in some browsers when wrapped in our generic `CellValue`. To be safe, we
 * serialize Dates to ISO strings on write and revive them on read.
 */
function serializeDataset(d: Dataset): Dataset {
  return {
    ...d,
    rows: d.rows.map((r) => {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(r)) {
        out[k] = v instanceof Date ? { __date: v.toISOString() } : v
      }
      return out as unknown as Dataset['rows'][number]
    }),
  }
}

function deserializeDataset(d: Dataset): Dataset {
  return {
    ...d,
    rows: d.rows.map((r) => {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(r)) {
        if (v && typeof v === 'object' && '__date' in (v as object)) {
          out[k] = new Date((v as unknown as { __date: string }).__date)
        } else {
          out[k] = v
        }
      }
      return out as unknown as Dataset['rows'][number]
    }),
  }
}

export async function putDataset(dataset: Dataset): Promise<void> {
  const db = await getDb()
  await db.put(STORE_DATASETS, serializeDataset(dataset))
}

export async function deleteDataset(id: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_DATASETS, STORE_CHARTS, STORE_DASHBOARDS], 'readwrite')
  await tx.objectStore(STORE_DATASETS).delete(id)
  await cascadeDeleteByDatasetId(tx.objectStore(STORE_CHARTS).index('datasetId'), id)
  await cascadeDeleteByDatasetId(tx.objectStore(STORE_DASHBOARDS).index('datasetId'), id)
  await tx.done
}

type IdxLike = {
  openCursor: (q: IDBKeyRange) => Promise<{ delete: () => Promise<void>; continue: () => Promise<unknown> } | null>
}

async function cascadeDeleteByDatasetId(index: unknown, key: string) {
  const idx = index as IdxLike
  let cursor = await idx.openCursor(IDBKeyRange.only(key))
  while (cursor) {
    await cursor.delete()
    cursor = (await cursor.continue()) as Awaited<ReturnType<IdxLike['openCursor']>>
  }
}

export async function loadAllDatasets(): Promise<Dataset[]> {
  const db = await getDb()
  const all = (await db.getAll(STORE_DATASETS)) as Dataset[]
  return all.map(deserializeDataset).sort((a, b) => b.createdAt - a.createdAt)
}

export async function putChart(chart: ChartSpec): Promise<void> {
  const db = await getDb()
  await db.put(STORE_CHARTS, chart)
}

export async function deleteChart(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_CHARTS, id)
}

export async function loadAllCharts(): Promise<ChartSpec[]> {
  const db = await getDb()
  return ((await db.getAll(STORE_CHARTS)) as ChartSpec[]).sort(
    (a, b) => b.createdAt - a.createdAt,
  )
}

export async function putDashboard(dashboard: DashboardSpec): Promise<void> {
  const db = await getDb()
  await db.put(STORE_DASHBOARDS, dashboard)
}

export async function deleteDashboard(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_DASHBOARDS, id)
}

export async function loadAllDashboards(): Promise<DashboardSpec[]> {
  const db = await getDb()
  return ((await db.getAll(STORE_DASHBOARDS)) as DashboardSpec[]).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  )
}

export async function clearAll(): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_DATASETS, STORE_CHARTS, STORE_DASHBOARDS], 'readwrite')
  await tx.objectStore(STORE_DATASETS).clear()
  await tx.objectStore(STORE_CHARTS).clear()
  await tx.objectStore(STORE_DASHBOARDS).clear()
  await tx.done
}
