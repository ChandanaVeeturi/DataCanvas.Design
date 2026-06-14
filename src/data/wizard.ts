export type WizardGoal = 'compare' | 'trend' | 'distribution' | 'relationship' | 'composition' | 'flow' | 'hierarchy'

export interface WizardStep {
  id: string
  question: string
  options: WizardOption[]
}

export interface WizardOption {
  id: string
  label: string
  description: string
  icon: string
}

export interface ChartRecommendation {
  chartId: string
  chartName: string
  category: string
  score: number
  reason: string
}

export const WIZARD_GOALS: WizardOption[] = [
  { id: 'compare', label: 'Compare values', description: 'Show how categories differ from each other', icon: 'BarChart2' },
  { id: 'trend', label: 'Show a trend', description: 'Display change over time or sequence', icon: 'TrendingUp' },
  { id: 'distribution', label: 'Show distribution', description: 'Reveal the spread and shape of data', icon: 'Activity' },
  { id: 'relationship', label: 'Show relationship', description: 'Explore correlations between variables', icon: 'GitBranch' },
  { id: 'composition', label: 'Show composition', description: 'Display how parts make up a whole', icon: 'PieChart' },
  { id: 'flow', label: 'Show flow', description: 'Visualize movement through a process', icon: 'ArrowRight' },
  { id: 'hierarchy', label: 'Show hierarchy', description: 'Display nested parent-child relationships', icon: 'Network' },
]

export interface WizardAnswers {
  goal: WizardGoal | null
  dataSize: 'few' | 'medium' | 'many' | null
  timePoints: 'two' | 'few' | 'many' | null
  audience: 'general' | 'technical' | null
}

export function getRecommendations(answers: WizardAnswers): ChartRecommendation[] {
  const { goal } = answers

  const recommendations: Record<WizardGoal, ChartRecommendation[]> = {
    compare: [
      { chartId: 'bar-chart', chartName: 'Bar Chart', category: 'comparison', score: 95, reason: 'The most versatile and universally understood chart for comparing categories.' },
      { chartId: 'horizontal-bar', chartName: 'Horizontal Bar Chart', category: 'comparison', score: 88, reason: 'Better for long labels or many categories (10+).' },
      { chartId: 'grouped-bar', chartName: 'Grouped Bar Chart', category: 'comparison', score: 80, reason: 'Ideal when comparing multiple series across the same categories.' },
      { chartId: 'lollipop-chart', chartName: 'Lollipop Chart', category: 'comparison', score: 72, reason: 'A cleaner alternative to bar charts for many categories.' },
      { chartId: 'radar-chart', chartName: 'Radar Chart', category: 'comparison', score: 65, reason: 'Good for comparing multiple attributes of 2–3 entities simultaneously.' },
    ],
    trend: [
      { chartId: 'line-chart', chartName: 'Line Chart', category: 'trends', score: 95, reason: 'The default choice for showing change over time.' },
      { chartId: 'area-chart', chartName: 'Area Chart', category: 'trends', score: 82, reason: 'Use when magnitude (volume) is as important as the trend direction.' },
      { chartId: 'multi-line', chartName: 'Multi-Line Chart', category: 'trends', score: 78, reason: 'Compare 2–5 time series in the same chart.' },
      { chartId: 'slope-chart', chartName: 'Slope Chart', category: 'trends', score: 70, reason: 'Best for showing before/after change between exactly two points.' },
      { chartId: 'stacked-area', chartName: 'Stacked Area Chart', category: 'trends', score: 65, reason: 'Shows composition and total trend simultaneously.' },
    ],
    distribution: [
      { chartId: 'histogram', chartName: 'Histogram', category: 'distribution', score: 92, reason: 'The standard chart for showing how data is distributed across value ranges.' },
      { chartId: 'box-plot', chartName: 'Box Plot', category: 'distribution', score: 85, reason: 'Compact summary of distribution; great for comparing multiple groups.' },
      { chartId: 'dot-plot', chartName: 'Dot Plot', category: 'distribution', score: 78, reason: 'Shows every individual data point; ideal for small datasets.' },
      { chartId: 'violin-plot', chartName: 'Violin Plot', category: 'distribution', score: 72, reason: 'Combines box plot with density shape; powerful for technical audiences.' },
    ],
    relationship: [
      { chartId: 'scatter-plot', chartName: 'Scatter Plot', category: 'relationship', score: 95, reason: 'The primary tool for exploring relationships between two continuous variables.' },
      { chartId: 'bubble-chart', chartName: 'Bubble Chart', category: 'relationship', score: 80, reason: 'Add a third variable using bubble size.' },
      { chartId: 'heatmap', chartName: 'Heatmap', category: 'relationship', score: 75, reason: 'Reveal patterns across two categorical dimensions using color.' },
      { chartId: 'correlation-matrix', chartName: 'Correlation Matrix', category: 'relationship', score: 70, reason: 'Show pairwise correlations across many variables at once.' },
    ],
    composition: [
      { chartId: 'stacked-bar', chartName: 'Stacked Bar Chart', category: 'composition', score: 90, reason: 'Compare composition across multiple categories with a clear baseline.' },
      { chartId: 'pie-chart', chartName: 'Pie Chart', category: 'composition', score: 75, reason: 'Best for 2–5 parts where one segment dominates.' },
      { chartId: 'donut-chart', chartName: 'Donut Chart', category: 'composition', score: 72, reason: 'Like a pie chart, with center space for a key metric.' },
      { chartId: 'treemap', chartName: 'Treemap', category: 'composition', score: 80, reason: 'Hierarchical composition for many parts in limited space.' },
      { chartId: 'waffle-chart', chartName: 'Waffle Chart', category: 'composition', score: 65, reason: 'Makes percentages concrete and tangible for general audiences.' },
    ],
    flow: [
      { chartId: 'funnel-chart', chartName: 'Funnel Chart', category: 'flow', score: 92, reason: 'The standard chart for conversion and pipeline analysis.' },
      { chartId: 'sankey-diagram', chartName: 'Sankey Diagram', category: 'flow', score: 85, reason: 'Shows multi-path flows with proportional link widths.' },
      { chartId: 'alluvial-diagram', chartName: 'Alluvial Diagram', category: 'flow', score: 75, reason: 'Track entity migration between categories across stages.' },
    ],
    hierarchy: [
      { chartId: 'treemap', chartName: 'Treemap', category: 'composition', score: 88, reason: 'Shows hierarchical composition with size encoding.' },
      { chartId: 'tree-diagram', chartName: 'Tree Diagram', category: 'hierarchy', score: 90, reason: 'Classic parent-child hierarchy visualization.' },
      { chartId: 'sunburst', chartName: 'Sunburst Chart', category: 'hierarchy', score: 80, reason: 'Radial hierarchy showing composition at each level.' },
      { chartId: 'icicle-chart', chartName: 'Icicle Chart', category: 'hierarchy', score: 75, reason: 'Rectangular partitioned hierarchy — easier to read than sunburst.' },
    ],
  }

  return goal ? (recommendations[goal] ?? []) : []
}
