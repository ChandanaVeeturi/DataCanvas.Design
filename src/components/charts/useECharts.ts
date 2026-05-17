import type { EChartsInstance } from 'echarts-for-react'

const registry = new Map<string, EChartsInstance>()

export function useECharts() {
  return {
    register(id: string, instance: EChartsInstance) {
      registry.set(id, instance)
    },
    unregister(id: string) {
      registry.delete(id)
    },
    downloadChartAsPng(id: string, filename: string) {
      const inst = registry.get(id)
      if (!inst) return
      const url = inst.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        type: 'png',
      })
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename.replace(/[^a-z0-9_-]+/gi, '_')}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    },
  }
}
