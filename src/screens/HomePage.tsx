import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import {
  currentStreak,
  overallAverage,
  useProgress,
  weakestModules,
} from '@/store/progressStore'
import { PRO_EXAM_DURATION_MS, SCORED_MODULE_IDS, getModule } from '@/modules/registry'
import { Icon } from '@/components/Icon'
import { EmptyState, Meter, SectionHeader, Stat } from '@/components/ui'
import { formatDate, formatMinutes, formatPercent } from '@/lib/format'

export function HomePage() {
  const { t, b, locale } = useI18n()
  const attempts = useProgress((s) => s.attempts)

  const average = overallAverage(attempts)
  const streak = currentStreak(attempts)
  const weakest = weakestModules(attempts, SCORED_MODULE_IDS, 3)
  const recent = attempts.slice(0, 6)

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="eyebrow mb-2">{t('app.subtitle')}</p>
        <h1 className="max-w-2xl text-[1.9rem] sm:text-[2.3rem]">{t('home.hero.title')}</h1>
        <p className="muted mt-3 max-w-xl">{t('home.hero.body')}</p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link to="/exam" className="btn btn-primary btn-lg">
            {t('home.cta.exam')}
            <span className="mono text-xs opacity-70">
              {formatMinutes(PRO_EXAM_DURATION_MS, locale)}
            </span>
          </Link>
          <Link to="/modules" className="btn btn-lg">
            {t('home.cta.browse')}
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat label={t('home.avgScore')} value={average == null ? '—' : formatPercent(average)} />
        <Stat label={t('home.totalSessions')} value={attempts.length} />
        <Stat label={t('home.streak')} value={streak} />
      </section>

      <section>
        <SectionHeader
          action={
            <Link to="/modules" style={{ color: 'var(--accent)' }}>
              {t('home.cta.browse')}
            </Link>
          }
        >
          {t('home.weakest')}
        </SectionHeader>

        {attempts.length === 0 ? (
          <EmptyState>{t('home.weakestEmpty')}</EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {weakest.map(({ moduleId, average: moduleAverage }) => {
              const module = getModule(moduleId)
              if (!module) return null
              return (
                <li key={moduleId}>
                  <Link
                    to={`/modules/${moduleId}`}
                    className="surface flex h-full flex-col gap-3 p-4 transition-colors hover:border-[var(--line-strong)]"
                  >
                    <Icon name={module.icon} size={20} style={{ color: 'var(--text-3)' }} />
                    <span className="font-medium">{b(module.title)}</span>
                    <div className="mt-auto">
                      {moduleAverage == null ? (
                        <span className="muted-more text-xs">{t('common.notStarted')}</span>
                      ) : (
                        <>
                          <div className="mb-1.5 flex items-baseline justify-between">
                            <span className="muted-more text-xs">{t('common.average')}</span>
                            <span className="mono text-[0.8125rem]">
                              {formatPercent(moduleAverage)}
                            </span>
                          </div>
                          <Meter value={moduleAverage} />
                        </>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {recent.length > 0 ? (
        <section>
          <SectionHeader
            action={
              <Link to="/progress" style={{ color: 'var(--accent)' }}>
                {t('nav.progress')}
              </Link>
            }
          >
            {t('home.recent')}
          </SectionHeader>

          <ul className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
            {recent.map((attempt) => {
              const module = getModule(attempt.moduleId)
              return (
                <li
                  key={attempt.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderColor: 'var(--line)' }}
                >
                  {module ? (
                    <Icon name={module.icon} size={17} style={{ color: 'var(--text-3)' }} />
                  ) : null}
                  <span className="flex-1 truncate text-[0.9375rem]">
                    {module ? b(module.title) : attempt.moduleId}
                  </span>
                  <span className="muted-more hidden text-xs sm:inline">
                    {formatDate(attempt.at, locale)}
                  </span>
                  <span className="mono w-11 text-right text-[0.875rem]">
                    {formatPercent(attempt.score.percent)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
