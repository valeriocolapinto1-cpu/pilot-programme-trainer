import { useMemo } from 'react'
import { Quiz } from '@/components/Quiz'
import { createRng } from '@/lib/rng'
import { mono, type ModuleRuntimeProps, type QuizItem, type TrainerModule } from '@/modules/types'
import { generateEquateSpec, type EquateConfig } from './generate'

function buildItems(config: EquateConfig, seed: number): QuizItem[] {
  const rng = createRng(seed)
  return Array.from({ length: config.count }, (_, i) => {
    const spec = generateEquateSpec(rng, config)
    return {
      id: `equate-${i}`,
      inputMode: 'choice',
      visual: (
        <div className="font-mono text-3xl font-semibold tabular-nums sm:text-4xl">
          {spec.display}
        </div>
      ),
      stem:
        spec.kind === 'operator'
          ? { it: 'Quale operatore completa l’uguaglianza?', en: 'Which operator completes the equation?' }
          : { it: 'Quale valore completa l’uguaglianza?', en: 'Which value completes the equation?' },
      options: spec.options.map(mono),
      correctIndex: spec.correctIndex,
    } satisfies QuizItem
  })
}

function EquateRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<EquateConfig>) {
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

export const equateModule: TrainerModule<EquateConfig> = {
  id: 'equate',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'equation',
  title: { it: 'Equate', en: 'Equate' },
  blurb: {
    it: 'Equazioni con un operatore o un valore mancante, a tempo.',
    en: 'Equations with a missing operator or value, against the clock.',
  },
  whatItTests: {
    it: 'Ragionamento numerico e aritmetica mentale. Nella versione difficile conta la precedenza degli operatori: la moltiplicazione prima di somma e sottrazione.',
    en: 'Numerical reasoning and mental arithmetic. In the hard version operator precedence matters: multiplication before addition and subtraction.',
  },
  instructions: {
    it: [
      'Stima prima l’ordine di grandezza: spesso esclude subito metà delle opzioni.',
      'Se il risultato è molto più grande degli operandi, l’operatore è ×.',
      'Con tre operandi ricorda la precedenza: × si calcola prima di + e −.',
    ],
    en: [
      'Estimate the order of magnitude first: it often rules out half the options immediately.',
      'If the result is far bigger than the operands, the operator is ×.',
      'With three operands remember precedence: × is evaluated before + and −.',
    ],
  },
  defaultConfig: { count: 20, perItemMs: 15000, hard: false },
  examConfig: { count: 25, perItemMs: 12000, hard: true },
  examDurationMs: 8 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: EquateRunner,
}
