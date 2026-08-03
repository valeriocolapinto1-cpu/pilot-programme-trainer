import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { MODULES } from '@/modules/registry'
import { statsForModule, useProgress } from '@/store/progressStore'
import { Icon } from '@/components/Icon'
import { Meter, PageHeader, Trend } from '@/components/ui'
import { formatPercent } from '@/lib/format'
import type { SelectionPhase } from '@/modules/types'

const PHASES: SelectionPhase[] = [1, 2, 3, 4]

export function ModulesPage() {
  const { t, b } = useI18n()
  const attempts = useProgress((s) => s.attempts)
  const [phase, setPhase] = useState<SelectionPhase | 'all'>('all')

  const visible = useMemo(
    () => (phase === 'all' ? MODULES : MODULES.filter((m) => m.phase === phase)),
    [phase],
  )

  return (
    <div>
      <PageHeader title={t('modules.title')} lede={t('modules.subtitle')} />

      <div
        className="mb-5 flex flex-wrap gap-1 border-b pb-3"
        style={{ borderColor: 'var(--line)' }}
      >
        {(['all', ...PHASES] as const).map((value) => {
          const active = phase === value
          return (
            <button
              key={value}
              type="button"
              className="rounded-md px-2.5 py-1.5 text-[0.8125rem] transition-colors"
              style={{
                color: active ? 'var(--text)' : 'var(--text-2)',
                background: active ? 'var(--surface-2)' : 'transparent',
                fontWeight: active ? 600 : 400,
              }}
              onClick={() => setPhase(value)}
            >
              {value === 'all' ? t('modules.filterAll') : t(`phase.${value}`)}
            </button>
          )
        })}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {visible.map((module) => {
          const stats = statsForModule(attempts, module.id)
          return (
            <li key={module.id}>
              <Link
                to={`/modules/${module.id}`}
                className="surface flex h-full flex-col gap-3 p-4 transition-colors hover:border-[var(--line-strong)]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="surface-2 flex h-9 w-9 flex-none items-center justify-center"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <Icon name={module.icon} size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{b(module.title)}</h3>
                    <p className="muted mt-0.5 text-[0.8125rem] leading-snug">
                      {b(module.blurb)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-1">
                  <span className="muted-more text-xs">{t(`phase.${module.phase}`)}</span>
                  {module.sourceTier === 'official' ? (
                    <span
                      className="muted-more text-xs"
                      title={t('source.officialHint')}
                    >
                      · {t('source.official')}
                    </span>
                  ) : null}
                </div>

                {stats.attempts > 0 ? (
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <div className="mb-1.5 flex items-baseline justify-between text-xs">
                        <span className="muted-more">
                          {t('modules.lastScore')}{' '}
                          <span className="mono" style={{ color: 'var(--text)' }}>
                            {formatPercent(stats.last ?? 0)}
                          </span>
                        </span>
                        <span className="muted-more">
                          {t('modules.bestScore')}{' '}
                          <span className="mono">{formatPercent(stats.best ?? 0)}</span>
                        </span>
                      </div>
                      <Meter value={stats.last ?? 0} />
                    </div>
                    <Trend values={stats.trend} />
                  </div>
                ) : (
                  <p className="muted-more text-xs">{t('common.notStarted')}</p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
