export type ChartCategory =
  | 'comparison'
  | 'trends'
  | 'distribution'
  | 'relationship'
  | 'composition'
  | 'flow'
  | 'hierarchy'

export type Complexity = 'beginner' | 'intermediate' | 'advanced'

export interface ChartDef {
  id: string
  name: string
  category: ChartCategory
  description: string
  longDescription: string
  whenToUse: string[]
  whenNotToUse: string[]
  bestPractices: string[]
  commonMistakes: string[]
  exampleData: Record<string, unknown>[]
  complexity: Complexity
  tags: string[]
  rechartsType: 'BarChart' | 'LineChart' | 'AreaChart' | 'ScatterChart' | 'PieChart' | 'RadarChart' | 'Treemap' | 'FunnelChart' | 'CustomSVG'
  seoTitle: string
  seoDescription: string
}

export interface CategoryDef {
  id: ChartCategory
  name: string
  description: string
  icon: string
  color: string
  chartCount: number
}
