import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { getModule } from '@/modules/registry'
import { useExam } from '@/store/examStore'
import { useProgress } from '@/store/progressStore'
import { ModuleFrame, ModuleIntro } from '@/components/ModuleShell'
import { Card, Meter, ScoreDial, SectionHeader, TimerBar } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { useCountdown } from '@/lib/useTimer'
import { formatDuration, formatPercent } from '@/lib/format'
import type { ModuleScore } from '@/modules/types'

type Stage = 'intro' | 'running' | 'break' | 'report'

export function ExamRunPage() {
  const { t, b } = useI18n()
  const navigate = useNavigate()
  const session = useExam((s) => s.session)
  const recordScore = useExam((s) => s.recordScore)
  const advance = useExam((s) => s.advance)
  const takeBreak = useExam((s) => s.takeBreak)
  const clearExam = useExam((s) => s.clear)
  const addAttempt = useProgress((s) => s.addAttempt)
  const saveExam = useProgress((s) => s.saveExam)

  const [stage, setStage] = useState<Stage>('intro')
  const [startedAt, setStartedAt] = useState(0)

  const finished = session ? session.index >= session.moduleIds.length : false
  const currentModule = useMemo(() => {
    if (!session || finished) return undefined
    return getModule(session.moduleIds[session.index])
  }, [finished, session])

  // Persist the run whenever the exam reaches its end.
  useEffect(() => {
    if (!session || !finished || stage === 'report') return
    saveExam({
      id: session.id,
      at: session.startedAt,
      kind: session.kind,
      moduleIds: session.moduleIds,
      scores: session.scores,
      completed: true,
      durationMs: Date.now() - session.startedAt,
    })
    setStage('report')
  }, [finished, saveExam, session, stage])

  const handleFinish = useCallback(
    (score: ModuleScore) => {
      if (!session || !currentModule) return
      recordScore(currentModule.id, score)
      addAttempt({
        moduleId: currentModule.id,
        at: Date.now(),
        durationMs: Date.now() - startedAt,
        mode: 'exam',
        score,
        examId: session.id,
      })
      advance()
      const nextIndex = session.index + 1
      const halfway = Math.floor(session.moduleIds.length / 2)
      if (!session.breakTaken && nextIndex === halfway && nextIndex < session.moduleIds.length) {
        takeBreak()
        setStage('break')
      } else {
        setStage('intro')
      }
    },
    [addAttempt, advance, currentModule, recordScore, session, startedAt, takeBreak],
  )

  const abandon = useCallback(() => {
    if (!session) return
    if (!window.confirm(t('exam.abandonConfirm'))) return
    saveExam({
      id: session.id,
      at: session.startedAt,
      kind: session.kind,
      moduleIds: session.moduleIds,
      scores: session.scores,
      completed: false,
      durationMs: Date.now() - session.startedAt,
    })
    clearExam()
    navigate('/exam')
  }, [clearExam, navigate, saveExam, session, t])

  if (!session) return <Navigate to="/exam" replace />

  if (stage === 'report' || finished) {
    return <ExamReport />
  }

  if (stage === 'break') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
        <h1>{t('exam.breakTitle')}</h1>
        <p className="muted leading-relaxed">{t('exam.breakBody')}</p>
        <button
          type="button"
          className="btn btn-primary btn-lg mt-2 px-8"
          onClick={() => setStage('intro')}
          autoFocus
        >
          {t('common.continue')}
        </button>
      </div>
    )
  }

  if (!currentModule) return <Navigate to="/exam" replace />

  if (stage === 'intro') {
    return (
      <ModuleIntro
        module={currentModule}
        mode="exam"
        onStart={() => {
          setStartedAt(Date.now())
          setStage('running')
        }}
        extra={t('exam.moduleIntro', {
          n: session.index + 1,
          total: session.moduleIds.length,
        })}
      />
    )
  }

  const Component = currentModule.Component
  const seed = session.seeds[session.index]

  return (
    <ModuleFrame title={b(currentModule.title)} onQuit={abandon}>
      <ExamModuleTimer
        durationMs={currentModule.examDurationMs}
        resetKey={session.index}
        onExpire={() =>
          handleFinish({
            percent: 0,
            correct: 0,
            total: 0,
            metrics: [
              {
                label: { it: 'Esito', en: 'Outcome' },
                value: t('common.timeUp'),
              },
            ],
          })
        }
      />
      <Component
        key={seed}
        config={currentModule.examConfig}
        seed={seed}
        mode="exam"
        onFinish={handleFinish}
      />
    </ModuleFrame>
  )
}

/** Whole-module countdown; when it runs out the exam moves on regardless. */
function ExamModuleTimer({
  durationMs,
  resetKey,
  onExpire,
}: {
  durationMs: number
  resetKey: unknown
  onExpire: () => void
}) {
  const countdown = useCountdown(durationMs, resetKey, { running: true, onExpire })
  return <TimerBar fraction={countdown.fraction} label={formatDuration(countdown.remaining)} />
}

export function ExamReport() {
  const { t, b } = useI18n()
  const navigate = useNavigate()
  const session = useExam((s) => s.session)
  const clearExam = useExam((s) => s.clear)
  const exams = useProgress((s) => s.exams)

  const run = session
    ? {
        moduleIds: session.moduleIds,
        scores: session.scores,
        kind: session.kind,
      }
    : exams[0]
      ? { moduleIds: exams[0].moduleIds, scores: exams[0].scores, kind: exams[0].kind }
      : null

  if (!run) return <Navigate to="/exam" replace />

  const entries = run.moduleIds
    .map((id) => ({ module: getModule(id), score: run.scores[id] }))
    .filter((e): e is { module: NonNullable<typeof e.module>; score: ModuleScore } =>
      Boolean(e.module && e.score),
    )

  const average =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.score.percent, 0) / entries.length
      : 0

  const ranked = [...entries].sort((a, b2) => b2.score.percent - a.score.percent)
  const strongest = ranked.slice(0, 3)
  const weakest = ranked.slice(-3).reverse()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <div>
          <h1>{t('exam.reportTitle')}</h1>
          <p className="muted mt-1">{t('exam.reportSubtitle')}</p>
        </div>
        <ScoreDial value={average} size={124} />
        <p className="eyebrow">{t('exam.overall')}</p>
      </header>

      <section>
        <SectionHeader>{t('exam.byModule')}</SectionHeader>
        <ul className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
          {entries.map(({ module, score }) => (
            <li key={module.id} className="px-4 py-3" style={{ borderColor: 'var(--line)' }}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-[0.9375rem] font-medium">
                  <Icon name={module.icon} size={16} style={{ color: 'var(--text-3)' }} />
                  {b(module.title)}
                </span>
                <span className="mono flex-none">{formatPercent(score.percent)}</span>
              </div>
              <Meter value={score.percent} height={3} />
              {score.metrics && score.metrics.length > 0 ? (
                <div className="muted-more mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {score.metrics.map((metric, i) => (
                    <span key={i}>
                      {b(metric.label)}:{' '}
                      <span className="mono" style={{ color: 'var(--text-2)' }}>
                        {metric.value}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionHeader>{t('exam.strongest')}</SectionHeader>
          <ul className="flex flex-col gap-1.5 text-sm">
            {strongest.map(({ module, score }) => (
              <li key={module.id} className="flex justify-between gap-2">
                <span>{b(module.title)}</span>
                <span className="mono">{formatPercent(score.percent)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionHeader>{t('exam.weakest')}</SectionHeader>
          <ul className="flex flex-col gap-1.5 text-sm">
            {weakest.map(({ module, score }) => (
              <li key={module.id} className="flex justify-between gap-2">
                <span>{b(module.title)}</span>
                <span className="mono">{formatPercent(score.percent)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="muted-more text-xs">{t('exam.disclaimer')}</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="btn flex-1"
          onClick={() => {
            clearExam()
            navigate('/progress')
          }}
        >
          {t('nav.progress')}
        </button>
        <button
          type="button"
          className="btn btn-primary flex-1"
          onClick={() => {
            clearExam()
            navigate('/exam')
          }}
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
