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
