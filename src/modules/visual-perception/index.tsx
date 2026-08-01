import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng, type Rng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type VisualPerceptionConfig = {
  items: number
  /** How long the grid stays visible. */
  displayMs: number
  /** How long you get to answer once it disappears. */
  answerMs: number
}

const QUADRANT_LABELS = ['↖', '↗', '↙', '↘'] as const

type Item = {
  /** Four numbers, one per quadrant, clockwise from top-left. */
  values: number[]
  /** 'highest' | 'lowest' picks a quadrant; 'value' asks for a number back. */
  question: 'highest' | 'lowest' | 'value'
  /** Quadrant asked about when question === 'value'. */
  askedQuadrant: number
}

function makeItem(rng: Rng): Item {
  const values: number[] = []
  while (values.length < 4) {
    const v = rng.int(10, 99)
    if (!values.includes(v)) values.push(v)
  }
  const question = rng.pick(['highest', 'lowest', 'value'] as const)
  return { values, question, askedQuadrant: rng.int(0, 3) }
}

function correctAnswer(item: Item): number {
  if (item.question === 'highest') return item.values.indexOf(Math.max(...item.values))
  if (item.question === 'lowest') return item.values.indexOf(Math.min(...item.values))
  return item.values[item.askedQuadrant]
}

function VisualPerceptionRunner({
  config,
  seed,
  mode,
  onFinish,
}: ModuleRuntimeProps<VisualPerceptionConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const [index, setIndex] = useState(0)
  const [item, setItem] = useState<Item>(() => makeItem(rng))
  const [phase, setPhase] = useState<'display' | 'answer' | 'feedback'>('display')
  const [entry, setEntry] = useState('')
  const [lastCorrect, setLastCorrect] = useState(false)
  const resultsRef = useRef<{ correct: boolean; ms: number }[]>([])
  const answerStartRef = useRef(0)
  const finishedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const results = resultsRef.current
    const correct = results.filter((r) => r.correct).length
    onFinish({
      percent: results.length > 0 ? (correct / results.length) * 100 : 0,
      correct,
      total: config.items,
      avgResponseMs:
        results.length > 0 ? results.reduce((s, r) => s + r.ms, 0) / results.length : 0,
    })
  }, [config.items, onFinish])

  const next = useCallback(() => {
    if (index + 1 >= config.items) {
      finish()
      return
    }
    setIndex((i) => i + 1)
    setItem(makeItem(rng))
    setEntry('')
    setPhase('display')
  }, [config.items, finish, index, rng])

  const record = useCallback(
    (correct: boolean) => {
      resultsRef.current.push({ correct, ms: performance.now() - answerStartRef.current })
      setLastCorrect(correct)
      if (mode === 'exam') next()
      else setPhase('feedback')
    },
    [mode, next],
  )

  const displayTimer = useCountdown(config.displayMs, index, {
    running: phase === 'display',
    onExpire: () => {
      answerStartRef.current = performance.now()
      setPhase('answer')
    },
  })

  const answerTimer = useCountdown(config.answerMs, index, {
    running: phase === 'answer',
    onExpire: () => record(false),
  })

  useEffect(() => {
    if (phase === 'answer' && item.question === 'value') inputRef.current?.focus()
  }, [phase, item.question])

  // Quadrant answers are keyboard-driven so the 4-second limit is realistic.
  useEffect(() => {
    if (phase !== 'answer' || item.question === 'value') return
    const onKey = (event: KeyboardEvent) => {
      const n = Number(event.key)
      if (Number.isInteger(n) && n >= 1 && n <= 4) {
        event.preventDefault()
        record(n - 1 === correctAnswer(item))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, item, record])

  const prompt =
    item.question === 'highest'
      ? { it: 'Quale quadrante conteneva il numero PIÙ ALTO?', en: 'Which quadrant held the HIGHEST number?' }
      : item.question === 'lowest'
        ? { it: 'Quale quadrante conteneva il numero PIÙ BASSO?', en: 'Which quadrant held the LOWEST number?' }
        : {
            it: `Che numero c’era nel quadrante ${QUADRANT_LABELS[item.askedQuadrant]}?`,
            en: `Which number was in quadrant ${QUADRANT_LABELS[item.askedQuadrant]}?`,
          }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="dim flex items-center justify-between text-sm">
        <span>
          {index + 1} / {config.items}
        </span>
        <span>{phase === 'display' ? b({ it: 'Osserva', en: 'Look' }) : b({ it: 'Rispondi', en: 'Answer' })}</span>
      </div>

      <TimerBar
        fraction={phase === 'display' ? displayTimer.fraction : answerTimer.fraction}
        label={formatDuration(phase === 'display' ? displayTimer.remaining : answerTimer.remaining)}
      />

      <div className="panel-soft grid aspect-square grid-cols-2 grid-rows-2 overflow-hidden">
        {[0, 1, 2, 3].map((q) => (
          <div
            key={q}
            className="flex items-center justify-center text-4xl font-bold tabular-nums"
            style={{
              borderRight: q % 2 === 0 ? '1px solid var(--edge)' : undefined,
              borderBottom: q < 2 ? '1px solid var(--edge)' : undefined,
              background:
                phase !== 'display' && item.question === 'value' && q === item.askedQuadrant
                  ? 'var(--accent-soft)'
                  : undefined,
            }}
          >
            {phase === 'display' ? (
              item.values[q]
            ) : (
              <span className="dim text-2xl">{QUADRANT_LABELS[q]}</span>
            )}
          </div>
        ))}
      </div>

      {phase !== 'display' ? <p className="text-center text-lg">{b(prompt)}</p> : null}

      {phase === 'answer' && item.question !== 'value' ? (
        <div className="grid grid-cols-4 gap-2">
          {QUADRANT_LABELS.map((label, q) => (
            <button
              key={q}
              type="button"
              className="option justify-center text-2xl"
              onClick={() => record(q === correctAnswer(item))}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {phase === 'answer' && item.question === 'value' ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            record(Number(entry) === correctAnswer(item))
          }}
        >
          <input
            ref={inputRef}
            className="panel-soft focus-ring flex-1 px-3 py-2 text-center text-2xl tabular-nums"
            style={{ color: 'var(--text)' }}
            inputMode="numeric"
            autoComplete="off"
            value={entry}
            onChange={(e) => setEntry(e.target.value.replace(/\D/g, ''))}
            aria-label={t('common.answer')}
          />
          <button type="submit" className="btn btn-primary">
            {t('common.confirm')}
          </button>
        </form>
      ) : null}

      {phase === 'feedback' ? (
        <div className="panel-soft p-3 text-center">
          <div
            className="font-semibold"
            style={{ color: lastCorrect ? 'var(--ok)' : 'var(--bad)' }}
          >
            {lastCorrect ? t('common.correct') : t('common.wrong')}
          </div>
          {!lastCorrect ? (
            <p className="dim mt-1 text-sm">
              {t('common.correctAnswer')}:{' '}
              <strong>
                {item.question === 'value'
                  ? correctAnswer(item)
                  : QUADRANT_LABELS[correctAnswer(item)]}
              </strong>{' '}
              ({item.values.join(' · ')})
            </p>
          ) : null}
          <button type="button" className="btn btn-primary mt-3" onClick={next} autoFocus>
            {index + 1 >= config.items ? t('common.finish') : t('common.next')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export const visualPerceptionModule: TrainerModule<VisualPerceptionConfig> = {
  id: 'visual-perception',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'flash',
  title: { it: 'Visual Perception', en: 'Visual Perception' },
  blurb: {
    it: 'Quadranti e numeri con ~4 secondi per item. Il modulo riferito come più duro.',
    en: 'Quadrants and numbers with ~4 seconds per item. Reported as the hardest module.',
  },
  whatItTests: {
    it: 'Velocità percettiva e memoria sotto forte pressione temporale. Non c’è tempo per ragionare: si guarda, si trattiene, si risponde.',
    en: 'Perceptual speed and memory under heavy time pressure. There is no time to reason: look, hold, answer.',
  },
  instructions: {
    it: [
      'La griglia resta visibile pochissimo: guarda tutti e quattro i numeri, non uno alla volta.',
      'Non sai in anticipo quale domanda arriverà: memorizza sia i valori sia le posizioni.',
      'Rispondi con i tasti 1-4 (↖ ↗ ↙ ↘) quando la domanda riguarda un quadrante.',
    ],
    en: [
      'The grid is visible for a moment only: take in all four numbers at once, not one by one.',
      'You do not know which question is coming: hold both the values and the positions.',
      'Answer with keys 1-4 (↖ ↗ ↙ ↘) when the question is about a quadrant.',
    ],
  },
  defaultConfig: { items: 15, displayMs: 2500, answerMs: 6000 },
  examConfig: { items: 25, displayMs: 1800, answerMs: 4000 },
  examDurationMs: 8 * 60 * 1000,
  inProExam: true,
  inPracticeSet: true,
  Component: VisualPerceptionRunner,
}
