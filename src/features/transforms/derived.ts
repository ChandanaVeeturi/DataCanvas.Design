// NOTE: `expr-eval` has known advisories around evaluating arbitrary user
// expressions. In this app the user supplies their own formulas against their
// own data in their own browser, so the practical risk is contained. If this
// app is ever served in a multi-tenant context, swap to a hardened fork or
// HyperFormula.
import { Parser } from 'expr-eval'
import type { CellValue, Column, ColumnType, DataRow } from '@/lib/types'

const parser = new Parser({
  operators: {
    add: true,
    comparison: true,
    concatenate: true,
    conditional: true,
    divide: true,
    factorial: false,
    logical: true,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,
    assignment: false,
  },
})

/** Built-in helpers in addition to expr-eval's default math/string functions. */
parser.functions.if = (cond: unknown, a: unknown, b: unknown) => (cond ? a : b)
parser.functions.coalesce = (...args: unknown[]) =>
  args.find((a) => a !== null && a !== undefined && a !== '') ?? null
parser.functions.contains = (s: unknown, sub: unknown) =>
  String(s ?? '').includes(String(sub ?? ''))
parser.functions.startsWith = (s: unknown, sub: unknown) =>
  String(s ?? '').startsWith(String(sub ?? ''))
parser.functions.endsWith = (s: unknown, sub: unknown) =>
  String(s ?? '').endsWith(String(sub ?? ''))
parser.functions.upper = (s: unknown) => String(s ?? '').toUpperCase()
parser.functions.lower = (s: unknown) => String(s ?? '').toLowerCase()
parser.functions.trim = (s: unknown) => String(s ?? '').trim()
parser.functions.now = () => Date.now()
parser.functions.year = (d: unknown) => toDate(d)?.getUTCFullYear() ?? null
parser.functions.month = (d: unknown) => toDate(d)?.getUTCMonth()! + 1
parser.functions.day = (d: unknown) => toDate(d)?.getUTCDate() ?? null

function toDate(v: unknown): Date | null {
  if (v instanceof Date) return v
  if (typeof v === 'number') return new Date(v)
  if (typeof v === 'string') {
    const t = Date.parse(v)
    return Number.isFinite(t) ? new Date(t) : null
  }
  return null
}

function variableValue(v: CellValue): unknown {
  if (v instanceof Date) return v.getTime()
  return v
}

export interface CompiledFormula {
  /** Run on a single row, returning a typed CellValue or null. */
  evaluate: (row: DataRow) => CellValue
  /** Variables referenced (by raw identifier). */
  variables: string[]
  /** Inferred output type from a small sample of rows. */
  inferType: (rows: DataRow[]) => ColumnType
}

export interface CompileError {
  message: string
}

export function compileFormula(
  expression: string,
  identifierByName: Record<string, string>,
): { ok: true; compiled: CompiledFormula } | { ok: false; error: CompileError } {
  if (!expression.trim()) {
    return { ok: false, error: { message: 'Formula is empty.' } }
  }
  // Strip a leading `=` if the user types Excel-style.
  const expr = expression.replace(/^=\s*/, '')
  try {
    const parsed = parser.parse(expr)
    const variables = parsed.variables({ withMembers: false })
    // Map friendly identifiers (column names) to actual column ids if needed.
    const aliasMap: Record<string, string> = {}
    for (const v of variables) {
      aliasMap[v] = identifierByName[v] ?? v
    }
    const evaluate = (row: DataRow): CellValue => {
      const scope: Record<string, unknown> = {}
      for (const v of variables) {
        const colId = aliasMap[v]
        scope[v] = variableValue(row[colId] ?? null)
      }
      try {
        const result = (parsed.evaluate as (vars?: Record<string, unknown>) => unknown)(scope)
        if (result === undefined || result === null || (typeof result === 'number' && Number.isNaN(result))) return null
        return result as CellValue
      } catch {
        return null
      }
    }
    const inferType = (sample: DataRow[]): ColumnType => {
      const values = sample.slice(0, 50).map(evaluate)
      if (values.every((v) => v === null || typeof v === 'number')) return 'number'
      if (values.every((v) => v === null || typeof v === 'boolean')) return 'boolean'
      if (values.every((v) => v === null || v instanceof Date)) return 'date'
      return 'string'
    }
    return { ok: true, compiled: { evaluate, variables, inferType } }
  } catch (err) {
    return {
      ok: false,
      error: { message: err instanceof Error ? err.message : 'Invalid formula.' },
    }
  }
}

export function makeIdentifierMap(columns: Column[]): {
  identifierByName: Record<string, string>
  validIdentifier: (name: string) => string
  hintLines: string[]
} {
  // expr-eval identifiers must match /[A-Za-z_][A-Za-z0-9_]*/. We provide a
  // sanitized alias for each column name and accept the raw column id too.
  const identifierByName: Record<string, string> = {}
  const hintLines: string[] = []
  for (const col of columns) {
    const ident = col.name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^([0-9])/, '_$1')
    identifierByName[ident] = col.id
    identifierByName[col.id] = col.id
    hintLines.push(ident === col.name ? col.name : `${ident}  (${col.name})`)
  }
  return {
    identifierByName,
    validIdentifier: (name: string) =>
      name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^([0-9])/, '_$1'),
    hintLines,
  }
}

export function applyDerivedColumn(
  rows: DataRow[],
  columnId: string,
  formula: CompiledFormula,
): DataRow[] {
  return rows.map((r) => ({ ...r, [columnId]: formula.evaluate(r) }))
}
