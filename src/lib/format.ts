import type { Locale } from '@/i18n'

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatMinutes(ms: number, locale: Locale): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hourLabel = locale === 'it' ? 'h' : 'h'
  return m === 0 ? `${h} ${hourLabel}` : `${h} ${hourLabel} ${m} min`
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatDate(timestamp: number, locale: Locale): string {
  return new Date(timestamp).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDay(timestamp: number, locale: Locale): string {
  return new Date(timestamp).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: '2-digit',
    month: 'short',
  })
}

/** Local calendar day key, used for streaks. */
export function dayKey(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}
