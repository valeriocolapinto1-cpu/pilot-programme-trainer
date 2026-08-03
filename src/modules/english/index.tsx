import { useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { Quiz } from '@/components/Quiz'
import { createRng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import { mono, type ModuleRuntimeProps, type QuizItem, type TrainerModule } from '@/modules/types'
import {
  ENGLISH_BANK,
  ENGLISH_PASSAGES,
  type EnglishTopic,
} from '@/data/english'

export type EnglishConfig = {
  count: number
  perItemMs: number
  topics: EnglishTopic[]
  /** Adds the timed passage-memorisation phase before the questions. */
  memorisation: boolean
  passageMs: number
}

const TOPIC_LABELS: Record<EnglishTopic, { it: string; en: string }> = {
  grammar: { it: 'Grammatica', en: 'Grammar' },
  vocabulary: { it: 'Vocabolario', en: 'Vocabulary' },
  comprehension: { it: 'Comprensione', en: 'Comprehension' },
  aviation: { it: 'Inglese aeronautico', en: 'Aviation English' },
}

export const ALL_ENGLISH_TOPICS: EnglishTopic[] = [
  'grammar',
  'vocabulary',
  'comprehension',
  'aviation',
]

function EnglishRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<EnglishConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const passage = useMemo(() => rng.pick(ENGLISH_PASSAGES), [rng])
  const [phase, setPhase] = useState<'passage' | 'quiz'>(
    config.memorisation ? 'passage' : 'quiz',
  )

  const items = useMemo(() => {
    const topics = config.topics.length > 0 ? config.topics : ALL_ENGLISH_TOPICS
    const bank = rng.shuffle(ENGLISH_BANK.filter((q) => topics.includes(q.topic)))

    const memoryItems: QuizItem[] = config.memorisation
      ? passage.questions.map((question, i) => {
          const correct = question.options[question.correctIndex]
          const shuffled = rng.shuffle(question.options)
          return {
            id: `english-passage-${i}`,
            inputMode: 'choice',
            stem: mono(question.stem),
            options: shuffled.map(mono),
            correctIndex: shuffled.indexOf(correct),
            topic: { it: 'Memorizzazione', en: 'Memorisation' },
          }
        })
      : []

    const bankItems: QuizItem[] = bank
      .slice(0, Math.max(0, config.count - memoryItems.length))
      .map((question) => {
        const correct = question.options[question.correctIndex]
        const shuffled = rng.shuffle(question.options)
        return {
          id: `english-${question.id}`,
          inputMode: 'choice',
          stem: mono(question.stem),
          options: shuffled.map(mono),
          correctIndex: shuffled.indexOf(correct),
          topic: TOPIC_LABELS[question.topic],
          explanation: mono(question.explanation),
        }
      })

    // Memorised-passage questions come first: the longer the delay, the more
    // the answers decay, and the real module does not wait either.
    return [...memoryItems, ...bankItems]
  }, [config.count, config.memorisation, config.topics, passage, rng])

  const passageTimer = useCountdown(config.passageMs, 'passage', {
    running: phase === 'passage',
    onExpire: () => setPhase('quiz'),
  })

  if (phase === 'passage') {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <TimerBar fraction={passageTimer.fraction} label={formatDuration(passageTimer.remaining)} />
        <p className="dim text-sm">
          {b({
            it: 'Memorizza il testo: sparirà e le prime domande saranno su questo, senza poterlo rileggere.',
            en: 'Memorise the text: it will disappear and the first questions are about it, with no way back.',
          })}
        </p>
        <div className="panel p-4 text-lg leading-relaxed">{passage.text}</div>
        <button type="button" className="btn self-center" onClick={() => setPhase('quiz')}>
          {t('common.continue')}
        </button>
      </div>
    )
  }

  return (
    <Quiz
      items={items}
      perItemMs={config.perItemMs}
      feedback={mode === 'exam' ? 'none' : 'immediate'}
      onFinish={onFinish}
      allowSkip={false}
    />
  )
}

export const englishModule: TrainerModule<EnglishConfig> = {
  id: 'english',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'official',
  aiSubject: 'english',
  icon: 'language',
  title: { it: 'Inglese', en: 'English' },
  blurb: {
    it: 'Grammatica, vocabolario, comprensione e memorizzazione di testi.',
    en: 'Grammar, vocabulary, comprehension and text memorisation.',
  },
  whatItTests: {
    it: 'Inglese di livello intermedio più la memorizzazione di testi, con una sezione di fraseologia aeronautica: il target minimo è ICAO Level 4, preferibile 5 o superiore. Le domande restano in inglese perché il test reale è in inglese.',
    en: 'Intermediate English plus text memorisation, with a section on aviation phraseology: the minimum target is ICAO Level 4, ideally 5 or above. The questions stay in English because the real test is in English.',
  },
  instructions: {
    it: [
      'Il testo iniziale va memorizzato: numeri, nomi e orari sono ciò che viene chiesto.',
      'Nelle domande di comprensione la risposta è sempre nel testo: non aggiungere conoscenze tue.',
      'La sezione aeronautica distingue “Roger”, “Wilco”, “Affirm” e “Cleared”: sono errori classici.',
    ],
    en: [
      'Memorise the opening text: numbers, names and times are what get asked.',
      'In comprehension questions the answer is always in the text: do not add your own knowledge.',
      'The aviation section separates “Roger”, “Wilco”, “Affirm” and “Cleared”: these are classic slips.',
    ],
  },
  defaultConfig: {
    count: 16,
    perItemMs: 45000,
    topics: ALL_ENGLISH_TOPICS,
    memorisation: true,
    passageMs: 60000,
  },
  examConfig: {
    count: 26,
    perItemMs: 35000,
    topics: ALL_ENGLISH_TOPICS,
    memorisation: true,
    passageMs: 45000,
  },
  examDurationMs: 20 * 60 * 1000,
  inProExam: true,
  inPracticeSet: true,
  Component: EnglishRunner,
}
