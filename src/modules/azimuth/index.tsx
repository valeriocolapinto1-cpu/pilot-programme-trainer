import { useMemo } from 'react'
import { Quiz } from '@/components/Quiz'
import { createRng } from '@/lib/rng'
import { mono, type ModuleRuntimeProps, type QuizItem, type TrainerModule } from '@/modules/types'
import { Compass, ClockFace } from './Compass'
import {
  AZIMUTH_PROMPTS,
  generateAzimuthSpec,
  type AzimuthConfig,
  type AzimuthVariant,
} from './generate'

const ALL_VARIANTS: AzimuthVariant[] = ['heading', 'relative', 'clock-traffic', 'clock-read']

function buildItems(config: AzimuthConfig, seed: number): QuizItem[] {
  const rng = createRng(seed)
  const variants = config.variants.length > 0 ? config.variants : ALL_VARIANTS

  return Array.from({ length: config.count }, (_, i) => {
    const variant = variants[i % variants.length]
    const spec = generateAzimuthSpec(rng, variant)
    const visual =
      spec.variant === 'clock-read' ? (
        <ClockFace hours={spec.hours} minutes={spec.minutes} rotation={spec.rotation} />
      ) : (
        <Compass
          heading={spec.heading}
          targetBearing={spec.variant === 'heading' ? undefined : spec.targetBearing}
        />
      )

    return {
      id: `azimuth-${i}`,
      inputMode: 'choice',
      stem: AZIMUTH_PROMPTS[spec.variant],
      visual,
      options: spec.options.map(mono),
      correctIndex: spec.correctIndex,
      explanation:
        spec.variant === 'relative'
          ? {
              it: `Prua ${String(spec.heading).padStart(3, '0')}° + rilevamento relativo del traffico = rilevamento vero. Ricorda: si somma, non si sottrae.`,
              en: `Heading ${String(spec.heading).padStart(3, '0')}° + the traffic's relative bearing = true bearing. Remember: add, do not subtract.`,
            }
          : spec.variant === 'clock-traffic'
            ? {
                it: 'Ogni posizione oraria copre 30°: dividi il rilevamento relativo per 30 e arrotonda.',
                en: 'Each clock position covers 30°: divide the relative bearing by 30 and round.',
              }
            : undefined,
    } satisfies QuizItem
  })
}

function AzimuthRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<AzimuthConfig>) {
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

export const azimuthModule: TrainerModule<AzimuthConfig> = {
  id: 'azimuth',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'compass',
  title: { it: 'Azimuth', en: 'Azimuth' },
  blurb: {
    it: 'Bussola in orientamento non standard, rilevamenti e posizioni orarie.',
    en: 'Compass in a non-standard orientation, bearings and clock positions.',
  },
  whatItTests: {
    it: 'Orientamento spaziale. Nel test reale la bussola è mostrata ruotata e si deve identificare la direzione corretta, con una variante “clock-style”. Circa 10 minuti, fino a 50 domande, 6 opzioni.',
    en: 'Spatial orientation. In the real test the compass is shown rotated and you identify the correct direction, with a “clock-style” variant. About 10 minutes, up to 50 questions, 6 options.',
  },
  instructions: {
    it: [
      'La rosa dei venti ruota: la prua è il valore sotto l’indice fisso in alto.',
      'Il triangolo giallo è un traffico: il suo rilevamento vero è prua + rilevamento relativo.',
      'Nella variante orologio il quadrante è ruotato e il triangolo blu segna le 12.',
      'Usa i tasti da 1 a 6 per rispondere più in fretta.',
    ],
    en: [
      'The compass card rotates: your heading is the value under the fixed index at the top.',
      'The yellow triangle is traffic: its true bearing is heading + relative bearing.',
      'In the clock variant the dial is rotated and the blue triangle marks 12 o’clock.',
      'Use keys 1 to 6 to answer faster.',
    ],
  },
  defaultConfig: { count: 20, perItemMs: 15000, variants: ALL_VARIANTS },
  examConfig: { count: 50, perItemMs: 12000, variants: ALL_VARIANTS },
  examDurationMs: 12 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: AzimuthRunner,
}
