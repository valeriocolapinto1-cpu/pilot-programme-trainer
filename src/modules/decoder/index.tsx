import { useMemo } from 'react'
import { Quiz } from '@/components/Quiz'
import { createRng } from '@/lib/rng'
import { mono, type ModuleRuntimeProps, type QuizItem, type TrainerModule } from '@/modules/types'
import { generateDecoderSpec, patternOf, type DecoderConfig } from './generate'

function buildItems(config: DecoderConfig, seed: number): QuizItem[] {
  const rng = createRng(seed)
  return Array.from({ length: config.count }, (_, i) => {
    const spec = generateDecoderSpec(rng, config)
    return {
      id: `decoder-${i}`,
      inputMode: 'choice',
      stem: {
        it: 'Quale parola ripete le lettere nelle stesse posizioni in cui la sequenza ripete i simboli?',
        en: 'Which word repeats its letters in the same positions where the sequence repeats symbols?',
      },
      visual: (
        <div className="flex gap-3 text-4xl" aria-label={spec.symbols.join(' ')}>
          {spec.symbols.map((symbol, index) => (
            <span key={index}>{symbol}</span>
          ))}
        </div>
      ),
      options: spec.options.map(mono),
      correctIndex: spec.correctIndex,
      explanation: {
        it: `Schema della sequenza: ${patternOf(spec.symbols)} (0 = primo simbolo distinto, 1 = secondo, e così via). Solo "${spec.options[spec.correctIndex]}" ha lo stesso schema.`,
        en: `Sequence pattern: ${patternOf(spec.symbols)} (0 = first distinct symbol, 1 = second, and so on). Only "${spec.options[spec.correctIndex]}" has the same pattern.`,
      },
    } satisfies QuizItem
  })
}

function DecoderRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<DecoderConfig>) {
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

export const decoderModule: TrainerModule<DecoderConfig> = {
  id: 'decoder',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'cipher',
  title: { it: 'Decoder', en: 'Decoder' },
  blurb: {
    it: 'Sequenze di simboli senza chiave: conta solo lo schema delle ripetizioni.',
    en: 'Symbol sequences with no key: only the repetition pattern matters.',
  },
  whatItTests: {
    it: 'Velocità percettiva e riconoscimento di pattern. Non serve decifrare i simboli: serve vedere dove si ripetono.',
    en: 'Perceptual speed and pattern matching. You do not decode the symbols: you spot where they repeat.',
  },
  instructions: {
    it: [
      'Non esiste una chiave simbolo→lettera: cercarla fa perdere tempo.',
      'Guarda solo quali posizioni contengono lo stesso simbolo.',
      'Esempio: ◆ ▲ ◆ ● → schema 1-2-1-3 → la parola giusta ha la 1ª e la 3ª lettera uguali.',
    ],
    en: [
      'There is no symbol-to-letter key: looking for one wastes time.',
      'Only look at which positions contain the same symbol.',
      'Example: ◆ ▲ ◆ ● → pattern 1-2-1-3 → the right word has the 1st and 3rd letters the same.',
    ],
  },
  defaultConfig: { count: 15, perItemMs: 20000, length: 5 },
  examConfig: { count: 25, perItemMs: 15000, length: 6 },
  examDurationMs: 9 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: DecoderRunner,
}
