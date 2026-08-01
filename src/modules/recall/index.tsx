import { useCallback, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng, buildOptions, type Rng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import { Quiz } from '@/components/Quiz'
import { mono, type ModuleRuntimeProps, type QuizItem, type TrainerModule } from '@/modules/types'

export type RecallConfig = {
  /** Rows to memorise. */
  pairs: number
  studyMs: number
  /** Interference task duration between studying and recalling. */
  fillerMs: number
  questions: number
}

type Pair = { callsign: string; gate: string; runway: string; level: number }

const AIRLINES = ['WZZ', 'RYR', 'AZA', 'DLH', 'EJU', 'BAW', 'THY', 'AFR'] as const
const GATES = ['A1', 'A4', 'B2', 'B7', 'C3', 'C9', 'D5', 'D8'] as const
const RUNWAYS = ['16R', '34L', '07', '25', '18C', '36C', '12', '30'] as const

function makePairs(rng: Rng, count: number): Pair[] {
  const airlines = rng.sample(AIRLINES, count)
  const gates = rng.sample(GATES, count)
  const runways = rng.sample(RUNWAYS, count)
  return airlines.map((airline, i) => ({
    callsign: `${airline}${rng.int(100, 999)}`,
    gate: gates[i],
    runway: runways[i],
    level: rng.int(6, 38) * 10,
  }))
}

/** Simple sums used only to push the board out of working memory. */
function FillerTask({ rng, onTick }: { rng: Rng; onTick: () => void }) {
  const { t } = useI18n()
  const [problem, setProblem] = useState(() => ({ a: rng.int(11, 89), b: rng.int(11, 89) }))
  const [entry, setEntry] = useState('')
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)

  return (
    <form
      className="flex flex-col items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        const ok = Number(entry) === problem.a + problem.b
        setFlash(ok ? 'ok' : 'no')
        window.setTimeout(() => setFlash(null), 300)
        setEntry('')
        setProblem({ a: rng.int(11, 89), b: rng.int(11, 89) })
        onTick()
      }}
    >
      <div
        className="font-mono text-4xl font-semibold tabular-nums"
        style={{ color: flash === 'ok' ? 'var(--ok)' : flash === 'no' ? 'var(--bad)' : 'var(--text)' }}
      >
        {problem.a} + {problem.b}
      </div>
      <input
        className="panel-soft focus-ring w-40 px-3 py-2 text-center text-2xl tabular-nums"
        style={{ color: 'var(--text)' }}
        inputMode="numeric"
        autoFocus
        autoComplete="off"
        value={entry}
        onChange={(e) => setEntry(e.target.value.replace(/\D/g, ''))}
        aria-label={t('common.answer')}
      />
    </form>
  )
}

function buildQuestions(rng: Rng, pairs: Pair[], count: number): QuizItem[] {
  const fields: ('gate' | 'runway' | 'level')[] = ['gate', 'runway', 'level']
  const questions: QuizItem[] = []

  for (let i = 0; i < count; i++) {
    const pair = pairs[i % pairs.length]
    const field = fields[i % fields.length]
    const correct = String(pair[field])
    const others = pairs.filter((p) => p !== pair).map((p) => String(p[field]))
    const { options, correctIndex } = buildOptions(rng, correct, rng.shuffle(others), 4)

    const label = {
      gate: { it: 'gate', en: 'gate' },
      runway: { it: 'pista', en: 'runway' },
      level: { it: 'livello (FL)', en: 'level (FL)' },
    }[field]

    questions.push({
      id: `recall-${i}`,
      inputMode: 'choice',
      stem: {
        it: `Qual era ${label.it} di ${pair.callsign}?`,
        en: `What was ${pair.callsign}'s ${label.en}?`,
      },
      options: options.map(mono),
      correctIndex,
    })
  }

  return rng.shuffle(questions)
}

function RecallRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<RecallConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const pairs = useMemo(() => makePairs(rng, config.pairs), [rng, config.pairs])
  const [phase, setPhase] = useState<'study' | 'filler' | 'recall'>('study')
  const fillerCountRef = useRef(0)

  const studyTimer = useCountdown(config.studyMs, 'study', {
    running: phase === 'study',
    onExpire: () => setPhase('filler'),
  })
  const fillerTimer = useCountdown(config.fillerMs, 'filler', {
    running: phase === 'filler',
    onExpire: () => setPhase('recall'),
  })

  const questions = useMemo(
    () => buildQuestions(rng, pairs, config.questions),
    [rng, pairs, config.questions],
  )

  const handleFinish = useCallback(
    (score: Parameters<typeof onFinish>[0]) => {
      onFinish({
        ...score,
        metrics: [
          {
            label: { it: 'Calcoli di disturbo', en: 'Interference sums' },
            value: String(fillerCountRef.current),
            hint: {
              it: 'Quanti ne hai svolti mentre tenevi a mente la tabella.',
              en: 'How many you completed while holding the board in memory.',
            },
          },
        ],
      })
    },
    [onFinish],
  )

  if (phase === 'study') {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <TimerBar fraction={studyTimer.fraction} label={formatDuration(studyTimer.remaining)} />
        <p className="text-lg">
          {b({
            it: 'Memorizza la tabella. Fra poco sparirà e dovrai risolvere dei calcoli prima delle domande.',
            en: 'Memorise the board. It will disappear and you will solve sums before the questions.',
          })}
        </p>
        <table className="panel w-full text-left text-sm">
          <thead className="dim">
            <tr>
              <th className="px-3 py-2">{b({ it: 'Nominativo', en: 'Callsign' })}</th>
              <th className="px-3 py-2">Gate</th>
              <th className="px-3 py-2">{b({ it: 'Pista', en: 'Runway' })}</th>
              <th className="px-3 py-2">FL</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair.callsign} style={{ borderTop: '1px solid var(--edge)' }}>
                <td className="px-3 py-2 font-mono font-semibold">{pair.callsign}</td>
                <td className="px-3 py-2 font-mono">{pair.gate}</td>
                <td className="px-3 py-2 font-mono">{pair.runway}</td>
                <td className="px-3 py-2 font-mono">{pair.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn self-center" onClick={() => setPhase('filler')}>
          {t('common.continue')}
        </button>
      </div>
    )
  }

  if (phase === 'filler') {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
        <TimerBar fraction={fillerTimer.fraction} label={formatDuration(fillerTimer.remaining)} />
        <p className="dim text-center text-sm">
          {b({
            it: 'Risolvi più somme possibile. Non dimenticare la tabella.',
            en: 'Solve as many sums as you can. Do not forget the board.',
          })}
        </p>
        <FillerTask rng={rng} onTick={() => (fillerCountRef.current += 1)} />
      </div>
    )
  }

  return (
    <Quiz
      items={questions}
      feedback={mode === 'exam' ? 'none' : 'immediate'}
      onFinish={handleFinish}
      allowSkip={false}
    />
  )
}

export const recallModule: TrainerModule<RecallConfig> = {
  id: 'recall',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'recall',
  title: { it: 'Recall', en: 'Recall' },
  blurb: {
    it: 'Memorizza una tabella, svolgi un compito di disturbo, poi ricordala.',
    en: 'Memorise a board, do an interference task, then recall it.',
  },
  whatItTests: {
    it: 'Memoria a medio termine sotto interferenza: esattamente il caso reale in cui ricevi una clearance, fai altro, e devi ancora ricordarla.',
    en: 'Medium-term memory under interference: exactly the real case where you get a clearance, do something else, and still have to remember it.',
  },
  instructions: {
    it: [
      'Studia la tabella: nominativo → gate, pista, livello.',
      'Associa ogni riga a un’immagine: la memoria visiva regge meglio dell’elenco.',
      'Durante i calcoli di disturbo ripassa mentalmente la tabella fra una somma e l’altra.',
    ],
    en: [
      'Study the board: callsign → gate, runway, level.',
      'Attach an image to each row: visual memory survives interference better than a list.',
      'During the interference sums, mentally rehearse the board between answers.',
    ],
  },
  defaultConfig: { pairs: 5, studyMs: 45000, fillerMs: 30000, questions: 9 },
  examConfig: { pairs: 6, studyMs: 40000, fillerMs: 45000, questions: 12 },
  examDurationMs: 9 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: RecallRunner,
}
