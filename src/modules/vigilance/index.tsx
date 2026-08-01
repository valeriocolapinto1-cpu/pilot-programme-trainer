import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type VigilanceConfig = {
  durationMs: number
  /** Time between pointer steps. */
  stepMs: number
  /** Probability that a step is a double jump (the target event). */
  targetRate: number
  /** How long after a double jump a press still counts as a hit. */
  windowMs: number
}

const STEPS = 24

/**
 * Mackworth clock: a pointer steps around a dial once per second and now and
 * then skips a position. Press when it skips. Nothing else happens for minutes
 * at a time — which is the whole point of a monotony-tolerance test.
 */
function VigilanceRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<VigilanceConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const [position, setPosition] = useState(0)
  const [flash, setFlash] = useState<'hit' | 'miss' | 'false' | null>(null)
  const [running, setRunning] = useState(true)

  const statsRef = useRef({ hits: 0, misses: 0, falseAlarms: 0, targets: 0, rtSum: 0 })
  /** Timestamp of the last double jump still inside its response window. */
  const pendingTargetRef = useRef<number | null>(null)
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setRunning(false)
    const { hits, misses, falseAlarms, targets, rtSum } = statsRef.current
    const raw = targets > 0 ? (hits - falseAlarms * 0.5) / targets : 0
    onFinish({
      percent: Math.max(0, Math.min(1, raw)) * 100,
      correct: hits,
      total: targets,
      avgResponseMs: hits > 0 ? rtSum / hits : 0,
      metrics: [
        { label: { it: 'Mancati', en: 'Missed' }, value: String(misses) },
        {
          label: { it: 'Falsi allarmi', en: 'False alarms' },
          value: String(falseAlarms),
          hint: {
            it: 'Pressioni senza un doppio salto: penalizzano metà di un mancato.',
            en: 'Presses with no double jump: they cost half a miss.',
          },
        },
      ],
    })
  }, [onFinish])

  const timer = useCountdown(config.durationMs, 'vigilance', {
    running,
    onExpire: finish,
  })

  // Pointer stepping. Each tick decides whether it is a normal or double step.
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      // A target that was never answered becomes a miss once its window closes.
      const pending = pendingTargetRef.current
      if (pending != null && performance.now() - pending > config.windowMs) {
        statsRef.current.misses += 1
        pendingTargetRef.current = null
        setFlash('miss')
        window.setTimeout(() => setFlash(null), 250)
      }

      const isTarget = rng.next() < config.targetRate
      setPosition((p) => (p + (isTarget ? 2 : 1)) % STEPS)
      if (isTarget) {
        statsRef.current.targets += 1
        pendingTargetRef.current = performance.now()
      }
    }, config.stepMs)
    return () => window.clearInterval(id)
  }, [running, config.stepMs, config.targetRate, config.windowMs, rng])

  const press = useCallback(() => {
    if (!running) return
    const pending = pendingTargetRef.current
    if (pending != null && performance.now() - pending <= config.windowMs) {
      statsRef.current.hits += 1
      statsRef.current.rtSum += performance.now() - pending
      pendingTargetRef.current = null
      setFlash('hit')
    } else {
      statsRef.current.falseAlarms += 1
      setFlash('false')
    }
    window.setTimeout(() => setFlash(null), 250)
  }, [config.windowMs, running])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault()
        press()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  const size = 240
  const centre = size / 2
  const angle = (position / STEPS) * 360 - 90
  const px = centre + (centre - 34) * Math.cos((angle * Math.PI) / 180)
  const py = centre + (centre - 34) * Math.sin((angle * Math.PI) / 180)

  const flashColour =
    flash === 'hit' ? 'var(--ok)' : flash === 'false' ? 'var(--bad)' : flash === 'miss' ? 'var(--warn)' : 'var(--edge)'

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <TimerBar fraction={timer.fraction} label={formatDuration(timer.remaining)} />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="vigilance dial">
        <circle
          cx={centre}
          cy={centre}
          r={centre - 6}
          fill="var(--panel-soft)"
          stroke={flashColour}
          strokeWidth="3"
        />
        {Array.from({ length: STEPS }, (_, i) => {
          const a = ((i / STEPS) * 360 - 90) * (Math.PI / 180)
          return (
            <circle
              key={i}
              cx={centre + (centre - 34) * Math.cos(a)}
              cy={centre + (centre - 34) * Math.sin(a)}
              r={4}
              fill="var(--edge)"
            />
          )
        })}
        <circle cx={px} cy={py} r={11} fill="var(--accent)" />
        <line
          x1={centre}
          y1={centre}
          x2={px}
          y2={py}
          stroke="var(--accent)"
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>

      <button
        type="button"
        className="btn btn-primary w-full py-4 text-lg"
        onClick={press}
        onTouchStart={(e) => {
          e.preventDefault()
          press()
        }}
      >
        {b({ it: 'SALTO DOPPIO (spazio)', en: 'DOUBLE JUMP (space)' })}
      </button>

      <p className="dim text-center text-sm">
        {b({
          it: 'Premi solo quando il punto salta due posizioni invece di una.',
          en: 'Press only when the dot skips two positions instead of one.',
        })}
      </p>

      {mode === 'practice' ? (
        <button type="button" className="btn btn-ghost" onClick={finish}>
          {t('common.finish')}
        </button>
      ) : null}
    </div>
  )
}

export const vigilanceModule: TrainerModule<VigilanceConfig> = {
  id: 'vigilance',
  kind: 'psychomotor',
  phase: 1,
  sourceTier: 'official',
  icon: 'eye',
  title: { it: 'Vigilanza', en: 'Vigilance' },
  blurb: {
    it: 'Attenzione sostenuta: pochi eventi rari in molti minuti di monotonia.',
    en: 'Sustained attention: a few rare events across many monotonous minutes.',
  },
  whatItTests: {
    it: 'Tolleranza alla monotonia, una delle dimensioni cognitive citate ufficialmente da Wizz Air. È il test che assomiglia di più alla crociera: non succede quasi niente, e proprio per questo si perde la vigilanza.',
    en: 'Monotony tolerance, one of the cognitive dimensions Wizz Air names officially. It is the test closest to the cruise: almost nothing happens, which is exactly why attention drifts.',
  },
  instructions: {
    it: [
      'Il punto avanza di una posizione alla volta, circa una volta al secondo.',
      'Ogni tanto ne salta due: premi spazio (o il pulsante) entro pochi istanti.',
      'Premere “a caso” peggiora il punteggio: ogni falso allarme conta.',
      'Non distogliere lo sguardo: il calo di prestazione dopo il terzo minuto è la parte misurata.',
    ],
    en: [
      'The dot advances one position at a time, about once a second.',
      'Every so often it skips two: press space (or the button) within a moment.',
      'Pressing at random makes it worse: every false alarm counts.',
      'Do not look away: the drop in performance after the third minute is the part being measured.',
    ],
  },
  defaultConfig: { durationMs: 3 * 60 * 1000, stepMs: 1000, targetRate: 0.06, windowMs: 1500 },
  examConfig: { durationMs: 6 * 60 * 1000, stepMs: 1000, targetRate: 0.045, windowMs: 1400 },
  examDurationMs: 10 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: VigilanceRunner,
}
