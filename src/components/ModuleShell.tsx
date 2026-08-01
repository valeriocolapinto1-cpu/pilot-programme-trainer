import { useCallback, useState, type ReactNode } from 'react'
import { useI18n } from '@/i18n'
import { Icon } from '@/components/Icon'
import { Card, ScoreDial, Tag } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import type { ModuleScore, RunMode, TrainerModule } from '@/modules/types'

/**
 * Shared chrome around every module: the briefing, the running module, and the
 * result screen. Free practice and the simulated exam both go through here, so
 * a module never has to know which one it is in.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModule = TrainerModule<any>

export function ModuleIntro({
  module,
  mode,
  onStart,
  extra,
}: {
  module: AnyModule
  mode: RunMode
  onStart: () => void
  extra?: ReactNode
}) {
  const { t, b } = useI18n()
  const [showAll, setShowAll] = useState(false)
  const instructions = b(module.instructions)
  const visible = showAll ? instructions : instructions.slice(0, 3)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <div>
        {extra ? <div className="eyebrow mb-2">{extra}</div> : null}
        <div className="flex items-start gap-3.5">
          <span
            className="surface-2 flex h-11 w-11 flex-none items-center justify-center"
            style={{ color: 'var(--text-2)' }}
          >
            <Icon name={module.icon} size={22} />
          </span>
          <div>
            <h1 className="text-2xl">{b(module.title)}</h1>
            <p className="muted mt-1">{b(module.blurb)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Tag>{t(`phase.${module.phase}`)}</Tag>
        <Tag
          title={
            module.sourceTier === 'official' ? t('source.officialHint') : t('source.communityHint')
          }
        >
          {t(`source.${module.sourceTier}`)}
        </Tag>
        {mode === 'exam' ? (
          <Tag tone="accent">{formatDuration(module.examDurationMs)}</Tag>
        ) : null}
      </div>

      <Card>
        <p className="text-[0.9375rem] leading-relaxed">{b(module.whatItTests)}</p>
      </Card>

      <div>
        <h2 className="eyebrow mb-3">{t('common.instructions')}</h2>
        <ol className="flex flex-col gap-2.5">
          {visible.map((line, i) => (
            <li key={i} className="flex gap-3 text-[0.9375rem] leading-relaxed">
              <span className="mono muted-more mt-0.5 flex-none text-xs">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
        {instructions.length > 3 && !showAll ? (
          <button
            type="button"
            className="mt-3 text-[0.8125rem]"
            style={{ color: 'var(--accent)' }}
            onClick={() => setShowAll(true)}
          >
            + {instructions.length - 3}
          </button>
        ) : null}
      </div>

      <button type="button" className="btn btn-primary btn-lg" onClick={onStart} autoFocus>
        {mode === 'exam' ? t('exam.beginModule') : t('common.start')}
      </button>
    </div>
  )
}

export function ModuleResult({
  module,
  score,
  durationMs,
  onAgain,
  onDone,
  doneLabel,
}: {
  module: AnyModule
  score: ModuleScore
  durationMs: number
  onAgain?: () => void
  onDone: () => void
  doneLabel: string
}) {
  const { t, b } = useI18n()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-7">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="eyebrow">{b(module.title)}</p>
        <ScoreDial value={score.percent} size={116} />
      </div>

      <div
        className="surface grid grid-cols-2 divide-x sm:grid-cols-3"
        style={{ borderColor: 'var(--line)' }}
      >
        {score.total != null ? (
          <div className="px-4 py-3" style={{ borderColor: 'var(--line)' }}>
            <div className="eyebrow">{t('common.correct')}</div>
            <div className="mono mt-1 text-lg">
              {score.correct ?? 0}/{score.total}
            </div>
          </div>
        ) : null}
        <div className="px-4 py-3" style={{ borderColor: 'var(--line)' }}>
          <div className="eyebrow">{t('common.duration')}</div>
          <div className="mono mt-1 text-lg">{formatDuration(durationMs)}</div>
        </div>
        {score.avgResponseMs ? (
          <div className="px-4 py-3" style={{ borderColor: 'var(--line)' }}>
            <div className="eyebrow">{t('common.speed')}</div>
            <div className="mono mt-1 text-lg">{(score.avgResponseMs / 1000).toFixed(1)}s</div>
          </div>
        ) : null}
      </div>

      {score.metrics && score.metrics.length > 0 ? (
        <div className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
          {score.metrics.map((metric, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-4 px-4 py-3"
              style={{ borderColor: 'var(--line)' }}
            >
              <div>
                <div className="text-[0.9375rem]">{b(metric.label)}</div>
                {metric.hint ? (
                  <div className="muted-more mt-0.5 text-xs">{b(metric.hint)}</div>
                ) : null}
              </div>
              <div className="mono flex-none text-[0.9375rem]">{metric.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {onAgain ? (
          <button type="button" className="btn flex-1" onClick={onAgain}>
            <Icon name="replay" size={16} />
            {t('runner.again')}
          </button>
        ) : null}
        <button type="button" className="btn btn-primary flex-1" onClick={onDone} autoFocus>
          {doneLabel}
        </button>
      </div>
    </div>
  )
}

/** Wraps a running module with its title and a quit affordance. */
export function ModuleFrame({
  title,
  onQuit,
  children,
}: {
  title: string
  onQuit?: () => void
  children: ReactNode
}) {
  const { t } = useI18n()
  const confirmQuit = useCallback(() => {
    if (!onQuit) return
    if (window.confirm(t('runner.quitConfirm'))) onQuit()
  }, [onQuit, t])

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex items-center justify-between gap-3 border-b pb-3"
        style={{ borderColor: 'var(--line)' }}
      >
        <h1 className="text-base font-medium">{title}</h1>
        {onQuit ? (
          <button type="button" className="btn btn-quiet text-[0.8125rem]" onClick={confirmQuit}>
            {t('common.quit')}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  )
}
