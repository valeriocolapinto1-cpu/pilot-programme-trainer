import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { MODULES, getModule } from '@/modules/registry'
import { exportData, parseImport, statsForModule, useProgress } from '@/store/progressStore'
import { Icon } from '@/components/Icon'
import { EmptyState, Meter, PageHeader, SectionHeader, Trend } from '@/components/ui'
import { formatDate, formatPercent } from '@/lib/format'

export function ProgressPage() {
  const { t, b, locale } = useI18n()
  const attempts = useProgress((s) => s.attempts)
  const replaceAll = useProgress((s) => s.replaceAll)
  const resetAll = useProgress((s) => s.resetAll)
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const doExport = useCallback(() => {
    const data = exportData(useProgress.getState())
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pathway-trainer-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const doImport = useCallback(
    async (file: File) => {
      const parsed = parseImport(await file.text())
      if (!parsed) {
        setMessage(t('progress.importFail'))
        return
      }
      replaceAll(parsed)
      setMessage(t('progress.importOk'))
    },
    [replaceAll, t],
  )

  const doReset = useCallback(() => {
    if (window.confirm(t('progress.resetConfirm'))) resetAll()
  }, [resetAll, t])

  const attempted = MODULES.map((module) => ({
    module,
    stats: statsForModule(attempts, module.id),
  })).filter((entry) => entry.stats.attempts > 0)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('progress.title')} lede={t('progress.subtitle')} />

      <section>
        <SectionHeader>{t('progress.byModule')}</SectionHeader>
        {attempted.length === 0 ? (
          <EmptyState>{t('progress.empty')}</EmptyState>
        ) : (
          <ul className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
            {attempted.map(({ module, stats }) => (
              <li key={module.id} style={{ borderColor: 'var(--line)' }}>
                <Link
                  to={`/modules/${module.id}`}
                  className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
                >
                  <Icon name={module.icon} size={18} style={{ color: 'var(--text-3)' }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[0.9375rem] font-medium">{b(module.title)}</span>
                      <span className="muted-more text-xs">
                        <span className="mono">{stats.attempts}</span>{' '}
                        {t('common.attempts').toLowerCase()} · {t('common.best')}{' '}
                        <span className="mono">{formatPercent(stats.best ?? 0)}</span>
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Meter value={stats.average ?? 0} height={3} />
                    </div>
                  </div>
                  <Trend values={stats.trend} />
                  <span className="mono w-11 text-right text-[0.9375rem]">
                    {formatPercent(stats.average ?? 0)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {attempts.length > 0 ? (
        <section>
          <SectionHeader>{t('progress.history')}</SectionHeader>
          <ul className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
            {attempts.slice(0, 25).map((attempt) => {
              const module = getModule(attempt.moduleId)
              return (
                <li
                  key={attempt.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-[0.875rem]"
                  style={{ borderColor: 'var(--line)' }}
                >
                  {module ? (
                    <Icon name={module.icon} size={16} style={{ color: 'var(--text-3)' }} />
                  ) : null}
                  <span className="flex-1 truncate">
                    {module ? b(module.title) : attempt.moduleId}
                  </span>
                  {attempt.mode === 'exam' ? (
                    <span className="muted-more text-xs">{t('nav.exam')}</span>
                  ) : null}
                  <span className="muted-more hidden text-xs sm:inline">
                    {formatDate(attempt.at, locale)}
                  </span>
                  <span className="mono w-11 text-right">
                    {formatPercent(attempt.score.percent)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <SectionHeader>{t('settings.data')}</SectionHeader>
        {message ? <p className="muted mb-2 text-sm">{message}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn flex-1" onClick={doExport}>
            <Icon name="download" size={16} />
            {t('progress.export')}
          </button>
          <button type="button" className="btn flex-1" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={16} />
            {t('progress.import')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void doImport(file)
              e.target.value = ''
            }}
          />
          <button type="button" className="btn btn-danger flex-1" onClick={doReset}>
            <Icon name="trash" size={16} />
            {t('progress.resetAll')}
          </button>
        </div>
      </section>
    </div>
  )
}
