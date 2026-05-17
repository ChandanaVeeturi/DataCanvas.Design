import { useCallback, useState, type DragEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, UploadCloud, FileSpreadsheet, FileText } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import type { MultiSheetResult, ParseProgress } from '@/features/datasets/parse'
import { useDatasetsStore } from '@/stores/datasets.store'
import { toast } from '@/stores/toast.store'
import { SheetPicker } from './SheetPicker'

const ACCEPT = '.csv,.tsv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

type Status =
  | { kind: 'idle' }
  | { kind: 'parsing'; file: File; progress: ParseProgress }
  | { kind: 'multi'; file: File; multi: MultiSheetResult }
  | { kind: 'error'; message: string }

export function Dropzone() {
  const navigate = useNavigate()
  const addDataset = useDatasetsStore((s) => s.addDataset)
  const [isOver, setIsOver] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const handleFile = useCallback(
    async (file: File) => {
      if (!/\.(csv|tsv|xlsx|xls|xlsm)$/i.test(file.name)) {
        setStatus({ kind: 'error', message: `Unsupported file: ${file.name}. Expected CSV, TSV, XLS, or XLSX.` })
        return
      }
      setStatus({ kind: 'parsing', file, progress: { phase: 'reading' } })
      try {
        const { parseFile } = await import('@/features/datasets/parse')
        const result = await parseFile(file, (progress) => {
          setStatus((s) => (s.kind === 'parsing' ? { ...s, progress } : s))
        })
        if (result.kind === 'multi') {
          setStatus({ kind: 'multi', file, multi: result })
          return
        }
        await addDataset(result.dataset)
        toast.success(
          `Loaded ${result.dataset.name}`,
          `${result.dataset.rowCount.toLocaleString()} rows · ${result.dataset.columns.length} columns`,
        )
        setStatus({ kind: 'idle' })
        navigate(`/workspace/${result.dataset.id}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to parse file.'
        toast.error('Failed to parse file', message)
        setStatus({ kind: 'error', message })
      }
    },
    [addDataset, navigate],
  )

  const onDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      setIsOver(false)
      const file = e.dataTransfer.files[0]
      if (file) void handleFile(file)
    },
    [handleFile],
  )

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  const onPickSheet = async (sheetName: string) => {
    if (status.kind !== 'multi') return
    try {
      const dataset = status.multi.build(sheetName)
      await addDataset(dataset)
      toast.success(`Loaded sheet ${sheetName}`, `${dataset.rowCount.toLocaleString()} rows · ${dataset.columns.length} columns`)
      setStatus({ kind: 'idle' })
      navigate(`/workspace/${dataset.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to build sheet.'
      toast.error('Failed to load sheet', message)
      setStatus({ kind: 'error', message })
    }
  }

  const isBusy = status.kind === 'parsing'
  const progressLabel = isBusy ? labelFor(status.progress) : null

  return (
    <div className="space-y-2">
      <label
        htmlFor="dc-file"
        onDragOver={(e) => {
          e.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={onDrop}
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card/60 px-6 py-12 text-center transition-all',
          'hover:border-primary/60 hover:bg-card',
          isOver && 'border-primary bg-primary/5 ring-4 ring-primary/10',
          isBusy && 'pointer-events-none opacity-80',
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
          {isBusy ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
        </div>
        <p className="text-base font-medium">
          {isBusy ? progressLabel : (
            <>Drop a file here, or <span className="text-primary underline-offset-2 group-hover:underline">browse</span></>
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          CSV, TSV, XLSX, XLS · processed locally in your browser
        </p>

        <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> CSV / TSV
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" /> XLSX / XLS
          </span>
        </div>

        <input
          id="dc-file"
          type="file"
          accept={ACCEPT}
          onChange={onChange}
          disabled={isBusy}
          className="sr-only"
        />
      </label>

      {status.kind === 'parsing' && (
        <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
          <div className="flex items-center gap-2 truncate">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
            <span className="truncate font-medium">{status.file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatBytes(status.file.size)}
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{progressLabel}</span>
        </div>
      )}

      {status.kind === 'error' && (
        <div className="flex items-start justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <span>{status.message}</span>
          <button
            type="button"
            onClick={() => setStatus({ kind: 'idle' })}
            className="text-xs underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {status.kind === 'multi' && (
        <SheetPicker
          fileName={status.file.name}
          sheets={status.multi.sheets}
          onPick={onPickSheet}
          onCancel={() => setStatus({ kind: 'idle' })}
        />
      )}
    </div>
  )
}

function labelFor(progress: ParseProgress) {
  switch (progress.phase) {
    case 'reading':
      return 'Reading file…'
    case 'parsing':
      return progress.rowsParsed
        ? `Parsing… ${progress.rowsParsed.toLocaleString()} rows`
        : 'Parsing…'
    case 'inferring':
      return 'Inferring column types…'
    case 'done':
      return 'Done'
  }
}
