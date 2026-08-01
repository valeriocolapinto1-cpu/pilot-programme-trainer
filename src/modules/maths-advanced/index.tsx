import { useMemo } from 'react'
import { Quiz } from '@/components/Quiz'
import { createRng } from '@/lib/rng'
import type { ModuleRuntimeProps, QuizItem, TrainerModule } from '@/modules/types'
import {
  ADVANCED_TOPIC_LABELS,
  ALL_ADVANCED_TOPICS,
  generateAdvancedSpec,
  type MathsAdvancedConfig,
} from './generate'

function buildItems(config: MathsAdvancedConfig, seed: number): QuizItem[] {
  const rng = createRng(seed)
  const topics = config.topics.length > 0 ? config.topics : ALL_ADVANCED_TOPICS
  return Array.from({ length: config.count }, (_, i) => {
    const spec = generateAdvancedSpec(rng, topics[i % topics.length])
    return {
      id: `maths-advanced-${i}`,
      inputMode: 'numeric',
      stem: spec.question,
      numericAnswer: spec.answer,
      tolerance: spec.tolerance,
      unit: spec.unit,
      topic: ADVANCED_TOPIC_LABELS[spec.topic],
      explanation: spec.explanation,
    } satisfies QuizItem
  })
}

function MathsAdvancedRunner({
  config,
  seed,
  mode,
  onFinish,
}: ModuleRuntimeProps<MathsAdvancedConfig>) {
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

export const mathsAdvancedModule: TrainerModule<MathsAdvancedConfig> = {
  id: 'maths-advanced',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'official',
  icon: 'ruler',
  title: { it: 'Matematica avanzata', en: 'Advanced maths' },
  blurb: {
    it: 'Algebra, trigonometria, conversioni. Qui carta e calcolatrice sono ammesse.',
    en: 'Algebra, trigonometry, conversions. Here paper and calculator are allowed.',
  },
  whatItTests: {
    it: 'La seconda parte del modulo di matematica: rielaborazione di equazioni algebriche, SOHCAHTOA, rapporti e conversioni. Il tempo è più lungo perché il calcolo è più pesante.',
    en: 'The second part of the maths module: rearranging algebraic equations, SOHCAHTOA, ratios and conversions. Time is longer because the computation is heavier.',
  },
  instructions: {
    it: [
      'Tieni carta, penna e calcolatrice a portata di mano: in questa sezione sono ammesse.',
      'Scrivi la formula prima di sostituire i numeri: dimezza gli errori di segno.',
      'Le regole pratiche aeronautiche (3:1, GS × 5) tornano nel colloquio tecnico: impara anche il perché.',
    ],
    en: [
      'Keep paper, pen and calculator at hand: this section allows them.',
      'Write the formula before substituting numbers: it halves sign errors.',
      'The aviation rules of thumb (3:1, GS × 5) come back in the technical interview: learn the why too.',
    ],
  },
  defaultConfig: { count: 12, perItemMs: 90000, topics: ALL_ADVANCED_TOPICS },
  examConfig: { count: 18, perItemMs: 80000, topics: ALL_ADVANCED_TOPICS },
  examDurationMs: 25 * 60 * 1000,
  inProExam: true,
  inPracticeSet: true,
  Component: MathsAdvancedRunner,
}
