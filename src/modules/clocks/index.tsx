import { useCallback, useMemo, useRef, useState } from 'react'
import { useI18n, type Bilingual } from '@/i18n'
import { createRng, type Rng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type ClocksConfig = {
  rounds: number
  /** Dials per grid. */
  dials: number
  roundMs: number
}

const COLOURS = ['#4da3ff', '#f0b429', '#3ecf8e', '#ef5f6b'] as const
const COLOUR_NAMES: Bilingual[] = [
  { it: 'blu', en: 'blue' },
  { it: 'giallo', en: 'yellow' },
  { it: 'verde', en: 'green' },
  { it: 'rosso', en: 'red' },
]

type MarkerShape = 'triangle' | 'square' | 'circle'
const SHAPE_NAMES: Record<MarkerShape, Bilingual> = {
  triangle: { it: 'triangolare', en: 'triangular' },
  square: { it: 'quadrato', en: 'square' },
  circle: { it: 'circolare', en: 'round' },
}

type Dial = {
  id: number
  colour: number
  shape: MarkerShape
  /** Needle angle in degrees clockwise from 12 o'clock. */
  angle: number
}

type Round = {
  dials: Dial[]
  targetColour: number
  targetShape: MarkerShape
  /** Ids of the dials that satisfy both criteria. */
  targets: number[]
}

function makeRound(rng: Rng, count: number): Round {
  const targetColour = rng.int(0, COLOURS.length - 1)
  const targetShape = rng.pick(['triangle', 'square', 'circle'] as MarkerShape[])

  const dials: Dial[] = Array.from({ length: count }, (_, id) => ({
    id,
    colour: rng.int(0, COLOURS.length - 1),
    shape: rng.pick(['triangle', 'square', 'circle'] as MarkerShape[]),
    angle: rng.int(0, 11) * 30 + rng.int(-10, 10),
  }))

  // Guarantee between 2 and 5 matches so the round is never trivially empty.
  let matches = dials.filter((d) => d.colour === targetColour && d.shape === targetShape)
  const wanted = rng.int(2, 5)
  const spare = rng.shuffle(dials.filter((d) => !matches.includes(d)))
  let i = 0
  while (matches.length < wanted && i < spare.length) {
    spare[i].colour = targetColour
    spare[i].shape = targetShape
    i += 1
    matches = dials.filter((d) => d.colour === targetColour && d.shape === targetShape)
  }

  return {
    dials,
    targetColour,
    targetShape,
    targets: matches.map((d) => d.id),
  }
}

function DialFace({
  dial,
  selected,
  reveal,
  isTarget,
  onClick,
}: {
  dial: Dial
  selected: boolean
  reveal: boolean
  isTarget: boolean
  onClick: () => void
}) {
  const size = 74
  const c = size / 2
  const rad = ((dial.angle - 90) * Math.PI) / 180
  const nx = c + (c - 14) * Math.cos(rad)
  const ny = c + (c - 14) * Math.sin(rad)
  const mx = c + (c - 8) * Math.cos(rad)
  const my = c + (c - 8) * Math.sin(rad)
  const colour = COLOURS[dial.colour]

  const border = reveal
    ? isTarget
      ? 'var(--ok)'
      : selected
        ? 'var(--bad)'
        : 'var(--edge)'
    : selected
      ? 'var(--accent)'
      : 'var(--edge)'

  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring rounded-full"
      style={{
        border: `2px solid ${border}`,
        borderRadius: '50%',
        background: 'var(--panel-soft)',
        padding: 2,
        lineHeight: 0,
      }}
      aria-pressed={selected}
      aria-label={`dial ${dial.id + 1}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180
          return (
            <line
              key={i}
              x1={c + (c - 6) * Math.cos(a)}
              y1={c + (c - 6) * Math.sin(a)}
              x2={c + (c - 10) * Math.cos(a)}
              y2={c + (c - 10) * Math.sin(a)}
              stroke="var(--text-dim)"
              strokeWidth="1"
            />
          )
        })}
        <line x1={c} y1={c} x2={nx} y2={ny} stroke="var(--text)" strokeWidth="2.5" />
        {dial.shape === 'circle' ? (
          <circle cx={mx} cy={my} r={5} fill={colour} />
        ) : dial.shape === 'square' ? (
          <rect x={mx - 4.5} y={my - 4.5} width={9} height={9} fill={colour} />
        ) : (
          <polygon
            points={`${mx},${my - 5.5} ${mx - 5},${my + 4} ${mx + 5},${my + 4}`}
            fill={colour}
          />
        )}
        <circle cx={c} cy={c} r={3} fill="var(--text)" />
      </svg>
    </button>
  )
}

function ClocksRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<ClocksConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState<Round>(() => makeRound(rng, config.dials))
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [reveal, setReveal] = useState(false)
  const tallyRef = useRef({ hits: 0, misses: 0, falseAlarms: 0, targets: 0 })
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const { hits, misses, falseAlarms, targets } = tallyRef.current
    // Penalise false alarms: clicking everything must not score well.
    const raw = targets > 0 ? (hits - falseAlarms) / targets : 0
    onFinish({
      percent: Math.max(0, Math.min(1, raw)) * 100,
      correct: hits,
      total: targets,
      metrics: [
        {
          label: { it: 'Mancati', en: 'Missed' },
          value: String(misses),
        },
        {
          label: { it: 'Falsi allarmi', en: 'False alarms' },
          value: String(falseAlarms),
          hint: {
            it: 'Quadranti selezionati che non rispettavano il criterio.',
            en: 'Dials you selected that did not match the criterion.',
          },
        },
      ],
    })
  }, [onFinish])

  const scoreRound = useCallback(() => {
    const targets = new Set(round.targets)
    let hits = 0
    let falseAlarms = 0
    for (const id of selected) {
      if (targets.has(id)) hits += 1
      else falseAlarms += 1
    }
    tallyRef.current.hits += hits
    tallyRef.current.falseAlarms += falseAlarms
    tallyRef.current.misses += targets.size - hits
    tallyRef.current.targets += targets.size
  }, [round.targets, selected])

  const nextRound = useCallback(() => {
    if (roundIndex + 1 >= config.rounds) {
      finish()
      return
    }
    setRoundIndex((i) => i + 1)
    setRound(makeRound(rng, config.dials))
    setSelected(new Set())
    setReveal(false)
  }, [config.dials, config.rounds, finish, rng, roundIndex])

  const submit = useCallback(() => {
    if (reveal) return
    scoreRound()
    if (mode === 'exam') {
      // The real module never shows what you got right; keep the pressure on.
      if (roundIndex + 1 >= config.rounds) finish()
      else {
        setRoundIndex((i) => i + 1)
        setRound(makeRound(rng, config.dials))
        setSelected(new Set())
      }
    } else {
      setReveal(true)
    }
  }, [config.dials, config.rounds, finish, mode, reveal, rng, roundIndex, scoreRound])

  const countdown = useCountdown(config.roundMs, roundIndex, {
    running: !reveal,
    onExpire: submit,
  })

  const toggle = (id: number) => {
    if (reveal) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="dim flex items-center justify-between text-sm">
        <span>
          {t('common.round')} {roundIndex + 1} / {config.rounds}
        </span>
        <span>
          {selected.size} {t('common.of')} ~{round.targets.length}
        </span>
      </div>

      <TimerBar fraction={countdown.fraction} label={formatDuration(countdown.remaining)} />

      <p className="text-lg">
        {b({
          it: `Seleziona tutti i quadranti con marcatore ${b(SHAPE_NAMES[round.targetShape])} di colore ${b(COLOUR_NAMES[round.targetColour])}.`,
          en: `Select every dial with a ${b(SHAPE_NAMES[round.targetShape])} marker in ${b(COLOUR_NAMES[round.targetColour])}.`,
        })}
      </p>

      <div className="grid grid-cols-3 justify-items-center gap-2 sm:grid-cols-4 md:grid-cols-6">
        {round.dials.map((dial) => (
          <DialFace
            key={dial.id}
            dial={dial}
            selected={selected.has(dial.id)}
            reveal={reveal}
            isTarget={round.targets.includes(dial.id)}
            onClick={() => toggle(dial.id)}
          />
        ))}
      </div>

      {reveal ? (
        <button type="button" className="btn btn-primary self-center" onClick={nextRound} autoFocus>
          {roundIndex + 1 >= config.rounds ? t('common.finish') : t('common.next')}
        </button>
      ) : (
        <button type="button" className="btn btn-primary self-center" onClick={submit}>
          {t('common.confirm')}
        </button>
      )}
    </div>
  )
}

export const clocksModule: TrainerModule<ClocksConfig> = {
  id: 'clocks',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'dial',
  title: { it: 'Clocks', en: 'Clocks' },
  blurb: {
    it: 'Scansiona una griglia di quadranti e seleziona quelli che rispettano il criterio.',
    en: 'Scan a grid of dials and select the ones matching the criterion.',
  },
  whatItTests: {
    it: 'Attenzione selettiva e velocità percettiva: la stessa cosa che fai in cockpit quando cerchi un’indicazione fuori norma tra molti strumenti.',
    en: 'Selective attention and perceptual speed: what you do in the cockpit when scanning many instruments for one abnormal indication.',
  },
  instructions: {
    it: [
      'Il criterio combina colore e forma del marcatore: servono entrambi.',
      'I falsi allarmi penalizzano quanto le omissioni: non selezionare “a tappeto”.',
      'Scansiona per righe, sempre nello stesso ordine: è più veloce che saltare a caso.',
    ],
    en: [
      'The criterion combines marker colour and shape: both must match.',
      'False alarms cost as much as misses: do not select everything.',
      'Scan row by row, always in the same order: it beats jumping around.',
    ],
  },
  defaultConfig: { rounds: 8, dials: 12, roundMs: 20000 },
  examConfig: { rounds: 12, dials: 18, roundMs: 15000 },
  examDurationMs: 8 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: ClocksRunner,
}
