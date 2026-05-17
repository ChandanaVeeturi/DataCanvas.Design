// Dashboard-level export helpers. Heavy deps (html-to-image, jspdf) are
// dynamically imported so they only land in the bundle when actually used.

import type { ChartSpec, DashboardSpec, Dataset, Tile } from './types'

function safeFilename(name: string): string {
  return name.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'dashboard'
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/**
 * Capture an arbitrary DOM node as a PNG dataURL.
 * Pulls in html-to-image lazily.
 */
export async function captureNodeAsPng(node: HTMLElement, opts?: { pixelRatio?: number; backgroundColor?: string }): Promise<string> {
  const { toPng } = await import('html-to-image')
  return toPng(node, {
    pixelRatio: opts?.pixelRatio ?? 2,
    backgroundColor: opts?.backgroundColor ?? '#ffffff',
    cacheBust: true,
    skipFonts: true,
  })
}

export async function downloadDashboardPng(node: HTMLElement, dashboardName: string) {
  const dataUrl = await captureNodeAsPng(node)
  triggerDownload(dataUrl, `${safeFilename(dashboardName)}.png`)
}

interface PdfTileInput {
  tile: Tile
  /** Optional precomputed chart spec for chart tiles, so we can render a title. */
  chart?: ChartSpec
  /** Captured PNG dataURL for the tile contents. */
  dataUrl: string
  /** Natural width/height of the captured image. */
  width: number
  height: number
}

export async function downloadDashboardPdf(
  dashboard: DashboardSpec,
  dataset: Dataset,
  captures: PdfTileInput[],
) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const padding = 40

  // Cover page
  pdf.setFontSize(24)
  pdf.text(dashboard.name, padding, padding + 30)
  pdf.setFontSize(11)
  pdf.setTextColor(120)
  pdf.text(
    `${dashboard.tiles.length} tile${dashboard.tiles.length === 1 ? '' : 's'} · dataset: ${dataset.name} · ${dataset.rowCount.toLocaleString()} rows`,
    padding,
    padding + 50,
  )
  pdf.setTextColor(40)
  pdf.text(`Exported ${new Date().toLocaleString()}`, padding, padding + 68)
  pdf.setDrawColor(220)
  pdf.line(padding, padding + 80, pageWidth - padding, padding + 80)

  // One page per tile
  for (const cap of captures) {
    pdf.addPage()
    const title =
      cap.tile.kind === 'chart'
        ? cap.chart?.title ?? 'Chart'
        : cap.tile.kind === 'kpi'
        ? cap.tile.title
        : 'Text'
    pdf.setFontSize(16)
    pdf.setTextColor(20)
    pdf.text(title, padding, padding + 10)

    const maxWidth = pageWidth - padding * 2
    const maxHeight = pageHeight - padding * 2 - 40
    const ratio = Math.min(maxWidth / cap.width, maxHeight / cap.height, 1)
    const drawWidth = cap.width * ratio
    const drawHeight = cap.height * ratio
    const x = (pageWidth - drawWidth) / 2
    const y = padding + 30
    pdf.addImage(cap.dataUrl, 'PNG', x, y, drawWidth, drawHeight, undefined, 'FAST')
  }

  pdf.save(`${safeFilename(dashboard.name)}.pdf`)
}

/** Capture each tile DOM individually by data-tile-id attribute. */
export async function captureDashboardTiles(
  dashboard: DashboardSpec,
  charts: ChartSpec[],
  container: HTMLElement,
): Promise<PdfTileInput[]> {
  const captures: PdfTileInput[] = []
  for (const tile of dashboard.tiles) {
    const node = container.querySelector<HTMLElement>(`[data-tile-id="${tile.id}"]`)
    if (!node) continue
    const dataUrl = await captureNodeAsPng(node)
    const rect = node.getBoundingClientRect()
    captures.push({
      tile,
      chart: tile.kind === 'chart' ? charts.find((c) => c.id === tile.chartId) : undefined,
      dataUrl,
      width: rect.width,
      height: rect.height,
    })
  }
  return captures
}
