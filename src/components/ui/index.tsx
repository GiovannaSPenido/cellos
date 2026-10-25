import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ Card -- */

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgba(33,30,26,0.05)] ${className}`}
    >
      {children}
    </div>
  )
}

/* ----------------------------------------------------------------- Badge -- */

export type BadgeTone = 'neutral' | 'brand' | 'teal' | 'positive' | 'caution' | 'critical'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-muted',
  brand: 'bg-brand-50 text-brand-700',
  teal: 'bg-teal-50 text-teal-600',
  positive: 'bg-positive-50 text-positive',
  caution: 'bg-caution-50 text-[#8a6410]',
  critical: 'bg-critical-50 text-critical',
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
}: {
  children: ReactNode
  tone?: BadgeTone
  dot?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${BADGE_TONES[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------- Avatar -- */

/** Initials from a name; deterministic colour so the same person always matches. */
export function Avatar({
  name,
  size = 38,
  tone,
}: {
  name: string
  size?: number
  tone?: 'brand' | 'teal'
}) {
  const parts = name.replace(/[^\wÀ-ÿ ]/g, '').trim().split(/\s+/)
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
  const resolved = tone ?? ((name.charCodeAt(0) || 0) % 2 === 0 ? 'brand' : 'teal')

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight ${
        resolved === 'brand' ? 'bg-brand-50 text-brand-700' : 'bg-teal-50 text-teal-600'
      }`}
    >
      {initials}
    </span>
  )
}

/* ------------------------------------------------------------------ Stat -- */

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = 'teal',
}: {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  tone?: 'brand' | 'teal'
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        {icon && (
          <span
            className={`grid h-8 w-8 place-items-center rounded-sm ${
              tone === 'brand' ? 'bg-brand-50 text-brand-700' : 'bg-teal-50 text-teal-600'
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <span className="tabular text-[30px] font-extrabold leading-none tracking-tight">
        {value}
      </span>
      {sub && <span className="text-[12.5px] text-muted">{sub}</span>}
    </Card>
  )
}

/* ------------------------------------------------------------ ProgressBar -- */

export function ProgressBar({
  percent,
  color = 'var(--color-teal)',
  height = 8,
}: {
  percent: number
  color?: string
  height?: number
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-surface-2"
      style={{ height }}
      role="presentation"
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: color }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- Funnel -- */

export interface FunnelStage {
  id: string
  label: string
  count: number
  color: string
}

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1)

  return (
    <div className="flex flex-col gap-3.5">
      {stages.map((stage) => (
        <div key={stage.id} className="flex items-center gap-3.5">
          <span className="w-[112px] shrink-0 text-[13px] font-semibold text-ink-2">
            {stage.label}
          </span>
          <div className="flex-1">
            <ProgressBar percent={(stage.count / max) * 100} color={stage.color} height={10} />
          </div>
          <span className="tabular w-7 text-right text-[13px] font-semibold">{stage.count}</span>
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- Donut -- */

export function Donut({
  value,
  total,
  label,
  size = 130,
  color = 'var(--color-teal)',
}: {
  value: number
  total: number
  label?: string
  size?: number
  color?: string
}) {
  const fraction = total > 0 ? value / total : 0
  const radius = size / 2 - 9
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${Math.round(fraction * 100)}%`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth="9"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-[22px] font-extrabold tracking-tight">
          {Math.round(fraction * 100)}%
        </span>
        {label && <span className="text-[10.5px] text-muted">{label}</span>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ EmptyState -- */

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
      <p className="text-[14.5px] font-semibold text-ink-2">{title}</p>
      {hint && <p className="text-[13px] text-muted">{hint}</p>}
    </div>
  )
}
