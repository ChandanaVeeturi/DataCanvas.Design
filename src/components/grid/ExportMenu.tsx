import { Download, FileJson, FileSpreadsheet, FileText, Sheet } from 'lucide-react'
import type { Dataset } from '@/lib/types'
import { downloadCsv, downloadJson, downloadTsv, downloadXlsx } from '@/lib/data-export'
import { MenuItem, MenuLabel, MenuSeparator, Popover } from '@/components/ui/popover'
import { toast } from '@/stores/toast.store'

interface ExportMenuProps {
  dataset: Dataset
}

function safeFilename(name: string): string {
  return name.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'dataset'
}

export function ExportMenu({ dataset }: ExportMenuProps) {
  const run = (fn: () => unknown, ext: string) => {
    try {
      const r = fn()
      const finalize = () => toast.success('Downloaded', `${safeFilename(dataset.name)}.${ext}`)
      if (r instanceof Promise) void r.then(finalize).catch((err) => toast.error('Export failed', err?.message))
      else finalize()
    } catch (err) {
      toast.error('Export failed', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <Popover
      align="end"
      trigger={
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent/10"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      }
    >
      <MenuLabel>Export dataset</MenuLabel>
      <MenuItem onSelect={() => run(() => downloadCsv(dataset), 'csv')}>
        <FileText className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1">CSV</span>
      </MenuItem>
      <MenuItem onSelect={() => run(() => downloadTsv(dataset), 'tsv')}>
        <FileText className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1">TSV (tab separated)</span>
      </MenuItem>
      <MenuItem onSelect={() => run(() => downloadJson(dataset), 'json')}>
        <FileJson className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1">JSON</span>
      </MenuItem>
      <MenuSeparator />
      <MenuItem onSelect={() => run(() => downloadXlsx(dataset), 'xlsx')}>
        <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1">XLSX (Excel)</span>
        <Sheet className="h-3 w-3 opacity-50" />
      </MenuItem>
      <div className="mt-1 border-t pt-1.5 px-2 pb-1 text-[10px] leading-snug text-muted-foreground">
        Hidden columns are not included.
      </div>
    </Popover>
  )
}

