import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Columns3,
  Database,
  FunctionSquare,
  Group,
  LayoutDashboard,
  Link2,
  Loader2,
  Table2,
  Trash2,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MenuItem, MenuLabel, MenuSeparator, Popover } from '@/components/ui/popover'
import { DataTable, type ColumnTransform } from '@/components/grid/DataTable'
import { ExportMenu } from '@/components/grid/ExportMenu'
import { StatsPanel } from '@/components/grid/StatsPanel'
import { useDatasetsStore } from '@/stores/datasets.store'
import { useChartsStore } from '@/stores/charts.store'
import { useDashboardsStore } from '@/stores/dashboards.store'
import { ChartsTab } from '@/components/charts/ChartsTab'
import { ChartBuilder } from '@/components/charts/ChartBuilder'
import { DashboardsTab } from '@/components/dashboard/DashboardsTab'
import { DashboardEditor } from '@/components/dashboard/DashboardEditor'
import { DerivedColumnDialog } from '@/components/transforms/DerivedColumnDialog'
import { GroupByDialog } from '@/components/transforms/GroupByDialog'
import { JoinDialog } from '@/components/transforms/JoinDialog'
import { recoerceColumn } from '@/features/datasets/inferTypes'
import {
  changeCase,
  deleteColumn,
  dropMissing,
  fillMissing,
  trimColumn,
} from '@/features/transforms/clean'
import { SAMPLES, buildSampleDataset } from '@/data/samples'
import type { Column, DashboardSpec, Dataset } from '@/lib/types'
import { cn } from '@/lib/utils'

type Mode = 'data' | 'charts' | 'dashboards' | 'building-chart' | 'editing-dashboard'
type Overlay = null | 'derived' | 'groupby' | 'join'

function newDashboard(datasetId: string, name: string): DashboardSpec {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    datasetId,
    name,
    tiles: [],
    layout: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function WorkspacePage() {
  const navigate = useNavigate()
  const { datasetId } = useParams()
  const dataset = useDatasetsStore((s) => s.datasets.find((d) => d.id === datasetId))
  const hydrated = useDatasetsStore((s) => s.hydrated)
  const addDataset = useDatasetsStore((s) => s.addDataset)
  const removeDataset = useDatasetsStore((s) => s.removeDataset)
  const updateDataset = useDatasetsStore((s) => s.updateDataset)
  const upsertChart = useChartsStore((s) => s.upsertChart)
  const getChart = useChartsStore((s) => s.getChart)
  const upsertDashboard = useDashboardsStore((s) => s.upsertDashboard)
  const getDashboard = useDashboardsStore((s) => s.getDashboard)

  const [mode, setMode] = useState<Mode>('data')
  const [editingChartId, setEditingChartId] = useState<string | null>(null)
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null)
  const [statsColumn, setStatsColumn] = useState<Column | null>(null)
  const [overlay, setOverlay] = useState<Overlay>(null)

  // Deep-link auto-load: if the URL points to a known sample dataset id and
  // the dataset isn't in the store yet, generate and persist it on the fly.
  useEffect(() => {
    if (!hydrated || dataset || !datasetId) return
    const sample = SAMPLES.find((s) => s.id === datasetId)
    if (!sample) return
    void addDataset(buildSampleDataset(sample))
  }, [hydrated, dataset, datasetId, addDataset])

  if (!hydrated) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your data…</p>
      </div>
    )
  }

  if (!dataset) {
    const sampleMatch = datasetId ? SAMPLES.find((s) => s.id === datasetId) : null
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {sampleMatch ? `Loading ${sampleMatch.title}…` : 'Dataset not found'}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {sampleMatch
              ? 'Generating the sample now — this should only take a moment.'
              : `No dataset with id "${datasetId}" is loaded. Pick a sample or upload a file on the home page.`}
          </p>
        </div>
        <Link to="/" className="mt-2">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to upload
          </Button>
        </Link>
      </div>
    )
  }

  const handleColumnsChange = (nextColumns: Column[]) => {
    let nextRows = dataset.rows
    for (const next of nextColumns) {
      const prev = dataset.columns.find((c) => c.id === next.id)
      if (prev && prev.type !== next.type) {
        nextRows = recoerceColumn(nextRows, next.id, next.type)
      }
    }
    updateDataset(dataset.id, { columns: nextColumns, rows: nextRows })
  }

  const handleColumnTransform = (column: Column, t: ColumnTransform) => {
    let nextRows = dataset.rows
    switch (t.kind) {
      case 'trim':
        nextRows = trimColumn(nextRows, column.id)
        break
      case 'case':
        nextRows = changeCase(nextRows, column.id, t.mode)
        break
      case 'fill':
        nextRows = fillMissing(nextRows, column, t.strategy)
        break
      case 'drop-empty':
        nextRows = dropMissing(nextRows, [column.id])
        break
    }
    updateDataset(dataset.id, { rows: nextRows, rowCount: nextRows.length })
  }

  const handleDeleteColumn = (column: Column) => {
    const { columns, rows } = deleteColumn(dataset.columns, dataset.rows, column.id)
    updateDataset(dataset.id, { columns, rows })
    if (statsColumn?.id === column.id) setStatsColumn(null)
  }

  const handleAddDerivedColumn = (newColumn: Column, nextRows: Dataset['rows']) => {
    updateDataset(dataset.id, {
      columns: [...dataset.columns, newColumn],
      rows: nextRows,
    })
    setOverlay(null)
  }

  if (mode === 'building-chart') {
    const existing = editingChartId ? getChart(editingChartId) : undefined
    return (
      <ChartBuilder
        dataset={dataset}
        initialSpec={existing}
        onSave={(spec) => {
          upsertChart(spec)
          setEditingChartId(null)
          setMode('charts')
        }}
        onCancel={() => {
          setEditingChartId(null)
          setMode('charts')
        }}
      />
    )
  }

  if (mode === 'editing-dashboard' && editingDashboardId) {
    const dashboard = getDashboard(editingDashboardId)
    if (dashboard) {
      return (
        <DashboardEditor
          dataset={dataset}
          dashboard={dashboard}
          onBack={() => {
            setEditingDashboardId(null)
            setMode('dashboards')
          }}
          onCreateNewChart={() => {
            setEditingChartId(null)
            setMode('building-chart')
          }}
        />
      )
    }
  }

  const openDashboard = (id: string) => {
    setEditingDashboardId(id)
    setMode('editing-dashboard')
  }

  const createDashboard = async () => {
    const draft = newDashboard(dataset.id, 'Untitled dashboard')
    await upsertDashboard(draft)
    openDashboard(draft.id)
  }

  const handleSaveDerivedDataset = async (next: Dataset) => {
    await addDataset(next)
    setOverlay(null)
    navigate(`/workspace/${next.id}`)
  }

  const transformsMenu = (
    <>
      <ExportMenu dataset={dataset} />
      <Popover
        align="end"
        trigger={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent/10"
          >
            <Wrench className="h-3.5 w-3.5" />
            Transform
          </button>
        }
      >
      <MenuLabel>Add columns</MenuLabel>
      <MenuItem onSelect={() => setOverlay('derived')}>
        <FunctionSquare className="h-3.5 w-3.5 text-primary" />
        New derived column…
      </MenuItem>
      <MenuSeparator />
      <MenuLabel>Reshape</MenuLabel>
      <MenuItem onSelect={() => setOverlay('groupby')}>
        <Group className="h-3.5 w-3.5 text-primary" />
        Group & aggregate…
      </MenuItem>
      <MenuItem onSelect={() => setOverlay('join')}>
        <Link2 className="h-3.5 w-3.5 text-primary" />
        Join with another dataset…
      </MenuItem>
    </Popover>
    </>
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card/40 px-6 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight">{dataset.name}</h2>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Database className="h-3 w-3" />
              {dataset.rowCount.toLocaleString()} rows
            </span>
            <span className="inline-flex items-center gap-1">
              <Columns3 className="h-3 w-3" />
              {dataset.columns.length} columns
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="font-mono text-muted-foreground/70">{dataset.sourceFile}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => removeDataset(dataset.id)}>
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b bg-background px-4 pt-2">
        <TabButton active={mode === 'data'} onClick={() => setMode('data')} icon={Table2} label="Data" />
        <TabButton active={mode === 'charts'} onClick={() => setMode('charts')} icon={BarChart3} label="Charts" />
        <TabButton active={mode === 'dashboards'} onClick={() => setMode('dashboards')} icon={LayoutDashboard} label="Dashboards" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {mode === 'data' && (
          <div className="flex min-h-0 flex-1 p-4">
            <DataTable
              columns={dataset.columns}
              rows={dataset.rows}
              onColumnsChange={handleColumnsChange}
              onShowStats={(col) => setStatsColumn(col)}
              onColumnTransform={handleColumnTransform}
              onDeleteColumn={handleDeleteColumn}
              toolbarExtras={transformsMenu}
            />
          </div>
        )}
        {mode === 'charts' && (
          <ChartsTab
            dataset={dataset}
            onNew={() => {
              setEditingChartId(null)
              setMode('building-chart')
            }}
            onEdit={(id) => {
              setEditingChartId(id)
              setMode('building-chart')
            }}
          />
        )}
        {mode === 'dashboards' && (
          <DashboardsTab dataset={dataset} onOpen={openDashboard} onNew={createDashboard} />
        )}

        {mode === 'data' && statsColumn && (
          <StatsPanel
            column={statsColumn}
            rows={dataset.rows}
            totalRows={dataset.rows.length}
            onClose={() => setStatsColumn(null)}
          />
        )}
      </div>

      {overlay === 'derived' && (
        <DerivedColumnDialog
          dataset={dataset}
          onCancel={() => setOverlay(null)}
          onSave={handleAddDerivedColumn}
        />
      )}
      {overlay === 'groupby' && (
        <GroupByDialog
          dataset={dataset}
          onCancel={() => setOverlay(null)}
          onSave={handleSaveDerivedDataset}
        />
      )}
      {overlay === 'join' && (
        <JoinDialog
          leftDataset={dataset}
          onCancel={() => setOverlay(null)}
          onSave={handleSaveDerivedDataset}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-sm transition-colors',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span
        className={cn(
          'absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-colors',
          active ? 'bg-primary' : 'bg-transparent',
        )}
      />
    </button>
  )
}
