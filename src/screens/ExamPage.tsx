import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { Card, Meter, PageHeader, ScoreDial, SectionHeader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { formatDate, formatMinutes, formatPercent } from '@/lib/format'
import { randomSeed } from '@/lib/rng'
import {
  PRACTICE_DURATION_MS,
  PRACTICE_MODULES,
  PRO_EXAM_DURATION_MS,
  PRO_EXAM_MODULES,
  getModule,
} from '@/modules/registry'
import { useExam, type ExamKind } from '@/store/examStore'
import { useProgress } from '@/store/progressStore'

export function ExamPage() {
  const { t, b, locale } = useI18n()
  const navigate = useNavigate()
  const session = useExam((s) => s.session)
  const startExam = useExam((s) => s.start)
  const clearExam = useExam((s) => s.clear)
  const exams = useProgress((s) => s.exams)

  const begin = useCallback(
    (kind: ExamKind) => {
      const modules = kind === 'full' ? PRO_EXAM_MODULES : PRACTICE_MODULES
      startExam({
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        startedAt: Date.now(),
        moduleIds: modules.map((m) => m.id),
        seeds: modules.map(() => randomSeed()),
        index: 0,
        scores: {},
        breakTaken: false,
      })
      navigate('/exam/run')
    },
    [navigate, startExam],
  )

  const abandon = useCallback(() => {
    if (window.confirm(t('exam.abandonConfirm'))) clearExam()
  }, [clearExam, t])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('exam.title')} lede={t('exam.subtitle')} />

      {session ? (
        <Card className="border-[var(--accent-line)]">
          <SectionHeader>{t('exam.inProgress')}</SectionHeader>
          <p className="muted mb-4 text-sm">
            <span className="mono">
              {session.index}/{session.moduleIds.length}
            </span>{' '}
            · {formatDate(session.startedAt, locale)}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/exam/run" className="btn btn-primary flex-1 justify-center">
              {t('exam.resume')}
            </Link>
            <button type="button" className="btn btn-danger flex-1" onClick={abandon}>
              {t('exam.abandon')}
            </button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <SectionHeader>{t('exam.title')}</SectionHeader>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              {formatMinutes(PRO_EXAM_DURATION_MS, locale)}
            </span>
            <span className="muted-more text-sm">
              {PRO_EXAM_MODULES.length} {t('exam.moduleCount')}
            </span>
          </div>

          <ol className="mb-5 flex flex-col gap-1.5">
            {PRO_EXAM_MODULES.map((module, i) => (
              <li key={module.id} className="flex items-center gap-2.5 text-[0.8125rem]">
                <span className="mono muted-more w-5 flex-none text-right text-xs">{i + 1}</span>
                <Icon name={module.icon} size={15} style={{ color: 'var(--text-3)' }} />
                <span className="flex-1 truncate">{b(module.title)}</span>
                <span className="mono muted-more text-xs">
                  {Math.round(module.examDurationMs / 60000)}′
                </span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            className="btn btn-primary mt-auto"
            onClick={() => begin('full')}
            disabled={!!session}
          >
            {t('exam.startFull')}
          </button>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col">
            <SectionHeader>{t('exam.practiceTitle')}</SectionHeader>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {formatMinutes(PRACTICE_DURATION_MS, locale)}
              </span>
              <span className="muted-more text-sm">
                {PRACTICE_MODULES.length} {t('exam.moduleCount')}
              </span>
            </div>
            <p className="muted mb-4 text-sm">{t('exam.practiceSubtitle')}</p>
            <button
              type="button"
              className="btn mt-auto"
              onClick={() => begin('practice')}
              disabled={!!session}
            >
              {t('exam.startPractice')}
            </button>
          </Card>

          <Card>
            <SectionHeader>{t('exam.rules.title')}</SectionHeader>
            <ul className="flex flex-col gap-2 text-[0.875rem] leading-relaxed">
              {(['exam.rules.1', 'exam.rules.2', 'exam.rules.3', 'exam.rules.4'] as const).map(
                (key, i) => (
                  <li key={key} className="flex gap-2.5">
                    <span className="mono muted-more mt-0.5 flex-none text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{t(key)}</span>
                  </li>
                ),
              )}
            </ul>
          </Card>
        </div>
      </div>

      {exams.length > 0 ? (
        <section>
          <SectionHeader>{t('progress.history')}</SectionHeader>
          <ul className="flex flex-col gap-3">
            {exams.slice(0, 5).map((run) => {
              const scores = Object.values(run.scores)
              const average =
                scores.length > 0
                  ? scores.reduce((s, v) => s + (v?.percent ?? 0), 0) / scores.length
                  : 0
              return (
                <li key={run.id} className="surface flex items-center gap-5 p-4">
                  <ScoreDial value={average} size={62} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {run.kind === 'full' ? t('exam.title') : t('exam.practiceTitle')}
                      </span>
                      <span className="muted-more text-xs">{formatDate(run.at, locale)}</span>
                    </div>
                    <p className="muted-more mb-2 text-xs">
                      <span className="mono">
                        {Object.keys(run.scores).length}/{run.moduleIds.length}
                      </span>{' '}
                      {t('exam.moduleCount')}
                      {run.completed ? '' : ` · ${t('runner.aborted')}`}
                    </p>
                    <div className="flex flex-col gap-1">
                      {run.moduleIds.slice(0, 5).map((id) => {
                        const module = getModule(id)
                        const score = run.scores[id]
                        if (!module || !score) return null
                        return (
                          <div key={id} className="flex items-center gap-2.5 text-xs">
                            <span className="muted-more w-24 truncate sm:w-32">
                              {b(module.title)}
                            </span>
                            <div className="flex-1">
                              <Meter value={score.percent} height={3} />
                            </div>
                            <span className="mono w-9 text-right">
                              {formatPercent(score.percent)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <p className="muted-more text-xs">{t('exam.disclaimer')}</p>
    </div>
  )
}
