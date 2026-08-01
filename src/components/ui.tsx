import type { ReactNode } from 'react'
import { formatPercent } from '@/lib/format'

/** Score bands drive every colour decision in the UI. Nothing else does. */
export function scoreTone(value: number): string {
  if (value >= 75) return 'var(--pos)'
  if (value >= 50) return 'var(--warn)'
  return 'var(--neg)'
}

export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return <Tag className={`surface p-4 sm:p-5 ${className}`}>{children}</Tag>
}

/** Page header: title, optional lede, optional trailing action. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow?: string
  title: string
  lede?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {lede ? <p className="muted mt-1.5 max-w-2xl text-[0.9375rem]">{lede}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function SectionHeader({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="eyebrow">{children}</h2>
      {action ? <div className="text-[0.8125rem]">{action}</div> : null}
    </div>
  )
}

/** Thin measure bar. `tone="neutral"` for progress that is not a score. */
export function Meter({
  value,
  tone = 'score',
  height = 4,
}: {
  value: number
  tone?: 'score' | 'neutral'
  height?: number
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ background: 'var(--surface-3)', height }}
      role="presentation"
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${pct}%`,
          background: tone === 'neutral' ? 'var(--accent)' : scoreTone(pct),
        }}
      />
    </div>
  )
}

export function ScoreDial({ value, size = 104 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, value))
  const stroke = Math.max(4, size / 16)
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={formatPercent(pct)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--surface-3)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={scoreTone(pct)}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        fontSize={size / 3.4}
        fontWeight={600}
        letterSpacing="-0.03em"
      >
        {Math.round(pct)}
      </text>
    </svg>
  )
}

/** Compact score history line. */
export function Trend({
  values,
  width = 76,
  height = 22,
}: {
  values: number[]
  width?: number
  height?: number
}) {
  if (values.length < 2) {
    return <div style={{ width, height }} aria-hidden />
  }

  const pad = 2
  const step = (width - pad * 2) / (values.length - 1)
  const y = (v: number) => pad + (height - pad * 2) * (1 - Math.max(0, Math.min(100, v)) / 100)
  const points = values.map((v, i) => `${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={pad + (values.length - 1) * step}
        cy={y(values[values.length - 1])}
        r="2.2"
        fill={scoreTone(values[values.length - 1])}
      />
    </svg>
  )
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="surface px-4 py-3">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 text-[1.55rem] leading-none font-semibold tracking-tight">{value}</div>
      {hint ? <div className="muted-more mt-1 text-xs">{hint}</div> : null}
    </div>
  )
}

export function Tag({
  children,
  tone,
  title,
}: {
  children: ReactNode
  tone?: 'accent'
  title?: string
}) {
  return (
    <span className={tone === 'accent' ? 'tag tag-accent' : 'tag'} title={title}>
      {children}
    </span>
  )
}

/** Countdown bar; goes red in the final fifth. */
export function TimerBar({ fraction, label }: { fraction: number; label?: string }) {
  const urgent = fraction < 0.2
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-[3px] flex-1 overflow-hidden rounded-full"
        style={{ background: 'var(--surface-3)' }}
      >
        <div
          className="h-full"
          style={{
            width: `${Math.max(0, Math.min(1, fraction)) * 100}%`,
            background: urgent ? 'var(--neg)' : 'var(--line-strong)',
            transition: 'width 100ms linear',
          }}
        />
      </div>
      {label ? (
        <span
          className="mono w-11 text-right text-[0.8125rem]"
          style={{ color: urgent ? 'var(--neg)' : 'var(--text-3)' }}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="surface px-4 py-8 text-center">
      <p className="muted-more text-sm">{children}</p>
    </div>
  )
}
