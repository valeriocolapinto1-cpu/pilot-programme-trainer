import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { CHECKLIST, STUDY_PLAN } from '@/data/studyPlan'
import { getModule } from '@/modules/registry'
import { statsForModule, useProgress } from '@/store/progressStore'
import { Icon } from '@/components/Icon'
import { PageHeader, SectionHeader } from '@/components/ui'
import { formatPercent } from '@/lib/format'

export function PlanPage() {
  const { t, b } = useI18n()
  const checklist = useProgress((s) => s.checklist)
  const toggleChecklist = useProgress((s) => s.toggleChecklist)
  const attempts = useProgress((s) => s.attempts)

  const doneCount = CHECKLIST.filter((item) => checklist[item.id]).length

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('plan.title')} lede={t('plan.subtitle')} />

      <section>
        <SectionHeader
          action={
            <span className="mono muted-more">
              {doneCount}/{CHECKLIST.length}
            </span>
          }
        >
          {t('plan.checklist')}
        </SectionHeader>

        <ul className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
          {CHECKLIST.map((item) => {
            const done = !!checklist[item.id]
            return (
              <li key={item.id} style={{ borderColor: 'var(--line)' }}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)]"
                  onClick={() => toggleChecklist(item.id)}
                  aria-pressed={done}
                >
                  <span
                    className="mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded border transition-colors"
                    style={{
                      borderColor: done ? 'var(--pos)' : 'var(--line-strong)',
                      background: done ? 'var(--pos)' : 'transparent',
                      color: 'var(--bg)',
                    }}
                    aria-hidden
                  >
                    {done ? <Icon name="check" size={12} strokeWidth={2.6} /> : null}
                  </span>
                  <div className="min-w-0">
                    <span
                      className="text-[0.9375rem] font-medium"
                      style={done ? { color: 'var(--text-3)' } : undefined}
                    >
                      {b(item.label)}
                    </span>
                    <p className="muted mt-1 text-[0.8125rem] leading-relaxed">
                      {b(item.detail)}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <SectionHeader>{t('plan.title')}</SectionHeader>
        <ol className="flex flex-col gap-3">
          {STUDY_PLAN.map((week) => (
            <li key={week.week} className="surface p-4 sm:p-5">
              <div className="mb-1.5 flex items-baseline gap-3">
                <span className="eyebrow flex-none">
                  {t('plan.week')} {week.week}
                </span>
                <h3 className="font-medium">{b(week.focus)}</h3>
              </div>
              <p className="muted text-[0.875rem] leading-relaxed">{b(week.detail)}</p>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {week.modules.map((moduleId) => {
                  const module = getModule(moduleId)
                  if (!module) return null
                  const stats = statsForModule(attempts, moduleId)
                  return (
                    <Link
                      key={moduleId}
                      to={`/modules/${moduleId}`}
                      className="tag transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                    >
                      <Icon name={module.icon} size={13} />
                      {b(module.title)}
                      {stats.average != null ? (
                        <span className="mono muted-more">{formatPercent(stats.average)}</span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
