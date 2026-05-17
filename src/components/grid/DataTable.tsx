import { useMemo, useState } from 'react'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  BarChart2,
  Brush,
  Check,
  Columns3,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Search,
  Trash,
  Type,
  X,
} from 'lucide-react'
import type { CellValue, Column, ColumnType, DataRow } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MenuItem, MenuLabel, MenuSeparator, Popover } from '@/components/ui/popover'

interface DataTableProps {
  columns: Column[]
  rows: DataRow[]
  onColumnsChange?: (columns: Column[]) => void
  onShowStats?: (column: Column) => void
  onColumnTransform?: (column: Column, transform: ColumnTransform) => void
  onDeleteColumn?: (column: Column) => void
  toolbarExtras?: React.ReactNode
  maxRows?: number
}

export type ColumnTransform =
  | { kind: 'trim' }
  | { kind: 'case'; mode: 'upper' | 'lower' | 'title' }
  | { kind: 'fill'; strategy: 'mean' | 'median' | 'mode' | 'zero' | 'blank' }
  | { kind: 'drop-empty' }

type SortDir = 'asc' | 'desc'
interface SortSpec {
  columnId: string
  dir: SortDir
}

const TYPE_BADGE: Record<ColumnType, string> = {
  number: 'text-sky-600 dark:text-sky-400',
  string: 'text-emerald-600 dark:text-emerald-400',
  boolean: 'text-amber-600 dark:text-amber-400',
  date: 'text-violet-600 dark:text-violet-400',
  categorical: 'text-fuchsia-600 dark:text-fuchsia-400',
}

const COLUMN_TYPES: ColumnType[] = ['number', 'string', 'categorical', 'date', 'boolean']

function formatCell(value: CellValue, type: ColumnType): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 16).replace('T', ' ')
  if (type === 'number' && typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  return String(value)
}

function compareValues(a: CellValue, b: CellValue): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1
  if (b === null || b === undefined) return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

function rowMatchesGlobal(row: DataRow, query: string, columns: Column[]): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  for (const col of columns) {
    if (col.hidden) continue
    const v = row[col.id]
    if (v === null || v === undefined) continue
    if (String(v instanceof Date ? v.toISOString() : v).toLowerCase().includes(q)) return true
  }
  return false
}

function rowMatchesColumnFilters(row: DataRow, filters: Record<string, string>): boolean {
  for (const [colId, q] of Object.entries(filters)) {
    if (!q) continue
    const v = row[colId]
    if (v === null || v === undefined) return false
    const haystack = String(v instanceof Date ? v.toISOString() : v).toLowerCase()
    if (!haystack.includes(q.toLowerCase())) return false
  }
  return true
}

export function DataTable({
  columns,
  rows,
  onColumnsChange,
  onShowStats,
  onColumnTransform,
  onDeleteColumn,
  toolbarExtras,
  maxRows = 1000,
}: DataTableProps) {
  const [globalQuery, setGlobalQuery] = useState('')
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<SortSpec | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const visibleColumns = useMemo(() => columns.filter((c) => !c.hidden), [columns])

  const filteredRows = useMemo(() => {
    const filtered = rows.filter(
      (r) => rowMatchesGlobal(r, globalQuery, columns) && rowMatchesColumnFilters(r, columnFilters),
    )
    if (!sort) return filtered
    const col = columns.find((c) => c.id === sort.columnId)
    if (!col) return filtered
    const sorted = [...filtered].sort((a, b) => compareValues(a[col.id], b[col.id]))
    return sort.dir === 'asc' ? sorted : sorted.reverse()
  }, [rows, columns, globalQuery, columnFilters, sort])

  const visibleRows = filteredRows.slice(0, maxRows)
  const totalFiltered = filteredRows.length
  const truncated = filteredRows.length > maxRows

  const toggleSort = (colId: string) => {
    setSort((current) => {
      if (!current || current.columnId !== colId) return { columnId: colId, dir: 'asc' }
      if (current.dir === 'asc') return { columnId: colId, dir: 'desc' }
      return null
    })
  }

  const updateColumn = (id: string, patch: Partial<Column>) => {
    if (!onColumnsChange) return
    onColumnsChange(columns.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const beginRename = (col: Column) => {
    setRenaming(col.id)
    setRenameValue(col.name)
  }

  const commitRename = () => {
    if (renaming) {
      const trimmed = renameValue.trim()
      if (trimmed) updateColumn(renaming, { name: trimmed })
    }
    setRenaming(null)
  }

  const activeFilterCount = Object.values(columnFilters).filter((v) => !!v).length

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            placeholder="Search all columns…"
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-7 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {globalQuery && (
            <button
              type="button"
              onClick={() => setGlobalQuery('')}
              className="absolute right-1 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <Popover
          align="end"
          trigger={
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent/10"
            >
              <Columns3 className="h-3.5 w-3.5" />
              Columns
              <span className="text-muted-foreground">
                {visibleColumns.length}/{columns.length}
              </span>
            </button>
          }
        >
          <MenuLabel>Visible columns</MenuLabel>
          <div className="max-h-72 overflow-auto">
            {columns.map((c) => (
              <MenuItem key={c.id} onSelect={() => updateColumn(c.id, { hidden: !c.hidden })}>
                <span className="flex w-4 justify-center">
                  {!c.hidden && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className={cn('text-[10px] uppercase tracking-wider', TYPE_BADGE[c.type])}>
                  {c.type}
                </span>
              </MenuItem>
            ))}
          </div>
        </Popover>

        {toolbarExtras}

        <div className="ml-auto whitespace-nowrap text-xs text-muted-foreground tabular-nums">
          {totalFiltered.toLocaleString()} of {rows.length.toLocaleString()} rows
          {activeFilterCount > 0 && (
            <>
              {' · '}
              <button
                type="button"
                onClick={() => setColumnFilters({})}
                className="underline-offset-2 hover:underline hover:text-foreground"
              >
                clear {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-secondary/90 backdrop-blur">
            <tr>
              <th className="sticky left-0 z-20 border-b border-r bg-secondary/90 px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                #
              </th>
              {visibleColumns.map((c) => {
                const isSorted = sort?.columnId === c.id
                return (
                  <th key={c.id} className="border-b border-r px-2 py-1.5 text-left font-medium align-top">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleSort(c.id)}
                        className="group flex min-w-0 flex-1 items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-accent/10"
                      >
                        {renaming === c.id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename()
                              if (e.key === 'Escape') setRenaming(null)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full rounded border border-input bg-background px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        ) : (
                          <span className="flex min-w-0 flex-col leading-tight">
                            <span className="truncate text-foreground">{c.name}</span>
                            <span className={cn('text-[10px] font-normal uppercase tracking-wider', TYPE_BADGE[c.type])}>
                              {c.type}
                            </span>
                          </span>
                        )}
                        <span className="ml-auto shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          {isSorted ? (
                            sort?.dir === 'asc' ? (
                              <ArrowUpAZ className="h-3.5 w-3.5 text-primary opacity-100" />
                            ) : (
                              <ArrowDownAZ className="h-3.5 w-3.5 text-primary opacity-100" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>
                      <Popover
                        align="end"
                        trigger={
                          <button
                            type="button"
                            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                            aria-label="Column menu"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        }
                      >
                        {onShowStats && (
                          <>
                            <MenuItem onSelect={() => onShowStats(c)}>
                              <BarChart2 className="h-3.5 w-3.5" />
                              Show stats
                            </MenuItem>
                            <MenuSeparator />
                          </>
                        )}
                        <MenuItem onSelect={() => beginRename(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Rename
                        </MenuItem>
                        <MenuSeparator />
                        <MenuLabel>Change type</MenuLabel>
                        {COLUMN_TYPES.map((t) => (
                          <MenuItem key={t} onSelect={() => updateColumn(c.id, { type: t })}>
                            <Type className="h-3.5 w-3.5" />
                            <span className="flex-1">{t}</span>
                            {c.type === t && <Check className="h-3.5 w-3.5 text-primary" />}
                          </MenuItem>
                        ))}
                        <MenuSeparator />
                        <MenuItem onSelect={() => updateColumn(c.id, { hidden: true })}>
                          <EyeOff className="h-3.5 w-3.5" />
                          Hide column
                        </MenuItem>
                        {sort?.columnId === c.id && (
                          <MenuItem onSelect={() => setSort(null)}>
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            Clear sort
                          </MenuItem>
                        )}
                        {onColumnTransform && (
                          <>
                            <MenuSeparator />
                            <MenuLabel>Clean</MenuLabel>
                            {(c.type === 'string' || c.type === 'categorical') && (
                              <>
                                <MenuItem onSelect={() => onColumnTransform(c, { kind: 'trim' })}>
                                  <Brush className="h-3.5 w-3.5" />
                                  Trim whitespace
                                </MenuItem>
                                <MenuItem onSelect={() => onColumnTransform(c, { kind: 'case', mode: 'lower' })}>
                                  <Type className="h-3.5 w-3.5" />
                                  lowercase
                                </MenuItem>
                                <MenuItem onSelect={() => onColumnTransform(c, { kind: 'case', mode: 'upper' })}>
                                  <Type className="h-3.5 w-3.5" />
                                  UPPERCASE
                                </MenuItem>
                                <MenuItem onSelect={() => onColumnTransform(c, { kind: 'case', mode: 'title' })}>
                                  <Type className="h-3.5 w-3.5" />
                                  Title Case
                                </MenuItem>
                              </>
                            )}
                            <MenuLabel>Fill missing</MenuLabel>
                            {c.type === 'number' && (
                              <>
                                <MenuItem onSelect={() => onColumnTransform(c, { kind: 'fill', strategy: 'mean' })}>
                                  with mean
                                </MenuItem>
                                <MenuItem onSelect={() => onColumnTransform(c, { kind: 'fill', strategy: 'median' })}>
                                  with median
                                </MenuItem>
                                <MenuItem onSelect={() => onColumnTransform(c, { kind: 'fill', strategy: 'zero' })}>
                                  with 0
                                </MenuItem>
                              </>
                            )}
                            <MenuItem onSelect={() => onColumnTransform(c, { kind: 'fill', strategy: 'mode' })}>
                              with mode (most common)
                            </MenuItem>
                            <MenuItem onSelect={() => onColumnTransform(c, { kind: 'drop-empty' })}>
                              <Trash className="h-3.5 w-3.5" />
                              Drop rows where empty
                            </MenuItem>
                          </>
                        )}
                        {onDeleteColumn && (
                          <>
                            <MenuSeparator />
                            <MenuItem destructive onSelect={() => onDeleteColumn(c)}>
                              <Trash className="h-3.5 w-3.5" />
                              Delete column
                            </MenuItem>
                          </>
                        )}
                      </Popover>
                    </div>
                    <input
                      value={columnFilters[c.id] ?? ''}
                      onChange={(e) =>
                        setColumnFilters((f) => ({ ...f, [c.id]: e.target.value }))
                      }
                      placeholder="filter"
                      className="mt-1 w-full rounded border border-input bg-background px-1.5 py-0.5 text-xs font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Eye className="h-4 w-4" />
                    No rows match the current filters.
                  </div>
                </td>
              </tr>
            )}
            {visibleRows.map((row, i) => (
              <tr key={i} className="even:bg-muted/30 hover:bg-accent/5">
                <td className="sticky left-0 z-[5] border-b border-r bg-card/80 px-3 py-1.5 text-right text-xs tabular-nums text-muted-foreground">
                  {i + 1}
                </td>
                {visibleColumns.map((c) => {
                  const v = row[c.id]
                  const isNum = c.type === 'number'
                  return (
                    <td
                      key={c.id}
                      className={cn(
                        'border-b border-r px-3 py-1.5 align-top',
                        isNum && 'text-right tabular-nums',
                        (v === null || v === undefined) && 'text-muted-foreground italic',
                      )}
                    >
                      {v === null || v === undefined ? 'null' : formatCell(v, c.type)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {truncated && (
        <div className="border-t bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          Showing first {maxRows.toLocaleString()} of {totalFiltered.toLocaleString()} filtered rows.
          Refine your filter to narrow further.
        </div>
      )}
    </div>
  )
}
