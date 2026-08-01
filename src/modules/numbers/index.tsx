import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng, type Rng } from '@/lib/rng'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type NumbersConfig = {
  trials: number
  startLength: number
  /** How long each digit stays on screen. */
  digitMs: number
  direction: 'forward' | 'backward' | 'alternate'
}

type Phase = 'ready' | 'showing' | 'recall' | 'feedback'

type TrialResult = { length: number; backward: boolean; correct: boolean }

function makeSequence(rng: Rng, length: number): number[] {
  const digits: number[] = []
  for (let i = 0; i < length; i++) {
    let d = rng.int(0, 9)
    // Avoid immediate repeats: they make the sequence artificially easy to chunk.
    while (digits.length > 0 && d === digits[digits.length - 1]) d = rng.int(0, 9)
    digits.push(d)
  }
  return digits
}

function NumbersRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<NumbersConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])

  const [trial, setTrial] = useState(0)
  const [length, setLength] = useState(config.startLength)
  const [phase, setPhase] = useState<Phase>('ready')
  const [sequence, setSequence] = useState<number[]>([])
  const [shownIndex, setShownIndex] = useState(-1)
  const [entry, setEntry] = useState('')
  const [lastCorrect, setLastCorrect] = useState(false)
  const resultsRef = useRef<TrialResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const backward =
    config.direction === 'backward' ||
    (config.direction === 'alternate' && trial % 2 === 1)

  const startTrial = useCallback(() => {
    setSequence(makeSequence(rng, length))
    setEntry('')
    setShownIndex(0)
    setPhase('showing')
  }, [length, rng])

  // Reveal the digits one at a time, then switch to recall.
  useEffect(() => {
    if (phase !== 'showing') return
    const id = window.setTimeout(() => {
      setShownIndex((i) => {
        if (i + 1 >= sequence.length) {
          setPhase('recall')
          return -1
        }
        return i + 1
      })
    }, config.digitMs)
    return () => window.clearTimeout(id)
  }, [phase, shownIndex, sequence.length, config.digitMs])

  useEffect(() => {
    if (phase === 'recall') inputRef.current?.focus()
  }, [phase])

  const finish = useCallback(() => {
    const results = resultsRef.current
    const correct = results.filter((r) => r.correct).length
    const spans = (filter: (r: TrialResult) => boolean) => {
      const passed = results.filter((r) => filter(r) && r.correct).map((r) => r.length)
      return passed.length > 0 ? Math.max(...passed) : 0
    }
    onFinish({
      percent: results.length > 0 ? (correct / results.length) * 100 : 0,
      correct,
      total: results.length,
      metrics: [
        {
          label: { it: 'Span diretto', en: 'Forward span' },
          value: String(spans((r) => !r.backward)),
          hint: {
            it: 'Sequenza più lunga ripetuta correttamente in ordine.',
            en: 'Longest sequence repeated correctly in order.',
          },
        },
        {
          label: { it: 'Span inverso', en: 'Backward span' },
          value: String(spans((r) => r.backward)),
          hint: {
            it: 'Sequenza più lunga ripetuta correttamente al contrario.',
            en: 'Longest sequence repeated correctly in reverse.',
          },
        },
      ],
    })
  }, [onFinish])

  const submit = useCallback(() => {
    const expected = (backward ? [...sequence].reverse() : sequence).join('')
    const given = entry.replace(/\D/g, '')
    const correct = given === expected
    resultsRef.current.push({ length, backward, correct })
    setLastCorrect(correct)
    // Adaptive span: grow on success, shrink on failure, never below 3.
    setLength((l) => Math.max(3, Math.min(12, correct ? l + 1 : l - 1)))
    setPhase('feedback')
  }, [backward, entry, length, sequence])

  const next = useCallback(() => {
    if (trial + 1 >= config.trials) {
      finish()
    } else {
      setTrial((n) => n + 1)
      setPhase('ready')
    }
  }, [config.trials, finish, trial])

  // In exam mode the trial chains automatically; in practice you read the feedback.
  useEffect(() => {
    if (phase !== 'feedback' || mode !== 'exam') return
    const id = window.setTimeout(next, 700)
    return () => window.clearTimeout(id)
  }, [phase, mode, next])

  useEffect(() => {
    if (phase === 'ready') {
      const id = window.setTimeout(startTrial, 600)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [phase, startTrial])

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center">
      <div className="dim flex w-full items-center justify-between text-sm">
        <span>
          {t('common.round')} {trial + 1} / {config.trials}
        </span>
        <span className="chip">
          {backward
            ? t('common.answer') + ' ⟲'
            : t('common.answer') + ' ⟳'}{' '}
          · {length}
        </span>
      </div>

      <div
        className="panel-soft flex h-40 w-full items-center justify-center"
        aria-live="polite"
      >
        {phase === 'ready' ? (
          <span className="dim">{t('runner.countdownHint')}</span>
        ) : phase === 'showing' ? (
          <span className="text-7xl font-bold tabular-nums">{sequence[shownIndex] ?? ''}</span>
        ) : phase === 'recall' ? (
          <span className="text-5xl" aria-hidden>
            {backward ? '⟲' : '⟳'}
          </span>
        ) : (
          <span
            className="text-2xl font-bold"
            style={{ color: lastCorrect ? 'var(--ok)' : 'var(--bad)' }}
          >
            {lastCorrect ? t('common.correct') : t('common.wrong')}
          </span>
        )}
      </div>

      {phase === 'recall' ? (
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            ref={inputRef}
            className="panel-soft focus-ring flex-1 px-3 py-2 text-center text-2xl tracking-[0.3em] tabular-nums"
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

      {phase === 'feedback' && mode !== 'exam' ? (
        <div className="w-full">
          {!lastCorrect ? (
            <p className="dim mb-2 text-sm">
              {t('common.correctAnswer')}:{' '}
              <strong>{(backward ? [...sequence].reverse() : sequence).join('')}</strong>
            </p>
          ) : null}
          <button type="button" className="btn btn-primary w-full" onClick={next} autoFocus>
            {trial + 1 >= config.trials ? t('common.finish') : t('common.next')}
          </button>
        </div>
      ) : null}

      <p className="dim text-sm">
        {backward
          ? b({ it: 'Scrivi la sequenza AL CONTRARIO.', en: 'Type the sequence BACKWARDS.' })
          : b({ it: 'Scrivi la sequenza nello stesso ordine.', en: 'Type the sequence in order.' })}
      </p>
    </div>
  )
}

export const numbersModule: TrainerModule<NumbersConfig> = {
  id: 'numbers',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'digits',
  title: { it: 'Numbers', en: 'Numbers' },
  blurb: {
    it: 'Memorizza sequenze di cifre e ripetile, in ordine diretto e inverso.',
    en: 'Memorise digit sequences and repeat them, forwards and backwards.',
  },
  whatItTests: {
    it: 'Memoria a breve termine e memoria di lavoro. La lunghezza si adatta: cresce quando rispondi bene, cala quando sbagli, così trovi il tuo span reale.',
    en: 'Short-term and working memory. The length adapts: it grows when you succeed and shrinks when you fail, so you find your real span.',
  },
  instructions: {
    it: [
      'Le cifre appaiono una alla volta: non scriverle, tienile a mente.',
      'Nei round inversi devi digitare la sequenza al contrario.',
      'Raggruppa le cifre a due a due: è la strategia che regge meglio sotto pressione.',
    ],
    en: [
      'Digits appear one at a time: do not write them down, hold them in mind.',
      'On backward rounds you type the sequence in reverse.',
      'Chunk the digits in pairs: it is the strategy that holds up best under pressure.',
    ],
  },
  defaultConfig: { trials: 10, startLength: 4, digitMs: 800, direction: 'alternate' },
  examConfig: { trials: 14, startLength: 4, digitMs: 700, direction: 'alternate' },
  examDurationMs: 10 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: NumbersRunner,
}
