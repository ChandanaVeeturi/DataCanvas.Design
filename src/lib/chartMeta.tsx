import type { ChartType } from '@/lib/types'

export interface ChartMeta {
  type: ChartType
  label: string
  /** Short tagline used in the type picker and gallery cards. */
  description: string
  /** Mini SVG preview rendered in the picker / gallery card. */
  preview: JSX.Element
  /** 1–2 sentence "when should I reach for this?" guidance. */
  whenToUse: string
  /** Use cases this chart shines at — used as tag chips. */
  bestFor: string[]
  /** Plain-English description of column requirements. */
  encodings: string
  /** Common pitfalls / when NOT to use this chart. */
  pitfalls: string[]
  /** Suggested sample dataset id to demo the chart well. */
  suggestedDataset: string
  /** Loose category for filtering. */
  category: 'compare' | 'trend' | 'distribution' | 'relationship' | 'composition'
}

const stroke = 'currentColor'

export const CHART_TYPES: ChartMeta[] = [
  {
    type: 'bar',
    label: 'Bar',
    description: 'Compare categories',
    preview: (
      <svg viewBox="0 0 48 32" fill="none" stroke={stroke} strokeWidth="1.5">
        <rect x="4" y="18" width="6" height="10" rx="1" fill="currentColor" opacity="0.85" />
        <rect x="14" y="10" width="6" height="18" rx="1" fill="currentColor" opacity="0.85" />
        <rect x="24" y="14" width="6" height="14" rx="1" fill="currentColor" opacity="0.85" />
        <rect x="34" y="6" width="6" height="22" rx="1" fill="currentColor" opacity="0.85" />
      </svg>
    ),
    whenToUse:
      'Compare a single numeric value across a handful of discrete categories. The workhorse chart — start here when in doubt.',
    bestFor: ['Categorical comparison', 'Rankings', 'Totals by group'],
    encodings: 'X = category, Y = numeric value, optional Series for grouped/stacked color.',
    pitfalls: [
      'Avoid more than ~12 categories — switch to a horizontal bar or treemap.',
      'Stacked bars hide individual values; only use when totals are the point.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'compare',
  },
  {
    type: 'line',
    label: 'Line',
    description: 'Trend over time',
    preview: (
      <svg viewBox="0 0 48 32" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <polyline points="4,24 14,18 22,22 30,10 40,14" />
        <circle cx="4" cy="24" r="1.5" fill="currentColor" />
        <circle cx="14" cy="18" r="1.5" fill="currentColor" />
        <circle cx="22" cy="22" r="1.5" fill="currentColor" />
        <circle cx="30" cy="10" r="1.5" fill="currentColor" />
        <circle cx="40" cy="14" r="1.5" fill="currentColor" />
      </svg>
    ),
    whenToUse:
      'Show how a numeric value changes across an ordered axis (usually time). Best for spotting trends, seasonality, and outliers.',
    bestFor: ['Time series', 'Trends', 'Multiple series comparison'],
    encodings: 'X = ordered (date or numeric), Y = numeric, optional Series for multiple lines.',
    pitfalls: [
      'Avoid connecting categorical points with a line — implies false continuity.',
      'Too many series turn into spaghetti; cap at 5–7 or facet.',
    ],
    suggestedDataset: 'nyc-taxi',
    category: 'trend',
  },
  {
    type: 'area',
    label: 'Area',
    description: 'Filled trend',
    preview: (
      <svg viewBox="0 0 48 32" fill="none" stroke={stroke} strokeWidth="1.5">
        <path d="M4 24 L14 18 L22 22 L30 10 L40 14 L40 28 L4 28 Z" fill="currentColor" opacity="0.35" />
        <polyline points="4,24 14,18 22,22 30,10 40,14" strokeLinejoin="round" />
      </svg>
    ),
    whenToUse:
      'A line chart with the area below filled. Use when the magnitude matters as much as the trend, or to show cumulative parts of a whole.',
    bestFor: ['Cumulative trends', 'Part-to-whole over time'],
    encodings: 'X = ordered axis, Y = numeric, Series for stacked bands.',
    pitfalls: [
      'Stacked areas make individual series hard to compare — only the bottom is on a flat baseline.',
      'Don\'t use for negative values; the fill becomes confusing.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'trend',
  },
  {
    type: 'scatter',
    label: 'Scatter',
    description: 'Correlate two metrics',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <circle cx="8" cy="22" r="1.6" opacity="0.85" />
        <circle cx="14" cy="16" r="1.6" opacity="0.85" />
        <circle cx="20" cy="20" r="1.6" opacity="0.85" />
        <circle cx="24" cy="12" r="1.6" opacity="0.85" />
        <circle cx="30" cy="14" r="1.6" opacity="0.85" />
        <circle cx="32" cy="22" r="1.6" opacity="0.85" />
        <circle cx="38" cy="8" r="1.6" opacity="0.85" />
        <circle cx="40" cy="18" r="1.6" opacity="0.85" />
      </svg>
    ),
    whenToUse:
      'Show the relationship between two numeric measures across many points. Reveals correlation, clusters, and outliers.',
    bestFor: ['Correlation', 'Cluster detection', 'Outlier spotting'],
    encodings: 'X = numeric, Y = numeric, optional Color = category, Size = numeric (bubble).',
    pitfalls: [
      'With dense data, points overlap — turn down opacity or sample.',
      'Don\'t encode time on X with a scatter; use a line instead.',
    ],
    suggestedDataset: 'iris',
    category: 'relationship',
  },
  {
    type: 'pie',
    label: 'Pie',
    description: 'Share of whole',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <circle cx="24" cy="16" r="12" opacity="0.35" />
        <path d="M24 16 L24 4 A12 12 0 0 1 35 22 Z" />
        <path d="M24 16 L35 22 A12 12 0 0 1 17 27 Z" opacity="0.7" />
      </svg>
    ),
    whenToUse:
      'Show how a total breaks into a small number of parts. Easy for casual audiences; poor for precise comparison.',
    bestFor: ['Part-to-whole with ≤5 slices', 'Audience-friendly summaries'],
    encodings: 'Slice = category, Value = numeric (optional — defaults to count).',
    pitfalls: [
      'Humans compare angles poorly — use a bar chart if precision matters.',
      'Avoid more than 5–6 slices; merge small ones into "Other".',
    ],
    suggestedDataset: 'titanic',
    category: 'composition',
  },
  {
    type: 'donut',
    label: 'Donut',
    description: 'Pie with center',
    preview: (
      <svg viewBox="0 0 48 32" fill="none" stroke={stroke} strokeWidth="6">
        <circle cx="24" cy="16" r="10" opacity="0.35" />
        <path d="M24 6 A10 10 0 0 1 32 22" />
        <path d="M32 22 A10 10 0 0 1 18 24" opacity="0.7" />
      </svg>
    ),
    whenToUse:
      'A pie with a hole in the middle — leaves space for a total or KPI in the center, and reads slightly better than a full pie.',
    bestFor: ['Dashboards with a centered total', 'Part-to-whole summaries'],
    encodings: 'Slice = category, Value = numeric.',
    pitfalls: [
      'Same critique as pie — bar charts beat donuts for precise comparison.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'composition',
  },
  {
    type: 'histogram',
    label: 'Histogram',
    description: 'Distribution of a numeric',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <rect x="4" y="22" width="5" height="6" opacity="0.85" />
        <rect x="10" y="16" width="5" height="12" opacity="0.85" />
        <rect x="16" y="8" width="5" height="20" opacity="0.85" />
        <rect x="22" y="12" width="5" height="16" opacity="0.85" />
        <rect x="28" y="18" width="5" height="10" opacity="0.85" />
        <rect x="34" y="22" width="5" height="6" opacity="0.85" />
        <rect x="40" y="25" width="5" height="3" opacity="0.85" />
      </svg>
    ),
    whenToUse:
      'See how a single numeric column is distributed: skewness, modality, outliers, range. The first chart to reach for when meeting a new dataset.',
    bestFor: ['Distributions', 'Detecting skew & outliers', 'Choosing bins/ranges'],
    encodings: 'X = numeric column (auto-binned). Bin count is configurable.',
    pitfalls: [
      'Bin count matters — too few hides structure, too many gets noisy.',
      'For comparing distributions across groups, use a box plot instead.',
    ],
    suggestedDataset: 'titanic',
    category: 'distribution',
  },
  {
    type: 'boxplot',
    label: 'Box plot',
    description: 'Quartiles and outliers',
    preview: (
      <svg viewBox="0 0 48 32" fill="none" stroke={stroke} strokeWidth="1.5">
        <rect x="8" y="10" width="8" height="14" fill="currentColor" opacity="0.35" />
        <line x1="12" y1="6" x2="12" y2="10" />
        <line x1="12" y1="24" x2="12" y2="28" />
        <line x1="8" y1="17" x2="16" y2="17" strokeWidth="2" />
        <rect x="22" y="6" width="8" height="18" fill="currentColor" opacity="0.35" />
        <line x1="26" y1="2" x2="26" y2="6" />
        <line x1="26" y1="24" x2="26" y2="28" />
        <line x1="22" y1="14" x2="30" y2="14" strokeWidth="2" />
        <rect x="36" y="12" width="8" height="12" fill="currentColor" opacity="0.35" />
        <line x1="40" y1="8" x2="40" y2="12" />
        <line x1="40" y1="24" x2="40" y2="28" />
        <line x1="36" y1="18" x2="44" y2="18" strokeWidth="2" />
      </svg>
    ),
    whenToUse:
      'Compare distributions across categories at a glance — median, IQR (the box), whiskers, and outliers all in one mark.',
    bestFor: ['Distribution comparison across groups', 'Outlier callout'],
    encodings: 'X = category (groups), Y = numeric values within each group.',
    pitfalls: [
      'Hides multimodality (two peaks) — pair with a violin or histogram if you suspect it.',
      'Less intuitive to non-analyst audiences than bars.',
    ],
    suggestedDataset: 'iris',
    category: 'distribution',
  },
  {
    type: 'heatmap',
    label: 'Heatmap',
    description: 'Density across two cats',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        {[0, 1, 2, 3].map((y) =>
          [0, 1, 2, 3, 4, 5].map((x) => (
            <rect
              key={`${x}-${y}`}
              x={4 + x * 7}
              y={2 + y * 7}
              width="6"
              height="6"
              opacity={0.2 + ((x + y) % 5) * 0.16}
            />
          )),
        )}
      </svg>
    ),
    whenToUse:
      'Show how a value varies across the cross of two categorical (or binned) dimensions. Great for cohorts, calendars, and confusion matrices.',
    bestFor: ['Cohort views', 'Cross-category density', 'Correlation matrices'],
    encodings: 'X = category, Y (Series) = category, Value = numeric (aggregated).',
    pitfalls: [
      'Color perception is fuzzy — heatmaps are for patterns, not precise numbers.',
      'Use a colorblind-safe palette if printing or screen-sharing.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'relationship',
  },
  {
    type: 'treemap',
    label: 'Treemap',
    description: 'Nested rectangles',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <rect x="2" y="2" width="22" height="20" opacity="0.85" />
        <rect x="2" y="24" width="22" height="6" opacity="0.55" />
        <rect x="26" y="2" width="12" height="14" opacity="0.7" />
        <rect x="26" y="18" width="12" height="12" opacity="0.4" />
        <rect x="40" y="2" width="6" height="28" opacity="0.6" />
      </svg>
    ),
    whenToUse:
      'Show part-to-whole with many items, optionally grouped into parent categories. Handles long-tail distributions better than pie charts.',
    bestFor: ['Long-tail composition', 'Hierarchical breakdowns', 'Many-item ranking'],
    encodings: 'Leaf = category, Value = numeric, optional Group = parent category.',
    pitfalls: [
      'Tiny rectangles become unreadable — consider filtering to top-N.',
      'Order has no inherent meaning; users may read it as ranked.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'composition',
  },
  {
    type: 'radar',
    label: 'Radar',
    description: 'Compare profiles',
    preview: (
      <svg viewBox="0 0 48 32" fill="none" stroke={stroke} strokeWidth="1.2">
        <polygon points="24,4 38,12 34,26 14,26 10,12" opacity="0.3" />
        <polygon points="24,10 32,15 30,22 18,22 16,15" fill="currentColor" opacity="0.5" />
        <line x1="24" y1="4" x2="24" y2="28" opacity="0.4" />
        <line x1="10" y1="12" x2="38" y2="22" opacity="0.4" />
        <line x1="38" y1="12" x2="10" y2="22" opacity="0.4" />
      </svg>
    ),
    whenToUse:
      'Compare a few entities across the same set of numeric metrics. Reads as a shape profile — great for "which one is the well-rounded?".',
    bestFor: ['Profile comparison', 'Multi-metric summary'],
    encodings: 'Group = category (one polygon each). All numeric columns become axes automatically.',
    pitfalls: [
      'Axes share a scale — wildly different units distort the shape; normalize first.',
      'Hard to read with >4 polygons or >8 axes.',
    ],
    suggestedDataset: 'iris',
    category: 'relationship',
  },
  {
    type: 'funnel',
    label: 'Funnel',
    description: 'Stage-by-stage drop-off',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <polygon points="6,2 42,2 36,11 12,11" opacity="0.85" />
        <polygon points="12,13 36,13 30,22 18,22" opacity="0.65" />
        <polygon points="18,24 30,24 26,30 22,30" opacity="0.45" />
      </svg>
    ),
    whenToUse:
      'Show conversion or drop-off across a sequence of stages (e.g. marketing funnel, pipeline). Each step is proportionally sized.',
    bestFor: ['Conversion funnels', 'Pipeline stages', 'Sequential drop-off'],
    encodings: 'Stage = category, Value = numeric (optional — defaults to count).',
    pitfalls: [
      'Stages should be ordered logically — funnel implies a sequence.',
      'If stages are not related, a bar chart makes comparison easier.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'compare',
  },
  {
    type: 'gauge',
    label: 'Gauge',
    description: 'Single KPI dial',
    preview: (
      <svg viewBox="0 0 48 32" fill="none" stroke={stroke} strokeWidth="1.5">
        <path d="M6,28 A18,18 0 0,1 42,28" strokeWidth="5" opacity="0.18" />
        <path d="M6,28 A18,18 0 0,1 34,12" strokeWidth="5" opacity="0.85" />
        <line x1="24" y1="28" x2="33" y2="13" strokeWidth="2" />
        <circle cx="24" cy="28" r="2.5" fill="currentColor" />
      </svg>
    ),
    whenToUse:
      'Display a single aggregated metric against a scale — ideal for KPI dashboards and progress toward a target.',
    bestFor: ['KPI display', 'Progress toward target', 'Single metric summary'],
    encodings: 'Value = numeric column (aggregated to one number).',
    pitfalls: [
      'Gauges encode one number — use a bar chart if comparing multiple values.',
      'The max scale is auto-set; meaningful only when users know the expected range.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'compare',
  },
  {
    type: 'sankey',
    label: 'Sankey',
    description: 'Flow between categories',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <rect x="2" y="2" width="5" height="11" opacity="0.85" />
        <rect x="2" y="15" width="5" height="15" opacity="0.55" />
        <rect x="41" y="3" width="5" height="6" opacity="0.85" />
        <rect x="41" y="11" width="5" height="8" opacity="0.65" />
        <rect x="41" y="21" width="5" height="9" opacity="0.45" />
        <path d="M7,2 C24,2 24,3 41,3 L41,9 C24,9 24,13 7,13 Z" opacity="0.3" />
        <path d="M7,15 C24,13 24,11 41,11 L41,19 C24,19 24,20 7,20 Z" opacity="0.25" />
        <path d="M7,22 C24,22 24,21 41,21 L41,30 C24,30 24,30 7,30 Z" opacity="0.2" />
      </svg>
    ),
    whenToUse:
      'Show how values flow and redistribute between two sets of categories. Great for tracking where things come from and where they go.',
    bestFor: ['Source-to-destination flows', 'Budget allocation', 'User journey paths'],
    encodings: 'Source = category, Target = category, Value = numeric (optional — defaults to count).',
    pitfalls: [
      'Too many unique sources/targets create spaghetti — filter to top-N nodes.',
      'Sankey implies directional flow; avoid for symmetric relationships.',
    ],
    suggestedDataset: 'titanic',
    category: 'relationship',
  },
  {
    type: 'sunburst',
    label: 'Sunburst',
    description: 'Radial hierarchy',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <circle cx="24" cy="16" r="4" opacity="0.9" />
        <path d="M24,16 L24,8 A8,8 0 0,1 31,20 Z" opacity="0.7" />
        <path d="M24,16 L31,20 A8,8 0 0,1 17,24 Z" opacity="0.5" />
        <path d="M24,16 L17,24 A8,8 0 0,1 24,8 Z" opacity="0.35" />
        <path d="M24,3 A13,13 0 0,1 37,16" fill="none" stroke="currentColor" strokeWidth="4.5" opacity="0.8" />
        <path d="M37,16 A13,13 0 0,1 24,29" fill="none" stroke="currentColor" strokeWidth="4.5" opacity="0.55" />
        <path d="M24,29 A13,13 0 0,1 11,16" fill="none" stroke="currentColor" strokeWidth="4.5" opacity="0.35" />
        <path d="M11,16 A13,13 0 0,1 24,3" fill="none" stroke="currentColor" strokeWidth="4.5" opacity="0.2" />
      </svg>
    ),
    whenToUse:
      'A radial treemap — shows hierarchical part-to-whole relationships in a drill-down ring layout. Easier to explore than a treemap for deeply nested data.',
    bestFor: ['Hierarchical composition', 'Drill-down breakdowns', 'Multi-level categories'],
    encodings: 'Leaf = category, Value = numeric, optional Group = parent ring.',
    pitfalls: [
      'Outer rings become unreadable with many leaves — limit depth or filter.',
      'Less intuitive to casual audiences than a treemap.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'composition',
  },
  {
    type: 'waterfall',
    label: 'Waterfall',
    description: 'Cumulative changes',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <rect x="3" y="20" width="6" height="8" opacity="0.85" />
        <rect x="12" y="14" width="6" height="6" opacity="0.7" />
        <rect x="21" y="18" width="6" height="4" opacity="0.4" />
        <rect x="30" y="10" width="6" height="8" opacity="0.7" />
        <rect x="39" y="10" width="6" height="20" opacity="0.85" />
      </svg>
    ),
    whenToUse:
      'Visualise how a starting value is built up or reduced through a series of gains and losses. Classic for financial P&L, budget variance, or cohort changes.',
    bestFor: ['P&L / variance analysis', 'Budget bridges', 'Gain & loss breakdown'],
    encodings: 'X = category (steps), Y = numeric value (positive = gain, negative = loss).',
    pitfalls: [
      'Requires ordered categories — reordering changes the running total.',
      'Negative values appear as "drops"; ensure the audience understands the floating bar.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'compare',
  },
  {
    type: 'calendar',
    label: 'Calendar',
    description: 'Daily activity heatmap',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((col) =>
          [0, 1, 2, 3].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={2 + col * 5.6}
              y={2 + row * 7}
              width="4.5"
              height="6"
              opacity={0.08 + ((col * 4 + row + col) % 9) * 0.1}
              rx="0.5"
            />
          )),
        )}
      </svg>
    ),
    whenToUse:
      'Plot daily values across a calendar grid to reveal weekly, monthly, or seasonal patterns — the GitHub-style contribution chart.',
    bestFor: ['Daily activity patterns', 'Seasonal trends', 'Anomaly detection over time'],
    encodings: 'Date = date column, Value = numeric (optional — defaults to count per day).',
    pitfalls: [
      'Requires date data with enough density — sparse dates look mostly empty.',
      'Color perception is approximate; use for patterns, not precise values.',
    ],
    suggestedDataset: 'nyc-taxi',
    category: 'trend',
  },
  {
    type: 'rose',
    label: 'Rose',
    description: 'Polar bar chart',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <path d="M24,16 L24,4 A12,12 0 0,1 34,22 Z" opacity="0.85" />
        <path d="M24,16 L34,22 A8,8 0 0,1 16,26 Z" opacity="0.65" />
        <path d="M24,16 L16,26 A11,11 0 0,1 13,8 Z" opacity="0.5" />
        <path d="M24,16 L13,8 A6,6 0 0,1 24,4 Z" opacity="0.35" />
      </svg>
    ),
    whenToUse:
      'A bar chart wrapped into a polar coordinate system — the "Nightingale rose". Visually striking for cyclical or directional categories (months, compass points, hours).',
    bestFor: ['Cyclical comparisons', 'Directional data', 'Visually engaging dashboards'],
    encodings: 'Category = angle axis, Value = radius, optional Series for grouped/stacked rings.',
    pitfalls: [
      'Outer sectors appear visually larger due to radius² effect — use sparingly for precise comparison.',
      'Works best with naturally cyclical categories; arbitrary categories are misleading.',
    ],
    suggestedDataset: 'sales-demo',
    category: 'compare',
  },
  {
    type: 'stream',
    label: 'Stream',
    description: 'Flowing area over time',
    preview: (
      <svg viewBox="0 0 48 32" fill="currentColor">
        <path d="M2,10 Q16,6 24,8 Q32,10 46,6 L46,14 Q32,18 24,16 Q16,14 2,18 Z" opacity="0.7" />
        <path d="M2,18 Q16,14 24,16 Q32,18 46,14 L46,22 Q32,26 24,24 Q16,22 2,26 Z" opacity="0.5" />
        <path d="M2,26 Q16,22 24,24 Q32,26 46,22 L46,30 Q32,30 24,30 Q16,30 2,30 Z" opacity="0.35" />
      </svg>
    ),
    whenToUse:
      'Show how multiple streams evolve and compare over time in a flowing, organic shape. Good for topic trends, genre popularity, or user cohorts across periods.',
    bestFor: ['Multi-stream time trends', 'Topic/category evolution', 'Proportional flow over time'],
    encodings: 'X = time/ordered axis, Series = stream category, Value = numeric (optional — defaults to count).',
    pitfalls: [
      'Hard to read precise values — use a stacked area chart when exact numbers matter.',
      'Requires time data; works poorly with categorical X axes.',
    ],
    suggestedDataset: 'nyc-taxi',
    category: 'trend',
  },
]

export const CATEGORIES: { id: ChartMeta['category']; label: string; description: string }[] = [
  { id: 'compare', label: 'Compare', description: 'Rank or contrast values across categories' },
  { id: 'trend', label: 'Trend', description: 'Show change over an ordered axis' },
  { id: 'distribution', label: 'Distribution', description: 'Understand the shape of a numeric column' },
  { id: 'relationship', label: 'Relationship', description: 'Reveal correlation between metrics' },
  { id: 'composition', label: 'Composition', description: 'Break a total into parts' },
]

export function getChartMeta(type: ChartType): ChartMeta | undefined {
  return CHART_TYPES.find((c) => c.type === type)
}
