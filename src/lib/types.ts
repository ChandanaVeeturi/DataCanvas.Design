export type ColumnType = 'number' | 'string' | 'boolean' | 'date' | 'categorical'

export interface Column {
  id: string
  name: string
  type: ColumnType
  hidden?: boolean
}

export type CellValue = string | number | boolean | Date | null

export type DataRow = Record<string, CellValue>

export interface Dataset {
  id: string
  name: string
  sourceFile: string
  createdAt: number
  rowCount: number
  columns: Column[]
  /** Stored separately in IndexedDB once persistence lands; in-memory for now. */
  rows: DataRow[]
}

export type ChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'scatter'
  | 'pie'
  | 'donut'
  | 'histogram'
  | 'boxplot'
  | 'heatmap'
  | 'treemap'
  | 'radar'

export type Aggregator = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'none'

export interface ChartEncoding {
  x?: string
  y?: string
  series?: string
  size?: string
  value?: string
}

export interface ChartSpec {
  id: string
  datasetId: string
  type: ChartType
  title: string
  encoding: ChartEncoding
  aggregate: Aggregator
  options: {
    stacked?: boolean
    horizontal?: boolean
    smooth?: boolean
    binCount?: number
    showLegend?: boolean
    showGrid?: boolean
    logScale?: boolean
  }
  createdAt: number
}

// ---------- Dashboards ----------

export interface TileLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

interface BaseTile {
  id: string
}

export interface ChartTileSpec extends BaseTile {
  kind: 'chart'
  chartId: string
}

export interface KpiTileSpec extends BaseTile {
  kind: 'kpi'
  title: string
  columnId: string
  aggregate: Aggregator
  format?: 'number' | 'currency' | 'percent'
}

export interface TextTileSpec extends BaseTile {
  kind: 'text'
  /** Rich text not yet — plain string with leading "# " allowed for heading style. */
  content: string
}

export type Tile = ChartTileSpec | KpiTileSpec | TextTileSpec

export interface DashboardFilter {
  columnId: string
  values: string[]
}

export interface DashboardSpec {
  id: string
  datasetId: string
  name: string
  tiles: Tile[]
  layout: TileLayout[]
  createdAt: number
  updatedAt: number
}
