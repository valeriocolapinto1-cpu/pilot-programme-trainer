import { useMemo } from 'react'
import { Quiz } from '@/components/Quiz'
import { createRng } from '@/lib/rng'
import type { ModuleRuntimeProps, QuizItem, TrainerModule } from '@/modules/types'
import { ALL_ATPL_TOPICS, ATPL_BANK, ATPL_TOPIC_LABELS, type AtplTopic } from '@/data/atpl'
import { generateMetar, metarQuestions } from './metar'

export type AtplConfig = {
  count: number
  perItemMs: number
  topics: AtplTopic[]
  /** How many of the questions come from a freshly generated METAR. */
  metarQuestions: number
}

function buildItems(config: AtplConfig, seed: number): QuizItem[] {
  const rng = createRng(seed)
  const items: QuizItem[] = []

  if (config.metarQuestions > 0) {
    const metar = generateMetar(rng)
    const visual = (
      <div className="panel-soft w-full overflow-x-auto p-3 text-center font-mono text-sm sm:text-base">
        {metar.raw}
      </div>
    )
    for (const question of metarQuestions(rng, metar).slice(0, config.metarQuestions)) {
      items.push({
        id: `atpl-metar-${items.length}`,
        inputMode: 'choice',
        stem: question.stem,
        visual,
        options: question.options,
        correctIndex: question.correctIndex,
        topic: { it: 'METAR', en: 'METAR' },
        explanation: question.explanation,
      })
    }
  }

  const topics = config.topics.length > 0 ? config.topics : ALL_ATPL_TOPICS
  const bank = rng.shuffle(ATPL_BANK.filter((q) => topics.includes(q.topic)))

  for (const question of bank.slice(0, Math.max(0, config.count - items.length))) {
    const correct = question.options[question.correctIndex]
    const shuffled = rng.shuffle(question.options)
    items.push({
      id: `atpl-${question.id}`,
      inputMode: 'choice',
      stem: question.stem,
      options: shuffled,
      correctIndex: shuffled.indexOf(correct),
      topic: ATPL_TOPIC_LABELS[question.topic],
      explanation: question.explanation,
    })
  }

  return items
}

function AtplRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<AtplConfig>) {
  const items = useMemo(() => buildItems(config, seed), [config, seed])
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

export const atplTechnicalModule: TrainerModule<AtplConfig> = {
  id: 'atpl-technical',
  kind: 'quiz',
  phase: 4,
  sourceTier: 'community',
  aiSubject: 'atpl',
  icon: 'aircraft',
  title: { it: 'Colloquio tecnico ATPL', en: 'ATPL technical interview' },
  blurb: {
    it: 'METAR generati ogni volta diversi, distanze di pista, velocità V, altimetria, sistemi.',
    en: 'Freshly generated METARs, runway distances, V-speeds, altimetry, systems.',
  },
  whatItTests: {
    it: 'Gli argomenti tecnici riportati dai candidati 2024-2025: decodifica METAR/TAF, TORA/TODA/ASDA/LDA, funzionamento del turbofan, categorie di illuminazione, altitudine di pressione e densità, carburante per l’alternato, V1/VR/V2 e criteri di approccio stabilizzato. Gli assessor valutano come ragioni nell’incertezza, non la memoria di numeri regolamentari.',
    en: 'The technical topics reported by 2024-2025 candidates: METAR/TAF decoding, TORA/TODA/ASDA/LDA, how a turbofan works, airport lighting categories, pressure and density altitude, alternate fuel, V1/VR/V2 and stabilised approach criteria. Assessors judge how you reason under uncertainty, not your recall of regulatory numbers.',
  },
  instructions: {
    it: [
      'Il METAR è generato ogni volta: la risposta si ricava sempre dalla stringa a schermo.',
      'Al colloquio dì ad alta voce come arrivi alla risposta: è quello che valutano davvero.',
      'Se non sai un numero, di’ come lo troveresti: manuale, carta, ATIS. È una risposta accettabile.',
    ],
    en: [
      'The METAR is generated fresh each time: the answer is always derivable from the string on screen.',
      'In the interview, say your reasoning out loud: that is what is really being assessed.',
      'If you do not know a number, say how you would find it: manual, chart, ATIS. That is an acceptable answer.',
    ],
  },
  defaultConfig: {
    count: 16,
    perItemMs: 60000,
    topics: ALL_ATPL_TOPICS,
    metarQuestions: 5,
  },
  examConfig: {
    count: 20,
    perItemMs: 45000,
    topics: ALL_ATPL_TOPICS,
    metarQuestions: 6,
  },
  examDurationMs: 15 * 60 * 1000,
  inProExam: false,
  inPracticeSet: false,
  Component: AtplRunner,
}
