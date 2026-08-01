import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { useCountdown } from '@/lib/useTimer'
import { formatDuration } from '@/lib/format'
import { TimerBar } from '@/components/ui'
import type { ModuleScore, QuizAnswer, QuizItem } from '@/modules/types'

export type QuizProps = {
  items: QuizItem[]
  /** Per-question limit; 0 disables it (the module slot timer still applies). */
  perItemMs?: number
  /**
   * `immediate` shows correct/wrong straight away (practice), `none` moves on
   * silently — which is what the real exam does.
   */
  feedback: 'immediate' | 'none'
  /** ms to linger on the feedback before auto-advancing; 0 waits for a click. */
  autoAdvanceMs?: number
  onFinish: (score: ModuleScore, answers: QuizAnswer[]) => void
  /** Extra metrics merged into the score, e.g. topic breakdowns. */
  buildMetrics?: (answers: QuizAnswer[], items: QuizItem[]) => ModuleScore['metrics']
  /** Hides the "skip" affordance where the real module forces an answer. */
  allowSkip?: boolean
}

function normaliseText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function Quiz({
  items,
  perItemMs = 0,
  feedback,
  autoAdvanceMs = 0,
  onFinish,
  buildMetrics,
  allowSkip = true,
}: QuizProps) {
  const { t, b } = useI18n()
  const [index, setIndex] = useState(0)
  const [entry, setEntry] = useState('')
  const [revealed, setRevealed] = useState<{
    correct: boolean
    given: string | null
    choiceIndex?: number
  } | null>(null)
  const answersRef = useRef<QuizAnswer[]>([])
  const startedAtRef = useRef(performance.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const finishedRef = useRef(false)

  const item = items[index]
  const isLast = index >= items.length - 1

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const answers = answersRef.current
    const correct = answers.filter((a) => a.correct).length
    const total = items.length
    const avgResponseMs =
      answers.length > 0
        ? answers.reduce((sum, a) => sum + a.responseMs, 0) / answers.length
        : 0
    onFinish(
      {
        percent: total > 0 ? (correct / total) * 100 : 0,
        correct,
        total,
        avgResponseMs,
        metrics: buildMetrics?.(answers, items),
      },
      answers,
    )
  }, [buildMetrics, items, onFinish])

  const advance = useCallback(() => {
    setRevealed(null)
    setEntry('')
    if (isLast) {
      finish()
    } else {
      setIndex((i) => i + 1)
      startedAtRef.current = performance.now()
    }
  }, [finish, isLast])

  const submit = useCallback(
    (given: string | null, correct: boolean, choiceIndex?: number) => {
      if (revealed || finishedRef.current) return
      answersRef.current.push({
        itemId: item.id,
        correct,
        responseMs: performance.now() - startedAtRef.current,
        given,
      })
      if (feedback === 'immediate') {
        setRevealed({ correct, given, choiceIndex })
        if (autoAdvanceMs > 0) window.setTimeout(advance, autoAdvanceMs)
      } else {
        advance()
      }
    },
    [advance, autoAdvanceMs, feedback, item, revealed],
  )

  const answerChoice = useCallback(
    (choice: number) => {
      if (item.inputMode !== 'choice') return
      submit(b(item.options[choice]), choice === item.correctIndex, choice)
    },
    [b, item, submit],
  )

  const answerEntry = useCallback(() => {
    if (item.inputMode === 'numeric') {
      const value = Number(entry.replace(',', '.'))
      const ok =
        entry.trim() !== '' &&
        Number.isFinite(value) &&
        Math.abs(value - item.numericAnswer) <= (item.tolerance ?? 0)
      submit(entry.trim() || null, ok)
    } else if (item.inputMode === 'text') {
      const ok = item.textAnswers.some((a) => normaliseText(a) === normaliseText(entry))
      submit(entry.trim() || null, ok)
    }
  }, [entry, item, submit])

  const timeOut = useCallback(() => {
    if (revealed || finishedRef.current) return
    answersRef.current.push({
      itemId: item.id,
      correct: false,
      responseMs: perItemMs,
      given: null,
    })
    if (feedback === 'immediate') {
      setRevealed({ correct: false, given: null })
      if (autoAdvanceMs > 0) window.setTimeout(advance, autoAdvanceMs)
    } else {
      advance()
    }
  }, [advance, autoAdvanceMs, feedback, item, perItemMs, revealed])

  const countdown = useCountdown(perItemMs, index, {
    running: perItemMs > 0 && !revealed,
    onExpire: timeOut,
  })

  // Number keys pick an option, Enter confirms — the exam rewards speed.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (finishedRef.current) return
      if (revealed) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          advance()
        }
        return
      }
      if (item.inputMode === 'choice') {
        const n = Number(event.key)
        if (Number.isInteger(n) && n >= 1 && n <= item.options.length) {
          event.preventDefault()
          answerChoice(n - 1)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, answerChoice, item, revealed])

  useEffect(() => {
    if (item.inputMode !== 'choice') inputRef.current?.focus()
  }, [index, item.inputMode])

  const correctLabel = useMemo(() => {
    if (item.inputMode === 'choice') return b(item.options[item.correctIndex])
    if (item.inputMode === 'numeric') return String(item.numericAnswer)
    return item.textAnswers[0]
  }, [b, item])

  if (!item) return null

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="dim tabular-nums">
          {t('common.question')} {index + 1} {t('common.of')} {items.length}
        </span>
        {item.topic ? <span className="chip">{b(item.topic)}</span> : null}
      </div>

      {perItemMs > 0 ? (
        <TimerBar
          fraction={countdown.fraction}
          label={formatDuration(countdown.remaining)}
        />
      ) : null}

      {item.visual ? <div className="flex justify-center py-2">{item.visual}</div> : null}

      {item.stem ? (
        <p className="text-lg leading-relaxed whitespace-pre-line">{b(item.stem)}</p>
      ) : null}

      {item.inputMode === 'choice' ? (
        <div className="grid gap-2">
          {item.options.map((option, i) => {
            const state = !revealed
              ? undefined
              : i === item.correctIndex
                ? 'correct'
                : i === revealed.choiceIndex
                  ? 'wrong'
                  : undefined
            return (
              <button
                key={i}
                type="button"
                className="option focus-ring"
                data-state={state}
                disabled={!!revealed}
                onClick={() => answerChoice(i)}
              >
                <span className="chip w-6 justify-center px-0">{i + 1}</span>
                <span>{b(option)}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            answerEntry()
          }}
        >
          <input
            ref={inputRef}
            className="panel-soft focus-ring flex-1 px-3 py-2 text-lg"
            style={{ color: 'var(--text)' }}
            inputMode={item.inputMode === 'numeric' ? 'decimal' : 'text'}
            autoComplete="off"
            value={entry}
            disabled={!!revealed}
            onChange={(e) => setEntry(e.target.value)}
            aria-label={t('common.answer')}
          />
          {item.inputMode === 'numeric' && item.unit ? (
            <span className="dim self-center text-sm">{b(item.unit)}</span>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={!!revealed}>
            {t('common.confirm')}
          </button>
        </form>
      )}

      {revealed ? (
        <div className="panel-soft p-3">
          <div
            className="font-semibold"
            style={{ color: revealed.correct ? 'var(--ok)' : 'var(--bad)' }}
          >
            {revealed.correct ? t('common.correct') : t('common.wrong')}
          </div>
          {!revealed.correct ? (
            <div className="mt-1 text-sm">
              {t('common.correctAnswer')}: <strong>{correctLabel}</strong>
            </div>
          ) : null}
          {item.explanation ? (
            <p className="dim mt-2 text-sm leading-relaxed">{b(item.explanation)}</p>
          ) : null}
          <button type="button" className="btn btn-primary mt-3" onClick={advance} autoFocus>
            {isLast ? t('common.finish') : t('common.next')}
          </button>
        </div>
      ) : allowSkip ? (
        <button type="button" className="btn btn-ghost self-start" onClick={() => submit(null, false)}>
          {t('common.skipped')}
        </button>
      ) : null}
    </div>
  )
}
