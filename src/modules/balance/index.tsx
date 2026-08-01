import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useI18n } from '@/i18n'
import { createRng } from '@/lib/rng'
import { formatDuration } from '@/lib/format'
import { TimerBar } from '@/components/ui'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type BalanceConfig = {
  /** Duration of every round. */
  roundMs: number
  /** Round 2 adds the colour dual-task, round 3 inverts the controls. */
  rounds: ('plain' | 'dual' | 'inverted')[]
  /** Higher is harder: how fast the ball accelerates down the slope. */
  gravity: number
}

const COLOURS = [
  { key: '1', name: { it: 'Blu', en: 'Blue' }, css: '#4da3ff' },
  { key: '2', name: { it: 'Giallo', en: 'Yellow' }, css: '#f0b429' },
  { key: '3', name: { it: 'Verde', en: 'Green' }, css: '#3ecf8e' },
  { key: '4', name: { it: 'Rosso', en: 'Red' }, css: '#ef5f6b' },
] as const

const MAX_ANGLE = 0.32
const TILT_RATE = 1.5
const FRICTION = 0.3
const TARGET_ZONE = 0.16

type Physics = {
  angle: number
  ballX: number
  ballV: number
}

type Tally = {
  onTargetMs: number
  totalMs: number
  ballsLost: number
  dualPrompts: number
  dualHits: number
}

function BalanceRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<BalanceConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [roundIndex, setRoundIndex] = useState(0)
  const [remaining, setRemaining] = useState(config.roundMs)
  const [prompt, setPrompt] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null)
  const [betweenRounds, setBetweenRounds] = useState(true)

  const physicsRef = useRef<Physics>({ angle: 0, ballX: 0, ballV: 0 })
  const commandRef = useRef(0)
  const keyRef = useRef({ left: false, right: false })
  const tallyRef = useRef<Tally>({
    onTargetMs: 0,
    totalMs: 0,
    ballsLost: 0,
    dualPrompts: 0,
    dualHits: 0,
  })
  const promptRef = useRef<{ colour: number; at: number } | null>(null)
  const nextPromptRef = useRef(0)
  const finishedRef = useRef(false)
  const roundRef = useRef(0)

  const mode3 = config.rounds[roundIndex] ?? 'plain'
  const inverted = mode3 === 'inverted'
  const dual = mode3 === 'dual'

  const finishAll = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const tally = tallyRef.current
    const onTarget = tally.totalMs > 0 ? (tally.onTargetMs / tally.totalMs) * 100 : 0
    const dualAccuracy =
      tally.dualPrompts > 0 ? (tally.dualHits / tally.dualPrompts) * 100 : null
    const base = dualAccuracy === null ? onTarget : onTarget * 0.7 + dualAccuracy * 0.3
    const percent = Math.max(0, Math.min(100, base - tally.ballsLost * 4))

    onFinish({
      percent,
      metrics: [
        {
          label: { it: 'Tempo sul bersaglio', en: 'Time on target' },
          value: `${Math.round(onTarget)}%`,
          hint: {
            it: 'Percentuale di tempo con la pallina nella zona centrale.',
            en: 'Share of time with the ball inside the centre zone.',
          },
        },
        {
          label: { it: 'Palline perse', en: 'Balls lost' },
          value: String(tally.ballsLost),
          hint: {
            it: 'Ogni pallina persa costa 4 punti percentuali.',
            en: 'Each lost ball costs 4 percentage points.',
          },
        },
        ...(dualAccuracy !== null
          ? [
              {
                label: { it: 'Doppio compito', en: 'Dual task' },
                value: `${Math.round(dualAccuracy)}%`,
                hint: {
                  it: 'Colori premuti correttamente mentre bilanciavi.',
                  en: 'Colours pressed correctly while balancing.',
                },
              },
            ]
          : []),
      ],
    })
  }, [onFinish])

  const startRound = useCallback(() => {
    physicsRef.current = { angle: 0, ballX: 0, ballV: 0 }
    commandRef.current = 0
    promptRef.current = null
    setPrompt(null)
    nextPromptRef.current = performance.now() + 2000
    setRemaining(config.roundMs)
    setBetweenRounds(false)
  }, [config.roundMs])

  const endRound = useCallback(() => {
    if (roundRef.current + 1 >= config.rounds.length) {
      finishAll()
    } else {
      roundRef.current += 1
      setRoundIndex(roundRef.current)
      setBetweenRounds(true)
    }
  }, [config.rounds.length, finishAll])

  const answerColour = useCallback((colour: number) => {
    const active = promptRef.current
    if (!active) return
    const ok = active.colour === colour
    if (ok) tallyRef.current.dualHits += 1
    promptRef.current = null
    setPrompt(null)
    setFeedback(ok ? 'ok' : 'no')
    window.setTimeout(() => setFeedback(null), 250)
  }, [])

  // Keyboard: arrows or A/D to tilt, number keys for the dual task.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keyRef.current.left = true
      else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd')
        keyRef.current.right = true
      else {
        const index = COLOURS.findIndex((c) => c.key === event.key)
        if (index >= 0) answerColour(index)
        return
      }
      event.preventDefault()
    }
    const up = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keyRef.current.left = false
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd')
        keyRef.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [answerColour])

  // Simulation and drawing loop.
  useEffect(() => {
    if (betweenRounds) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let last = performance.now()
    let left = config.roundMs
    let disturbAt = performance.now() + 1500
    let lastHudUpdate = 0

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      left -= dt * 1000
      // The HUD only needs ~10 Hz; re-rendering every frame would be wasteful.
      if (now - lastHudUpdate > 100) {
        lastHudUpdate = now
        setRemaining(Math.max(0, left))
      }

      // ---- input -------------------------------------------------------
      let command = commandRef.current
      if (keyRef.current.left) command = -1
      else if (keyRef.current.right) command = 1
      const pads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : []
      for (const pad of pads) {
        if (pad && Math.abs(pad.axes[0] ?? 0) > 0.12) command = pad.axes[0]
      }

      // ---- physics -----------------------------------------------------
      const p = physicsRef.current
      const applied = inverted ? -command : command
      p.angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, p.angle + applied * TILT_RATE * dt))

      if (now > disturbAt) {
        p.ballV += rng.float(-0.35, 0.35)
        disturbAt = now + rng.float(1200, 2600)
      }

      p.ballV += (config.gravity * Math.sin(p.angle) - FRICTION * p.ballV) * dt
      p.ballX += p.ballV * dt

      if (Math.abs(p.ballX) > 1) {
        tallyRef.current.ballsLost += 1
        p.ballX = 0
        p.ballV = 0
        p.angle = 0
      }

      tallyRef.current.totalMs += dt * 1000
      if (Math.abs(p.ballX) < TARGET_ZONE) tallyRef.current.onTargetMs += dt * 1000

      // ---- dual task ---------------------------------------------------
      if (dual) {
        const active = promptRef.current
        if (active && now - active.at > 2500) {
          promptRef.current = null
          setPrompt(null)
        } else if (!active && now > nextPromptRef.current) {
          const colour = rng.int(0, COLOURS.length - 1)
          promptRef.current = { colour, at: now }
          tallyRef.current.dualPrompts += 1
          setPrompt(colour)
          nextPromptRef.current = now + rng.float(2600, 4200)
        }
      }

      // ---- draw --------------------------------------------------------
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h * 0.6
      const beamLength = w * 0.42

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(p.angle)

      // Target zone
      ctx.fillStyle = 'rgba(77, 163, 255, 0.18)'
      ctx.fillRect(-beamLength * TARGET_ZONE, -10, beamLength * TARGET_ZONE * 2, 10)

      // Beam
      ctx.fillStyle = '#8ea3c8'
      ctx.fillRect(-beamLength, -4, beamLength * 2, 8)

      // Ball
      const ballX = p.ballX * beamLength
      ctx.beginPath()
      ctx.arc(ballX, -18, 14, 0, Math.PI * 2)
      ctx.fillStyle = Math.abs(p.ballX) < TARGET_ZONE ? '#3ecf8e' : '#f0b429'
      ctx.fill()

      ctx.restore()

      // Pivot
      ctx.beginPath()
      ctx.moveTo(cx - 18, cy + 34)
      ctx.lineTo(cx + 18, cy + 34)
      ctx.lineTo(cx, cy)
      ctx.closePath()
      ctx.fillStyle = '#5b6b8c'
      ctx.fill()

      if (left <= 0) {
        endRound()
        return
      }
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [betweenRounds, config.gravity, config.roundMs, dual, endRound, inverted, rng])

  const pointerControl = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.buttons === 0 && event.type === 'pointermove') return
    const rect = event.currentTarget.getBoundingClientRect()
    const relative = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    commandRef.current = Math.max(-1, Math.min(1, relative))
  }

  const roundLabel = {
    plain: { it: 'Bilanciamento', en: 'Balancing' },
    dual: { it: 'Bilanciamento + colori', en: 'Balancing + colours' },
    inverted: { it: 'Controlli INVERTITI', en: 'INVERTED controls' },
  }[mode3]

  if (betweenRounds) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <span className="chip">
          {t('common.round')} {roundIndex + 1} / {config.rounds.length}
        </span>
        <h3 className="text-2xl font-semibold">{b(roundLabel)}</h3>
        <p className="dim">
          {mode3 === 'dual'
            ? b({
                it: 'Continua a bilanciare e, quando compare un colore, premi il tasto corrispondente (1-4) o toccalo.',
                en: 'Keep balancing and, when a colour appears, press its key (1-4) or tap it.',
              })
            : mode3 === 'inverted'
              ? b({
                  it: 'I comandi sono invertiti: sinistra inclina a destra. Un cadetto suggerisce di incrociare le braccia.',
                  en: 'The controls are reversed: left tilts right. One cadet suggests crossing your arms.',
                })
              : b({
                  it: 'Tieni la pallina nella zona blu al centro dell’asse.',
                  en: 'Keep the ball inside the blue zone at the centre of the beam.',
                })}
        </p>
        <button type="button" className="btn btn-primary" onClick={startRound} autoFocus>
          {t('common.start')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <div className="dim flex items-center justify-between text-sm">
        <span>
          {t('common.round')} {roundIndex + 1} / {config.rounds.length} · {b(roundLabel)}
        </span>
        {inverted ? (
          <span className="chip" style={{ color: 'var(--bad)' }}>
            ⇄ {b({ it: 'invertito', en: 'inverted' })}
          </span>
        ) : null}
      </div>

      <TimerBar fraction={remaining / config.roundMs} label={formatDuration(remaining)} />

      <canvas
        ref={canvasRef}
        width={640}
        height={280}
        className="panel-soft w-full touch-none"
        style={{ aspectRatio: '640 / 280' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          pointerControl(e)
        }}
        onPointerMove={pointerControl}
        onPointerUp={() => (commandRef.current = 0)}
        onPointerCancel={() => (commandRef.current = 0)}
      />

      <p className="dim text-center text-xs">
        {b({
          it: 'Trascina sul riquadro oppure usa ← →. Se hai un gamepad, la levetta sinistra funziona.',
          en: 'Drag on the canvas or use ← →. If you have a gamepad, the left stick works.',
        })}
      </p>

      {dual ? (
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex h-16 w-full items-center justify-center rounded-lg text-lg font-bold"
            style={{
              background: prompt !== null ? COLOURS[prompt].css : 'var(--panel-soft)',
              color: prompt !== null ? '#04101f' : 'var(--text-dim)',
              border: `2px solid ${feedback === 'ok' ? 'var(--ok)' : feedback === 'no' ? 'var(--bad)' : 'var(--edge)'}`,
            }}
          >
            {prompt !== null ? b(COLOURS[prompt].name) : '—'}
          </div>
          <div className="grid w-full grid-cols-4 gap-2">
            {COLOURS.map((colour, i) => (
              <button
                key={colour.key}
                type="button"
                className="btn py-3"
                style={{ background: colour.css, color: '#04101f', borderColor: colour.css }}
                onClick={() => answerColour(i)}
              >
                {colour.key}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {mode === 'practice' ? (
        <button type="button" className="btn btn-ghost self-center" onClick={finishAll}>
          {t('common.finish')}
        </button>
      ) : null}
    </div>
  )
}

export const balanceModule: TrainerModule<BalanceConfig> = {
  id: 'balance',
  kind: 'psychomotor',
  phase: 1,
  sourceTier: 'community',
  icon: 'balance',
  title: { it: 'Balance (seesaw)', en: 'Balance (seesaw)' },
  blurb: {
    it: 'Bilancia la pallina sull’asse, poi aggiungi i colori e i controlli invertiti.',
    en: 'Balance the ball on the beam, then add colours and inverted controls.',
  },
  whatItTests: {
    it: 'Coordinazione occhio-mano e attenzione divisa. È il modulo per cui TestAir360 restituisce metriche esplicite: tempo sul bersaglio e palline perse.',
    en: 'Eye-hand coordination and divided attention. This is the module for which TestAir360 reports explicit metrics: time on target and balls lost.',
  },
  instructions: {
    it: [
      'Correggi presto e poco: le correzioni grandi e tardive fanno cadere la pallina.',
      'Guarda la pallina, non l’asse: anticipi il movimento invece di inseguirlo.',
      'Nel round a colori il bilanciamento resta la priorità: perdere la pallina costa più di un colore mancato.',
      'Nel round invertito rallenta: meglio piccole correzioni corrette che riflessi veloci sbagliati.',
    ],
    en: [
      'Correct early and small: large late corrections are what drop the ball.',
      'Watch the ball, not the beam: you anticipate the movement instead of chasing it.',
      'In the colour round balancing stays the priority: losing the ball costs more than a missed colour.',
      'In the inverted round slow down: small correct inputs beat fast wrong reflexes.',
    ],
  },
  defaultConfig: {
    roundMs: 45000,
    rounds: ['plain', 'dual', 'inverted'],
    gravity: 3,
  },
  examConfig: {
    roundMs: 60000,
    rounds: ['plain', 'dual', 'inverted'],
    gravity: 3.6,
  },
  examDurationMs: 9 * 60 * 1000,
  inProExam: true,
  inPracticeSet: true,
  Component: BalanceRunner,
}
