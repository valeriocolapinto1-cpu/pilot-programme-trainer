import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import { loadVoices, pickVoice, speak, cancelSpeech, speechAvailable } from '@/lib/speech'
import { Icon } from '@/components/Icon'
import { useSettings } from '@/store/settingsStore'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'
import {
  ALL_MATHS_TOPICS,
  TOPIC_LABELS,
  generateMathsSpec,
  type MathsAudioConfig,
  type MathsSpec,
} from './generate'

const TOLERANCE = 0.05

function MathsAudioRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<MathsAudioConfig>) {
  const { t, b, locale } = useI18n()
  const voiceURI = useSettings((s) => s.voiceURI)
  const speechRate = useSettings((s) => s.speechRate)

  const specs = useMemo(() => {
    const rng = createRng(seed)
    const topics = config.topics.length > 0 ? config.topics : ALL_MATHS_TOPICS
    return Array.from({ length: config.count }, (_, i) =>
      generateMathsSpec(rng, topics[i % topics.length]),
    )
  }, [config.count, config.topics, seed])

  const [index, setIndex] = useState(0)
  const [entry, setEntry] = useState('')
  const [revealed, setRevealed] = useState<{ correct: boolean; given: string } | null>(null)
  const [showWritten, setShowWritten] = useState(!speechAvailable())
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const resultsRef = useRef<{ correct: boolean; ms: number; topic: MathsSpec['topic'] }[]>([])
  const startedAtRef = useRef(performance.now())
  const finishedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const spec = specs[index]

  useEffect(() => {
    let alive = true
    loadVoices().then((list) => {
      if (alive) setVoices(list)
    })
    return () => {
      alive = false
      cancelSpeech()
    }
  }, [])

  const say = useCallback(() => {
    if (!speechAvailable()) return
    speak(b(spec.spoken), {
      locale,
      rate: speechRate,
      voice: pickVoice(voices, locale, voiceURI),
    })
  }, [b, locale, spec, speechRate, voiceURI, voices])

  // Read each question as it comes up — the exam gives them by audio only.
  useEffect(() => {
    startedAtRef.current = performance.now()
    setShowWritten(!speechAvailable())
    inputRef.current?.focus()
    if (speechAvailable() && voices.length > 0) say()
    // `say` changes with every render of spec; keying on index is what we want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, voices.length])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    cancelSpeech()
    const results = resultsRef.current
    const correct = results.filter((r) => r.correct).length

    const byTopic = new Map<string, { correct: number; total: number }>()
    for (const r of results) {
      const entryStats = byTopic.get(r.topic) ?? { correct: 0, total: 0 }
      entryStats.total += 1
      if (r.correct) entryStats.correct += 1
      byTopic.set(r.topic, entryStats)
    }

    onFinish({
      percent: results.length > 0 ? (correct / results.length) * 100 : 0,
      correct,
      total: config.count,
      avgResponseMs:
        results.length > 0 ? results.reduce((s, r) => s + r.ms, 0) / results.length : 0,
      metrics: [...byTopic.entries()].map(([topic, stats]) => ({
        label: TOPIC_LABELS[topic as MathsSpec['topic']],
        value: `${stats.correct}/${stats.total}`,
      })),
    })
  }, [config.count, onFinish])

  const advance = useCallback(() => {
    setRevealed(null)
    setEntry('')
    if (index + 1 >= specs.length) finish()
    else setIndex((i) => i + 1)
  }, [finish, index, specs.length])

  const submit = useCallback(
    (given: string) => {
      if (revealed || finishedRef.current) return
      const value = Number(given.replace(',', '.'))
      const correct = given.trim() !== '' && Math.abs(value - spec.answer) <= TOLERANCE
      resultsRef.current.push({
        correct,
        ms: performance.now() - startedAtRef.current,
        topic: spec.topic,
      })
      cancelSpeech()
      if (mode === 'exam') advance()
      else setRevealed({ correct, given })
    },
    [advance, mode, revealed, spec],
  )

  const countdown = useCountdown(config.perItemMs, index, {
    running: !revealed,
    onExpire: () => submit(''),
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="dim flex items-center justify-between text-sm">
        <span>
          {t('common.question')} {index + 1} {t('common.of')} {specs.length}
        </span>
        <span className="chip">{b(TOPIC_LABELS[spec.topic])}</span>
      </div>

      <TimerBar fraction={countdown.fraction} label={formatDuration(countdown.remaining)} />

      <div className="panel-soft flex min-h-32 flex-col items-center justify-center gap-3 p-4">
        {showWritten ? (
          <div className="text-center font-mono text-3xl font-semibold tabular-nums">
            {spec.written}
          </div>
        ) : (
          <>
            <button
              type="button"
              className="btn h-14 w-14 rounded-full p-0"
              onClick={say}
              aria-label={b({ it: 'Riascolta', en: 'Replay' }) as string}
            >
              <Icon name="audio" size={22} />
            </button>
            <span className="dim text-xs">
              {b({ it: 'Tocca per riascoltare', en: 'Tap to hear it again' })}
            </span>
          </>
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit(entry)
        }}
      >
        <input
          ref={inputRef}
          className="panel-soft focus-ring flex-1 px-3 py-2 text-center text-2xl tabular-nums"
          style={{ color: 'var(--text)' }}
          inputMode="decimal"
          autoComplete="off"
          value={entry}
          disabled={!!revealed}
          onChange={(e) => setEntry(e.target.value)}
          aria-label={t('common.answer')}
        />
        <button type="submit" className="btn btn-primary" disabled={!!revealed}>
          {t('common.confirm')}
        </button>
      </form>

      {!showWritten && !revealed ? (
        <button
          type="button"
          className="btn btn-ghost self-center text-xs"
          onClick={() => setShowWritten(true)}
        >
          {b({ it: 'Mostra il testo (ti penalizzi)', en: 'Show the text (you are cheating yourself)' })}
        </button>
      ) : null}

      {revealed ? (
        <div className="panel-soft p-3">
          <div
            className="font-semibold"
            style={{ color: revealed.correct ? 'var(--ok)' : 'var(--bad)' }}
          >
            {revealed.correct ? t('common.correct') : t('common.wrong')}
          </div>
          <p className="mt-1 text-sm">
            {spec.written} = <strong>{spec.answer}</strong>
          </p>
          <p className="dim mt-2 text-sm leading-relaxed">{b(spec.trick)}</p>
          <button type="button" className="btn btn-primary mt-3" onClick={advance} autoFocus>
            {index + 1 >= specs.length ? t('common.finish') : t('common.next')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export const mathsAudioModule: TrainerModule<MathsAudioConfig> = {
  id: 'maths-audio',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'official',
  icon: 'audio',
  title: { it: 'Matematica audio', en: 'Audio maths' },
  blurb: {
    it: 'Domande lette a voce, ~10 secondi, senza carta né calcolatrice.',
    en: 'Questions read out loud, ~10 seconds, no paper and no calculator.',
  },
  whatItTests: {
    it: 'Aritmetica mentale sotto pressione. È la priorità numero uno della preparazione: nel test reale le domande sono lette in audio, da “2 al cubo” a “27 × 29”, con potenze e percentuali.',
    en: 'Mental arithmetic under pressure. This is the number-one preparation priority: in the real test the questions are read aloud, from “2 cubed” to “27 × 29”, with powers and percentages.',
  },
  instructions: {
    it: [
      'Ascolta senza scrivere: niente carta, niente calcolatrice. È il vincolo reale.',
      'Puoi riascoltare la domanda, ma il tempo continua a scorrere.',
      'Dopo ogni risposta trovi la scorciatoia di calcolo: è quella che devi automatizzare.',
      'Se il browser non ha una voce disponibile, il testo viene mostrato scritto.',
    ],
    en: [
      'Listen without writing: no paper, no calculator. That is the real constraint.',
      'You can replay the question, but the clock keeps running.',
      'After each answer you get the mental shortcut: that is what you need to automate.',
      'If your browser has no voice available, the text is shown instead.',
    ],
  },
  defaultConfig: { count: 15, perItemMs: 15000, topics: ALL_MATHS_TOPICS },
  examConfig: { count: 45, perItemMs: 10000, topics: ALL_MATHS_TOPICS },
  examDurationMs: 12 * 60 * 1000,
  inProExam: true,
  inPracticeSet: true,
  Component: MathsAudioRunner,
}
