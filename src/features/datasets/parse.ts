import Papa from 'papaparse'
// NOTE: `xlsx` on npm is the older free-pulled release. For untrusted file input,
// upgrade to the official SheetJS CE tarball from cdn.sheetjs.com. In this app
// users only ever open their own files, so the practical risk is contained.
import * as XLSX from 'xlsx'
import type { Dataset, DataRow } from '@/lib/types'
import { inferTypesAndCoerce } from './inferTypes'

export interface ParseProgress {
  phase: 'reading' | 'parsing' | 'inferring' | 'done'
  rowsParsed?: number
}

export interface ParsedSheet {
  name: string
  rowCount: number
  columnCount: number
}

export interface MultiSheetResult {
  kind: 'multi'
  sheets: ParsedSheet[]
  /** Build a dataset for a chosen sheet name. */
  build: (sheetName: string, datasetName?: string) => Dataset
}

export interface SingleDatasetResult {
  kind: 'single'
  dataset: Dataset
}

export type ParseResult = SingleDatasetResult | MultiSheetResult

function newId() {
  return crypto.randomUUID()
}

function buildDataset(opts: {
  id?: string
  name: string
  sourceFile: string
  columnIds: string[]
  rawRows: DataRow[]
}): Dataset {
  const { columns, rows } = inferTypesAndCoerce(opts.columnIds, opts.rawRows)
  return {
    id: opts.id ?? newId(),
    name: opts.name,
    sourceFile: opts.sourceFile,
    createdAt: Date.now(),
    rowCount: rows.length,
    columns,
    rows,
  }
}

function parseCsv(file: File, onProgress?: (p: ParseProgress) => void): Promise<SingleDatasetResult> {
  return new Promise((resolve, reject) => {
    onProgress?.({ phase: 'parsing' })
    const rows: DataRow[] = []
    let columnIds: string[] = []

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      worker: true,
      dynamicTyping: false,
      step: (result) => {
        if (columnIds.length === 0 && result.meta.fields) {
          columnIds = result.meta.fields
        }
        rows.push(result.data as DataRow)
        if (rows.length % 1000 === 0) {
          onProgress?.({ phase: 'parsing', rowsParsed: rows.length })
        }
      },
      complete: () => {
        if (columnIds.length === 0) {
          reject(new Error('No columns detected in CSV.'))
          return
        }
        onProgress?.({ phase: 'inferring', rowsParsed: rows.length })
        const dataset = buildDataset({
          name: file.name.replace(/\.[^.]+$/, ''),
          sourceFile: file.name,
          columnIds,
          rawRows: rows,
        })
        onProgress?.({ phase: 'done', rowsParsed: rows.length })
        resolve({ kind: 'single', dataset })
      },
      error: (err) => reject(err),
    })
  })
}

async function parseExcel(file: File, onProgress?: (p: ParseProgress) => void): Promise<ParseResult> {
  onProgress?.({ phase: 'reading' })
  const ab = await file.arrayBuffer()
  onProgress?.({ phase: 'parsing' })
  const wb = XLSX.read(ab, { type: 'array', cellDates: true })
  const sheetNames = wb.SheetNames

  const buildForSheet = (sheetName: string, datasetName?: string): Dataset => {
    const sheet = wb.Sheets[sheetName]
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found in workbook.`)
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: true,
    })
    const columnIds = Object.keys(json[0] ?? {})
    return buildDataset({
      name: datasetName ?? `${file.name.replace(/\.[^.]+$/, '')}${sheetNames.length > 1 ? ` · ${sheetName}` : ''}`,
      sourceFile: `${file.name}#${sheetName}`,
      columnIds,
      rawRows: json as DataRow[],
    })
  }

  if (sheetNames.length === 1) {
    const dataset = buildForSheet(sheetNames[0])
    onProgress?.({ phase: 'done' })
    return { kind: 'single', dataset }
  }

  const sheets: ParsedSheet[] = sheetNames.map((name) => {
    const sheet = wb.Sheets[name]
    const ref = sheet?.['!ref']
    const range = ref ? XLSX.utils.decode_range(ref) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
    return {
      name,
      rowCount: Math.max(0, range.e.r - range.s.r),
      columnCount: Math.max(0, range.e.c - range.s.c + 1),
    }
  })

  onProgress?.({ phase: 'done' })
  return { kind: 'multi', sheets, build: buildForSheet }
}

export async function parseFile(file: File, onProgress?: (p: ParseProgress) => void): Promise<ParseResult> {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.csv') || lower.endsWith('.tsv') || lower.endsWith('.txt')) {
    return parseCsv(file, onProgress)
  }
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.xlsm')) {
    return parseExcel(file, onProgress)
  }
  throw new Error(`Unsupported file type: ${file.name}`)
}
