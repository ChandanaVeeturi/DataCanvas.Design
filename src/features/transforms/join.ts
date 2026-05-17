import type { CellValue, Column, DataRow, Dataset } from '@/lib/types'

export type JoinKind = 'inner' | 'left' | 'right' | 'outer'

function keyOf(v: CellValue): string {
  if (v === null || v === undefined) return '\0NULL'
  if (v instanceof Date) return `D${v.getTime()}`
  return `${typeof v}:${String(v)}`
}

function uniqueColumnId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    taken.add(base)
    return base
  }
  let i = 2
  while (taken.has(`${base}_${i}`)) i++
  const id = `${base}_${i}`
  taken.add(id)
  return id
}

export interface JoinResult {
  columns: Column[]
  rows: DataRow[]
}

export function joinDatasets(
  left: Dataset,
  right: Dataset,
  leftKey: string,
  rightKey: string,
  kind: JoinKind,
): JoinResult {
  // Build right-side index by key.
  const rightIndex = new Map<string, DataRow[]>()
  for (const row of right.rows) {
    const k = keyOf(row[rightKey])
    const arr = rightIndex.get(k) ?? []
    arr.push(row)
    rightIndex.set(k, arr)
  }
  const matchedRightKeys = new Set<string>()

  // Compose column schema. Left columns keep their ids/names. Right columns get
  // renamed if they collide. The right join key column is dropped from the
  // output (it's redundant with the left key).
  const taken = new Set<string>()
  const leftCols: Column[] = left.columns.map((c) => {
    taken.add(c.id)
    return { ...c }
  })
  const rightCols: Column[] = []
  const rightIdRename: Record<string, string> = {}
  for (const c of right.columns) {
    if (c.id === rightKey) continue
    const newId = uniqueColumnId(c.id, taken)
    const renamedName = newId === c.id ? c.name : `${c.name} (right)`
    rightIdRename[c.id] = newId
    rightCols.push({ ...c, id: newId, name: renamedName })
  }

  const rows: DataRow[] = []

  const composeRow = (l: DataRow | null, r: DataRow | null): DataRow => {
    const out: DataRow = {}
    for (const col of leftCols) out[col.id] = l ? l[col.id] ?? null : null
    for (const c of right.columns) {
      if (c.id === rightKey) continue
      const newId = rightIdRename[c.id]
      out[newId] = r ? r[c.id] ?? null : null
    }
    return out
  }

  for (const lr of left.rows) {
    const k = keyOf(lr[leftKey])
    const matches = rightIndex.get(k)
    if (matches && matches.length > 0) {
      matchedRightKeys.add(k)
      for (const rr of matches) rows.push(composeRow(lr, rr))
    } else if (kind === 'left' || kind === 'outer') {
      rows.push(composeRow(lr, null))
    }
  }

  if (kind === 'right' || kind === 'outer') {
    for (const [k, rr] of rightIndex.entries()) {
      if (matchedRightKeys.has(k)) continue
      for (const r of rr) rows.push(composeRow(null, r))
    }
  }

  return { columns: [...leftCols, ...rightCols], rows }
}

export function buildJoinedDataset(
  left: Dataset,
  right: Dataset,
  leftKey: string,
  rightKey: string,
  kind: JoinKind,
  name: string,
): Dataset {
  const { columns, rows } = joinDatasets(left, right, leftKey, rightKey, kind)
  return {
    id: crypto.randomUUID(),
    name,
    sourceFile: `${left.sourceFile} ${kind}-join ${right.sourceFile}`,
    createdAt: Date.now(),
    rowCount: rows.length,
    columns,
    rows,
  }
}
