'use client'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS, PRIMARY, ACCENT } from './chart-colors'

interface ChartPreviewProps {
  chartId: string
  data: Record<string, unknown>[]
  height?: number
  showControls?: boolean
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(var(--foreground))',
}

function BarChartPreview({ data }: { data: Record<string, unknown>[] }) {
  const xKey = Object.keys(data[0] || {})[0]
  const valKeys = Object.keys(data[0] || {}).slice(1)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={45} />
        <Tooltip contentStyle={tooltipStyle} />
        {valKeys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function HorizontalBarPreview({ data }: { data: Record<string, unknown>[] }) {
  const yKey = Object.keys(data[0] || {})[0]
  const valKey = Object.keys(data[0] || {})[1]
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis dataKey={yKey} type="category" width={140} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={valKey} fill={PRIMARY} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function StackedBarPreview({ data }: { data: Record<string, unknown>[] }) {
  const xKey = Object.keys(data[0] || {})[0]
  const valKeys = Object.keys(data[0] || {}).slice(1)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={45} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {valKeys.map((k, i) => (
          <Bar key={k} dataKey={k} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function LineChartPreview({ data }: { data: Record<string, unknown>[] }) {
  const xKey = Object.keys(data[0] || {})[0]
  const valKeys = Object.keys(data[0] || {}).slice(1)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={45} />
        <Tooltip contentStyle={tooltipStyle} />
        {valKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {valKeys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function AreaChartPreview({ data, stacked }: { data: Record<string, unknown>[], stacked?: boolean }) {
  const xKey = Object.keys(data[0] || {})[0]
  const valKeys = Object.keys(data[0] || {}).slice(1)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {valKeys.map((k, i) => (
            <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={45} />
        <Tooltip contentStyle={tooltipStyle} />
        {valKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {valKeys.map((k, i) => (
          <Area
            key={k}
            type="monotone"
            dataKey={k}
            stackId={stacked ? 'a' : undefined}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            fill={`url(#grad-${k})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ScatterPreview({ data }: { data: Record<string, unknown>[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="x" type="number" name="X" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis dataKey="y" type="number" name="Y" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={data as { x: number; y: number }[]} fill={PRIMARY} fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

function BubblePreview({ data }: { data: Record<string, unknown>[] }) {
  const mapped = data.map(d => ({ x: d.gdp as number, y: d.lifeExpectancy as number, z: Math.sqrt((d.population as number) / 10), name: d.country as string }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="x" type="number" name="GDP (T$)" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'GDP (Trillion $)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
        <YAxis dataKey="y" type="number" name="Life Exp." tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={40} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
        <Scatter data={mapped} fill={PRIMARY} fillOpacity={0.65}>
          {mapped.map((entry, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.7} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

function PiePreview({ data, donut }: { data: Record<string, unknown>[], donut?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={donut ? '40%' : 0}
          outerRadius="70%"
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={(entry.color as string) || CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function RadarPreview({ data }: { data: Record<string, unknown>[] }) {
  const valKeys = Object.keys(data[0] || {}).filter(k => k !== 'metric')
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
        <Tooltip contentStyle={tooltipStyle} />
        {valKeys.map((k, i) => (
          <Radar
            key={k}
            name={k}
            dataKey={k}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        ))}
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

function TreemapPreview({ data }: { data: Record<string, unknown>[] }) {
  const CustomContent = ({ x, y, width, height, name, value }: Record<string, unknown>) => {
    const w = width as number
    const h = height as number
    if (w < 40 || h < 30) return null
    return (
      <g>
        <rect x={x as number} y={y as number} width={w} height={h} fill={PRIMARY} fillOpacity={0.7} stroke="hsl(var(--background))" strokeWidth={2} rx={4} />
        {w > 60 && h > 40 && (
          <text x={(x as number) + w / 2} y={(y as number) + h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="white" fontWeight={500}>
            {name as string}
          </text>
        )}
        {w > 60 && h > 55 && (
          <text x={(x as number) + w / 2} y={(y as number) + h / 2 + 16} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="rgba(255,255,255,0.8)">
            {value as number}
          </text>
        )}
      </g>
    )
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap data={data} dataKey="value" aspectRatio={4 / 3} content={<CustomContent />} />
    </ResponsiveContainer>
  )
}

function FunnelPreview({ data }: { data: Record<string, unknown>[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Funnel dataKey="value" data={data} isAnimationActive>
          <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" fontSize={11} dataKey="stage" />
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill as string || CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  )
}

function HistogramPreview({ data }: { data: Record<string, unknown>[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap={1}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="bin" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill={PRIMARY} fillOpacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Custom SVG charts ---

function BoxPlotPreview({ data }: { data: Record<string, unknown>[] }) {
  const groups = data as { group: string; min: number; q1: number; median: number; q3: number; max: number }[]
  const allVals = groups.flatMap(g => [g.min, g.max])
  const domainMin = Math.min(...allVals) - 5
  const domainMax = Math.max(...allVals) + 5
  const range = domainMax - domainMin
  const toY = (v: number, h: number) => h - ((v - domainMin) / range) * (h - 20) - 10
  const w = 320
  const h = 200
  const colW = w / groups.length

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {groups.map((g, i) => {
        const cx = colW * i + colW / 2
        const bw = colW * 0.4
        const yMin = toY(g.min, h)
        const yQ1 = toY(g.q1, h)
        const yMed = toY(g.median, h)
        const yQ3 = toY(g.q3, h)
        const yMax = toY(g.max, h)
        const color = CHART_COLORS[i % CHART_COLORS.length]
        return (
          <g key={g.group}>
            <line x1={cx} y1={yMin} x2={cx} y2={yMax} stroke={color} strokeWidth={1.5} strokeDasharray="3 2" />
            <line x1={cx - bw / 3} y1={yMin} x2={cx + bw / 3} y2={yMin} stroke={color} strokeWidth={2} />
            <line x1={cx - bw / 3} y1={yMax} x2={cx + bw / 3} y2={yMax} stroke={color} strokeWidth={2} />
            <rect x={cx - bw / 2} y={yQ3} width={bw} height={yQ1 - yQ3} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} rx={3} />
            <line x1={cx - bw / 2} y1={yMed} x2={cx + bw / 2} y2={yMed} stroke={color} strokeWidth={2.5} />
            <text x={cx} y={h - 4} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">{g.group}</text>
          </g>
        )
      })}
    </svg>
  )
}

function HeatmapPreview({ data }: { data: Record<string, unknown>[] }) {
  const rows = [...new Set(data.map(d => d.row as string))]
  const cols = [...new Set(data.map(d => d.col as string))]
  const vals = data.map(d => d.value as number)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const cellH = 48
  const cellW = 80
  const totalW = cols.length * cellW + 60
  const totalH = rows.length * cellH + 30

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-full">
      {cols.map((c, ci) => (
        <text key={c} x={60 + ci * cellW + cellW / 2} y={16} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">{c}</text>
      ))}
      {rows.map((r, ri) => (
        <g key={r}>
          <text x={55} y={30 + ri * cellH + cellH / 2} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="hsl(var(--muted-foreground))">{r}</text>
          {cols.map((c, ci) => {
            const cell = data.find(d => d.row === r && d.col === c)
            const v = cell ? cell.value as number : 0
            const t = (v - minV) / (maxV - minV)
            const opacity = 0.15 + t * 0.75
            return (
              <g key={c}>
                <rect x={60 + ci * cellW + 2} y={28 + ri * cellH + 2} width={cellW - 4} height={cellH - 4} rx={4}
                  fill={`hsl(239, 84%, 60%)`} fillOpacity={opacity} />
                <text x={60 + ci * cellW + cellW / 2} y={28 + ri * cellH + cellH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="hsl(var(--foreground))" fontWeight={500}>{v}</text>
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}

function WafflePreview({ data }: { data: Record<string, unknown>[] }) {
  const segments = data as { name: string; percentage: number; color: string }[]
  const grid: string[] = []
  segments.forEach(s => {
    for (let i = 0; i < s.percentage; i++) grid.push(s.color)
  })
  const size = 16

  return (
    <svg viewBox="0 0 180 180" className="w-full h-full max-w-[180px] mx-auto">
      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => {
          const idx = row * 10 + col
          const color = grid[idx] || 'hsl(var(--border))'
          return (
            <rect key={`${row}-${col}`} x={col * (size + 2) + 4} y={row * (size + 2) + 4} width={size} height={size} rx={2} fill={color} />
          )
        })
      )}
    </svg>
  )
}

function LollipopPreview({ data }: { data: Record<string, unknown>[] }) {
  const sorted = [...data].sort((a, b) => (b.score as number) - (a.score as number))
  const maxV = Math.max(...sorted.map(d => d.score as number))
  const h = 200
  const rowH = h / sorted.length
  const barMaxW = 220

  return (
    <svg viewBox={`0 0 300 ${h + 20}`} className="w-full h-full">
      {sorted.map((d, i) => {
        const pct = (d.score as number) / maxV
        const y = i * rowH + rowH / 2 + 10
        const barW = pct * barMaxW
        return (
          <g key={String(d.country)}>
            <text x={72} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="hsl(var(--muted-foreground))">{String(d.country)}</text>
            <line x1={76} y1={y} x2={76 + barW} y2={y} stroke={PRIMARY} strokeWidth={2} />
            <circle cx={76 + barW} cy={y} r={5} fill={PRIMARY} />
            <text x={84 + barW} y={y} dominantBaseline="middle" fontSize={10} fill="hsl(var(--foreground))" fontWeight={500}>{Number(d.score).toFixed(1)}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SlopePreview({ data }: { data: Record<string, unknown>[] }) {
  const keys = Object.keys(data[0] || {}).filter(k => k !== 'category')
  const allVals = data.flatMap(d => keys.map(k => d[k] as number))
  const minV = Math.min(...allVals) - 5
  const maxV = Math.max(...allVals) + 5
  const range = maxV - minV
  const w = 280, h = 200
  const x1 = 60, x2 = 220
  const toY = (v: number) => 20 + (1 - (v - minV) / range) * (h - 40)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <text x={x1} y={12} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))" fontWeight={600}>{keys[0]}</text>
      <text x={x2} y={12} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))" fontWeight={600}>{keys[1]}</text>
      {data.map((d, i) => {
        const y1 = toY(d[keys[0]] as number)
        const y2 = toY(d[keys[1]] as number)
        const color = CHART_COLORS[i % CHART_COLORS.length]
        return (
          <g key={String(d.category)}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} />
            <circle cx={x1} cy={y1} r={4} fill={color} />
            <circle cx={x2} cy={y2} r={4} fill={color} />
            <text x={x1 - 6} y={y1} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={color}>{String(d.category)}</text>
            <text x={x2 + 6} y={y2} dominantBaseline="middle" fontSize={10} fill={color}>{d[keys[1]] as number}%</text>
          </g>
        )
      })}
    </svg>
  )
}

function SankeyPreview({ data }: { data: Record<string, unknown>[] }) {
  const flows = data as { source: string; target: string; value: number }[]
  const nodes = [...new Set(flows.flatMap(f => [f.source, f.target]))]
  const w = 320, h = 200
  const totalVal = flows.filter(f => f.source === 'Visitors').reduce((s, f) => s + f.value, 0)

  const nodeX: Record<string, number> = { 'Visitors': 20, 'Sign Up': 110, 'Bounce': 110, 'Trial': 200, 'Dropped': 200, 'Paid': 290, 'Churned': 290 }
  const nodeY: Record<string, number> = { 'Visitors': 80, 'Sign Up': 40, 'Bounce': 130, 'Trial': 20, 'Dropped': 100, 'Paid': 10, 'Churned': 80 }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {flows.map((f, i) => {
        const x1 = nodeX[f.source] + 18
        const y1 = nodeY[f.source] + 15
        const x2 = nodeX[f.target]
        const y2 = nodeY[f.target] + 15
        const width = Math.max(2, (f.value / totalVal) * 30)
        return (
          <path key={i}
            d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
            stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={width} fill="none" strokeOpacity={0.5}
          />
        )
      })}
      {nodes.map(n => (
        <g key={n}>
          <rect x={nodeX[n] || 0} y={(nodeY[n] || 0)} width={18} height={30} rx={3} fill={PRIMARY} fillOpacity={0.85} />
          <text x={(nodeX[n] || 0) + 9} y={(nodeY[n] || 0) + 42} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))">{n}</text>
        </g>
      ))}
    </svg>
  )
}

const CHART_RENDERERS: Record<string, (data: Record<string, unknown>[]) => React.ReactElement> = {
  'bar-chart': (d) => <BarChartPreview data={d} />,
  'grouped-bar': (d) => <BarChartPreview data={d} />,
  'horizontal-bar': (d) => <HorizontalBarPreview data={d} />,
  'radar-chart': (d) => <RadarPreview data={d} />,
  'lollipop-chart': (d) => <LollipopPreview data={d} />,
  'bullet-chart': (d) => <BarChartPreview data={d.map(r => ({ metric: r.metric, actual: r.actual, target: r.target }))} />,
  'line-chart': (d) => <LineChartPreview data={d} />,
  'area-chart': (d) => <AreaChartPreview data={d} />,
  'multi-line': (d) => <LineChartPreview data={d} />,
  'stacked-area': (d) => <AreaChartPreview data={d} stacked />,
  'slope-chart': (d) => <SlopePreview data={d} />,
  'histogram': (d) => <HistogramPreview data={d} />,
  'box-plot': (d) => <BoxPlotPreview data={d} />,
  'violin-plot': (d) => <BoxPlotPreview data={d.map(g => ({ group: (g as { group: string; values: number[] }).group, min: Math.min(...(g as { group: string; values: number[] }).values), q1: (g as { group: string; values: number[] }).values[Math.floor((g as { group: string; values: number[] }).values.length * 0.25)], median: (g as { group: string; values: number[] }).values[Math.floor((g as { group: string; values: number[] }).values.length * 0.5)], q3: (g as { group: string; values: number[] }).values[Math.floor((g as { group: string; values: number[] }).values.length * 0.75)], max: Math.max(...(g as { group: string; values: number[] }).values) }))} />,
  'dot-plot': (d) => <ScatterPreview data={d.map(r => ({ x: String(r.group).charCodeAt(0) - 64, y: r.value }))} />,
  'scatter-plot': (d) => <ScatterPreview data={d} />,
  'bubble-chart': (d) => <BubblePreview data={d} />,
  'heatmap': (d) => <HeatmapPreview data={d} />,
  'correlation-matrix': (d) => <HeatmapPreview data={d.map(r => ({ row: r.var1, col: r.var2, value: Math.round((r.correlation as number) * 100) }))} />,
  'pie-chart': (d) => <PiePreview data={d} />,
  'donut-chart': (d) => <PiePreview data={d} donut />,
  'stacked-bar': (d) => <StackedBarPreview data={d} />,
  'treemap': (d) => <TreemapPreview data={d} />,
  'waffle-chart': (d) => <WafflePreview data={d} />,
  'sankey-diagram': (d) => <SankeyPreview data={d} />,
  'funnel-chart': (d) => <FunnelPreview data={d} />,
  'alluvial-diagram': (d) => <SankeyPreview data={d} />,
  'tree-diagram': (_d) => (
    <svg viewBox="0 0 280 180" className="w-full h-full">
      <line x1={140} y1={30} x2={70} y2={80} stroke="hsl(var(--border))" strokeWidth={1.5} />
      <line x1={140} y1={30} x2={140} y2={80} stroke="hsl(var(--border))" strokeWidth={1.5} />
      <line x1={140} y1={30} x2={210} y2={80} stroke="hsl(var(--border))" strokeWidth={1.5} />
      <line x1={70} y1={80} x2={40} y2={140} stroke="hsl(var(--border))" strokeWidth={1.5} />
      <line x1={70} y1={80} x2={100} y2={140} stroke="hsl(var(--border))" strokeWidth={1.5} />
      <line x1={210} y1={80} x2={180} y2={140} stroke="hsl(var(--border))" strokeWidth={1.5} />
      <line x1={210} y1={80} x2={240} y2={140} stroke="hsl(var(--border))" strokeWidth={1.5} />
      {[[140,30,'CEO'],[70,80,'CTO'],[140,80,'CFO'],[210,80,'CMO'],[40,140,'Eng'],[100,140,'Prod'],[180,140,'Fin'],[240,140,'Mkt']].map(([x,y,l]) => (
        <g key={String(l)}>
          <circle cx={Number(x)} cy={Number(y)} r={20} fill={PRIMARY} fillOpacity={0.15} stroke={PRIMARY} strokeWidth={1.5} />
          <text x={Number(x)} y={Number(y)} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="hsl(var(--foreground))" fontWeight={600}>{String(l)}</text>
        </g>
      ))}
    </svg>
  ),
  'sunburst': (_d) => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <circle cx={100} cy={100} r={30} fill={PRIMARY} fillOpacity={0.9} />
      <text x={100} y={100} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white" fontWeight={600}>Root</text>
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + Math.cos(rad) * 32, y1 = 100 + Math.sin(rad) * 32
        const x2 = 100 + Math.cos(rad) * 65, y2 = 100 + Math.sin(rad) * 65
        return <g key={angle}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--border))" strokeWidth={1} />
          <path d={`M ${100 + Math.cos((angle - 40) * Math.PI / 180) * 68} ${100 + Math.sin((angle - 40) * Math.PI / 180) * 68} A 68 68 0 0 1 ${100 + Math.cos((angle + 40) * Math.PI / 180) * 68} ${100 + Math.sin((angle + 40) * Math.PI / 180) * 68}`}
            stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={18} fill="none" strokeOpacity={0.6} />
        </g>
      })}
    </svg>
  ),
  'icicle-chart': (_d) => (
    <svg viewBox="0 0 300 180" className="w-full h-full">
      <rect x={10} y={10} width={280} height={35} rx={4} fill={PRIMARY} fillOpacity={0.85} />
      <text x={150} y={30} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="white" fontWeight={600}>Root</text>
      <rect x={10} y={55} width={170} height={35} rx={4} fill={CHART_COLORS[1]} fillOpacity={0.75} />
      <text x={95} y={73} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="white">Branch A (60%)</text>
      <rect x={188} y={55} width={102} height={35} rx={4} fill={CHART_COLORS[2]} fillOpacity={0.75} />
      <text x={239} y={73} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="white">Branch B (40%)</text>
      <rect x={10} y={100} width={98} height={35} rx={4} fill={CHART_COLORS[3]} fillOpacity={0.65} />
      <text x={59} y={118} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white">Leaf A1</text>
      <rect x={116} y={100} width={64} height={35} rx={4} fill={CHART_COLORS[4]} fillOpacity={0.65} />
      <text x={148} y={118} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white">Leaf A2</text>
      <rect x={188} y={100} width={60} height={35} rx={4} fill={CHART_COLORS[5]} fillOpacity={0.65} />
      <text x={218} y={118} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white">Leaf B1</text>
      <rect x={254} y={100} width={36} height={35} rx={4} fill={CHART_COLORS[6]} fillOpacity={0.65} />
      <text x={272} y={118} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="white">B2</text>
    </svg>
  ),
}

export function ChartPreview({ chartId, data, height = 280 }: ChartPreviewProps) {
  const renderer = CHART_RENDERERS[chartId]
  if (!renderer || !data?.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No preview available
      </div>
    )
  }
  return (
    <div style={{ height }}>
      {renderer(data)}
    </div>
  )
}
