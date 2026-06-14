import type { MetadataRoute } from 'next'
import { CHARTS, CATEGORIES } from '@/data/charts'
import { DATASETS } from '@/data/datasets'

const BASE_URL = 'https://datacanvas.design'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${BASE_URL}/charts`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE_URL}/wizard`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/playground`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/datasets`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/dashboards`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ]

  const categoryRoutes = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/charts/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const chartRoutes = CHARTS.map((chart) => ({
    url: `${BASE_URL}/charts/${chart.category}/${chart.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const datasetRoutes = DATASETS.map((d) => ({
    url: `${BASE_URL}/datasets/${d.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...chartRoutes, ...datasetRoutes]
}
