export interface DatasetDef {
  id: string
  name: string
  description: string
  industry: string
  rows: number
  columns: number
  tags: string[]
  icon: string
  color: string
  fields: { name: string; type: 'number' | 'string' | 'date' | 'boolean' }[]
  sampleRows: Record<string, unknown>[]
  useCases: string[]
  recommendedCharts: string[]
}

export const DATASETS: DatasetDef[] = [
  {
    id: 'sales',
    name: 'Retail Sales',
    description: 'Monthly sales data across regions, products, and channels. Perfect for bar charts, line trends, and composition analysis.',
    industry: 'Retail',
    rows: 500,
    columns: 10,
    tags: ['sales', 'retail', 'revenue', 'regional'],
    icon: 'ShoppingCart',
    color: 'hsl(239, 84%, 60%)',
    fields: [
      { name: 'order_id', type: 'number' },
      { name: 'order_date', type: 'date' },
      { name: 'region', type: 'string' },
      { name: 'channel', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'product', type: 'string' },
      { name: 'quantity', type: 'number' },
      { name: 'unit_price', type: 'number' },
      { name: 'discount', type: 'number' },
      { name: 'revenue', type: 'number' },
    ],
    sampleRows: [
      { order_id: 1001, order_date: '2024-01-15', region: 'North', channel: 'online', category: 'Electronics', product: 'Headphones', quantity: 2, unit_price: 89.99, discount: 0.1, revenue: 161.98 },
      { order_id: 1002, order_date: '2024-01-18', region: 'South', channel: 'in_store', category: 'Apparel', product: 'Jacket', quantity: 1, unit_price: 149.99, discount: 0, revenue: 149.99 },
      { order_id: 1003, order_date: '2024-02-03', region: 'East', channel: 'online', category: 'Home', product: 'Cookware', quantity: 1, unit_price: 219.99, discount: 0.15, revenue: 186.99 },
    ],
    useCases: ['Monthly revenue trends', 'Regional performance comparison', 'Product mix analysis', 'Channel attribution'],
    recommendedCharts: ['line-chart', 'bar-chart', 'stacked-bar', 'treemap'],
  },
  {
    id: 'marketing',
    name: 'Marketing Analytics',
    description: 'Campaign performance data with impressions, clicks, conversions, and spend across channels.',
    industry: 'Marketing',
    rows: 360,
    columns: 9,
    tags: ['marketing', 'campaigns', 'conversion', 'digital'],
    icon: 'Megaphone',
    color: 'hsl(188, 95%, 43%)',
    fields: [
      { name: 'date', type: 'date' },
      { name: 'channel', type: 'string' },
      { name: 'campaign', type: 'string' },
      { name: 'impressions', type: 'number' },
      { name: 'clicks', type: 'number' },
      { name: 'ctr', type: 'number' },
      { name: 'conversions', type: 'number' },
      { name: 'spend', type: 'number' },
      { name: 'roas', type: 'number' },
    ],
    sampleRows: [
      { date: '2024-01-01', channel: 'Google Ads', campaign: 'Brand Awareness', impressions: 45200, clicks: 1840, ctr: 0.041, conversions: 92, spend: 2150, roas: 4.2 },
      { date: '2024-01-01', channel: 'Meta Ads', campaign: 'Retargeting', impressions: 28400, clicks: 1420, ctr: 0.050, conversions: 71, spend: 1890, roas: 3.8 },
      { date: '2024-01-01', channel: 'Email', campaign: 'Newsletter', impressions: 18200, clicks: 2184, ctr: 0.12, conversions: 218, spend: 220, roas: 19.5 },
    ],
    useCases: ['Channel performance comparison', 'Conversion funnel analysis', 'ROAS trend tracking', 'Campaign attribution'],
    recommendedCharts: ['funnel-chart', 'bar-chart', 'line-chart', 'scatter-plot'],
  },
  {
    id: 'finance',
    name: 'Financial Statements',
    description: 'Quarterly P&L data with revenue, cost, margins, and year-over-year comparisons.',
    industry: 'Finance',
    rows: 48,
    columns: 8,
    tags: ['finance', 'P&L', 'revenue', 'margins', 'quarterly'],
    icon: 'DollarSign',
    color: 'hsl(142, 71%, 45%)',
    fields: [
      { name: 'quarter', type: 'string' },
      { name: 'year', type: 'number' },
      { name: 'revenue', type: 'number' },
      { name: 'cogs', type: 'number' },
      { name: 'gross_profit', type: 'number' },
      { name: 'gross_margin', type: 'number' },
      { name: 'opex', type: 'number' },
      { name: 'net_income', type: 'number' },
    ],
    sampleRows: [
      { quarter: 'Q1', year: 2024, revenue: 42000000, cogs: 18900000, gross_profit: 23100000, gross_margin: 0.55, opex: 14700000, net_income: 8400000 },
      { quarter: 'Q2', year: 2024, revenue: 48500000, cogs: 21825000, gross_profit: 26675000, gross_margin: 0.55, opex: 15680000, net_income: 10995000 },
      { quarter: 'Q3', year: 2024, revenue: 51200000, cogs: 22528000, gross_profit: 28672000, gross_margin: 0.56, opex: 16640000, net_income: 12032000 },
    ],
    useCases: ['Revenue trend analysis', 'Margin waterfall charts', 'Budget vs actuals', 'YoY comparison'],
    recommendedCharts: ['line-chart', 'bar-chart', 'bullet-chart', 'grouped-bar'],
  },
  {
    id: 'product-analytics',
    name: 'Product Analytics',
    description: 'User behavior data including DAU, retention, feature adoption, and NPS scores.',
    industry: 'SaaS / Product',
    rows: 730,
    columns: 8,
    tags: ['product', 'retention', 'DAU', 'NPS', 'feature adoption'],
    icon: 'Layers',
    color: 'hsl(262, 83%, 58%)',
    fields: [
      { name: 'date', type: 'date' },
      { name: 'dau', type: 'number' },
      { name: 'mau', type: 'number' },
      { name: 'retention_d7', type: 'number' },
      { name: 'retention_d30', type: 'number' },
      { name: 'feature_adoption', type: 'number' },
      { name: 'nps', type: 'number' },
      { name: 'churn_rate', type: 'number' },
    ],
    sampleRows: [
      { date: '2024-01-01', dau: 12400, mau: 84200, retention_d7: 0.62, retention_d30: 0.41, feature_adoption: 0.34, nps: 52, churn_rate: 0.018 },
      { date: '2024-01-02', dau: 13100, mau: 85100, retention_d7: 0.63, retention_d30: 0.42, feature_adoption: 0.35, nps: 54, churn_rate: 0.017 },
      { date: '2024-01-03', dau: 11800, mau: 85400, retention_d7: 0.61, retention_d30: 0.41, feature_adoption: 0.34, nps: 51, churn_rate: 0.019 },
    ],
    useCases: ['DAU/MAU trend analysis', 'Retention cohort analysis', 'Feature adoption funnel', 'NPS tracking'],
    recommendedCharts: ['line-chart', 'area-chart', 'funnel-chart', 'scatter-plot'],
  },
  {
    id: 'startups',
    name: 'Startup Funding',
    description: 'Funding rounds, valuations, and sector data for 200 startups across multiple cohorts.',
    industry: 'Venture Capital',
    rows: 200,
    columns: 9,
    tags: ['startups', 'funding', 'VC', 'valuation', 'sectors'],
    icon: 'Rocket',
    color: 'hsl(25, 95%, 53%)',
    fields: [
      { name: 'company', type: 'string' },
      { name: 'sector', type: 'string' },
      { name: 'stage', type: 'string' },
      { name: 'year_founded', type: 'number' },
      { name: 'funding_usd', type: 'number' },
      { name: 'valuation_usd', type: 'number' },
      { name: 'employees', type: 'number' },
      { name: 'revenue_usd', type: 'number' },
      { name: 'profitable', type: 'boolean' },
    ],
    sampleRows: [
      { company: 'TechFlow', sector: 'SaaS', stage: 'Series B', year_founded: 2019, funding_usd: 28000000, valuation_usd: 140000000, employees: 85, revenue_usd: 8200000, profitable: false },
      { company: 'DataPulse', sector: 'AI/ML', stage: 'Series A', year_founded: 2021, funding_usd: 12000000, valuation_usd: 60000000, employees: 42, revenue_usd: 2800000, profitable: false },
      { company: 'GreenShift', sector: 'CleanTech', stage: 'Seed', year_founded: 2022, funding_usd: 2500000, valuation_usd: 12500000, employees: 18, revenue_usd: 420000, profitable: false },
    ],
    useCases: ['Funding by sector comparison', 'Valuation vs revenue scatter', 'Stage distribution', 'Sector treemap'],
    recommendedCharts: ['scatter-plot', 'bubble-chart', 'bar-chart', 'treemap'],
  },
  {
    id: 'population',
    name: 'World Population',
    description: 'Population, GDP, life expectancy, and demographic data for 50 countries over 20 years.',
    industry: 'Demographics / Geography',
    rows: 1000,
    columns: 8,
    tags: ['population', 'GDP', 'demographics', 'countries', 'life expectancy'],
    icon: 'Globe',
    color: 'hsl(340, 82%, 52%)',
    fields: [
      { name: 'country', type: 'string' },
      { name: 'year', type: 'number' },
      { name: 'population', type: 'number' },
      { name: 'gdp_per_capita', type: 'number' },
      { name: 'life_expectancy', type: 'number' },
      { name: 'fertility_rate', type: 'number' },
      { name: 'continent', type: 'string' },
      { name: 'urban_pct', type: 'number' },
    ],
    sampleRows: [
      { country: 'United States', year: 2023, population: 331000000, gdp_per_capita: 76329, life_expectancy: 78.9, fertility_rate: 1.66, continent: 'North America', urban_pct: 0.83 },
      { country: 'China', year: 2023, population: 1412000000, gdp_per_capita: 12556, life_expectancy: 77.4, fertility_rate: 1.09, continent: 'Asia', urban_pct: 0.65 },
      { country: 'Nigeria', year: 2023, population: 218000000, gdp_per_capita: 2184, life_expectancy: 54.7, fertility_rate: 5.24, continent: 'Africa', urban_pct: 0.54 },
    ],
    useCases: ['Gapminder-style bubble charts', 'Life expectancy vs GDP scatter', 'Population growth lines', 'Regional comparison'],
    recommendedCharts: ['bubble-chart', 'scatter-plot', 'line-chart', 'bar-chart'],
  },
]

export function getDatasetById(id: string): DatasetDef | undefined {
  return DATASETS.find((d) => d.id === id)
}
