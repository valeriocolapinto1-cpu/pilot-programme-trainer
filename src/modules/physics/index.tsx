import { useMemo } from 'react'
import { Quiz } from '@/components/Quiz'
import { createRng, buildOptions, type Rng } from '@/lib/rng'
import type { Bilingual } from '@/i18n'
import { mono, type ModuleRuntimeProps, type QuizItem, type TrainerModule } from '@/modules/types'
import {
  ALL_PHYSICS_TOPICS,
  PHYSICS_BANK,
  PHYSICS_TOPIC_LABELS,
  type PhysicsTopic,
} from '@/data/physics'

export type PhysicsConfig = {
  count: number
  perItemMs: number
  topics: PhysicsTopic[]
  /** Share of questions that are freshly generated numeric problems. */
  numericRatio: number
}

type NumericSpec = {
  topic: PhysicsTopic
  stem: Bilingual
  answer: number
  distractors: number[]
  unit: string
  explanation: Bilingual
}

/**
 * Numeric problems are generated so the bank cannot be learnt by heart. Each
 * one uses the same formulas the official syllabus lists.
 */
function generateNumeric(rng: Rng, topic: PhysicsTopic): NumericSpec {
  switch (topic) {
    case 'kinematics': {
      const a = rng.int(2, 9)
      const t = rng.int(3, 12)
      const s = 0.5 * a * t * t
      return {
        topic,
        stem: {
          it: `Un corpo parte da fermo con accelerazione costante di ${a} m/s². Che distanza percorre in ${t} s?`,
          en: `A body starts from rest with a constant acceleration of ${a} m/s². How far does it travel in ${t} s?`,
        },
        answer: s,
        distractors: [a * t, 2 * s, s / 2, a * t * t],
        unit: 'm',
        explanation: {
          it: `s = ½at² = ½ × ${a} × ${t}² = ${s} m.`,
          en: `s = ½at² = ½ × ${a} × ${t}² = ${s} m.`,
        },
      }
    }

    case 'forces': {
      const m = rng.int(5, 40) * 100
      const v = rng.int(10, 40)
      const r = rng.int(2, 12) * 25
      const f = (m * v * v) / r
      return {
        topic,
        stem: {
          it: `Una massa di ${m} kg percorre una curva di raggio ${r} m a ${v} m/s. Quale forza centripeta serve?`,
          en: `A ${m} kg mass corners on a ${r} m radius at ${v} m/s. What centripetal force is needed?`,
        },
        answer: f,
        distractors: [(m * v) / r, (m * v * v) / (r * r), m * v * v, f / 2],
        unit: 'N',
        explanation: {
          it: `F = mv²/r = ${m} × ${v}² / ${r} = ${f} N.`,
          en: `F = mv²/r = ${m} × ${v}² / ${r} = ${f} N.`,
        },
      }
    }

    case 'energy': {
      const m = rng.int(2, 40)
      const v = rng.int(3, 25)
      const ek = 0.5 * m * v * v
      return {
        topic,
        stem: {
          it: `Quale energia cinetica ha una massa di ${m} kg che viaggia a ${v} m/s?`,
          en: `What kinetic energy does a ${m} kg mass have travelling at ${v} m/s?`,
        },
        answer: ek,
        distractors: [m * v, 2 * ek, m * v * v * 2, ek / 2],
        unit: 'J',
        explanation: {
          it: `Ek = ½mv² = ½ × ${m} × ${v}² = ${ek} J.`,
          en: `Ek = ½mv² = ½ × ${m} × ${v}² = ${ek} J.`,
        },
      }
    }

    case 'statics': {
      const load = rng.int(2, 30) * 100
      const total = load
      return {
        topic,
        stem: {
          it: `Una trave simmetrica poggia su due sostegni e porta un carico centrato di ${load} N. Quale reazione su ciascun sostegno?`,
          en: `A symmetric beam rests on two supports with a centred load of ${load} N. What is the reaction at each support?`,
        },
        answer: total / 2,
        distractors: [total, total / 4, total * 2],
        unit: 'N',
        explanation: {
          it: `Per simmetria ogni sostegno regge metà del carico: ${total} / 2 = ${total / 2} N.`,
          en: `By symmetry each support carries half the load: ${total} / 2 = ${total / 2} N.`,
        },
      }
    }

    case 'rotation': {
      const f = rng.int(10, 90)
      const d = rng.int(2, 20) / 10
      const moment = Math.round(f * d * 100) / 100
      return {
        topic,
        stem: {
          it: `Una forza di ${f} N agisce perpendicolarmente a ${d} m dal fulcro. Quanto vale il momento?`,
          en: `A ${f} N force acts perpendicular to the arm, ${d} m from the pivot. What is the moment?`,
        },
        answer: moment,
        distractors: [f + d, f / d, moment * 2, f * d * d],
        unit: 'N·m',
        explanation: {
          it: `M = F × d = ${f} × ${d} = ${moment} N·m.`,
          en: `M = F × d = ${f} × ${d} = ${moment} N·m.`,
        },
      }
    }

    case 'temperature': {
      const altitude = rng.int(2, 30) * 1000
      const seaLevel = 15
      const temp = Math.round((seaLevel - (altitude / 1000) * 1.98) * 10) / 10
      return {
        topic,
        stem: {
          it: `In atmosfera standard ISA (15 °C al livello del mare, −1,98 °C/1000 ft), quale temperatura a ${altitude.toLocaleString('it-IT')} ft?`,
          en: `In the ISA standard atmosphere (15 °C at sea level, −1.98 °C/1000 ft), what temperature at ${altitude.toLocaleString('en-GB')} ft?`,
        },
        answer: temp,
        distractors: [temp + 10, temp - 10, -temp, temp + 5],
        unit: '°C',
        explanation: {
          it: `T = 15 − 1,98 × ${altitude / 1000} = ${temp} °C.`,
          en: `T = 15 − 1.98 × ${altitude / 1000} = ${temp} °C.`,
        },
      }
    }

    case 'heat': {
      const m = rng.int(1, 12)
      const dT = rng.int(2, 40)
      const c = 4200
      const q = m * c * dT
      return {
        topic,
        stem: {
          it: `Quanto calore serve per scaldare ${m} kg d’acqua di ${dT} °C? (c = 4200 J/kg·°C)`,
          en: `How much heat is needed to raise ${m} kg of water by ${dT} °C? (c = 4200 J/kg·°C)`,
        },
        answer: q,
        distractors: [m * c, c * dT, q * 2, q / 2],
        unit: 'J',
        explanation: {
          it: `Q = mcΔT = ${m} × 4200 × ${dT} = ${q.toLocaleString('it-IT')} J.`,
          en: `Q = mcΔT = ${m} × 4200 × ${dT} = ${q.toLocaleString('en-GB')} J.`,
        },
      }
    }

    case 'waves': {
      const f = rng.int(2, 40) * 25
      const lambda = rng.int(2, 30) / 10
      const v = Math.round(f * lambda * 100) / 100
      return {
        topic,
        stem: {
          it: `Un’onda ha frequenza ${f} Hz e lunghezza d’onda ${lambda} m. Qual è la sua velocità?`,
          en: `A wave has a frequency of ${f} Hz and a wavelength of ${lambda} m. What is its speed?`,
        },
        answer: v,
        distractors: [f / lambda, f + lambda, v / 2, lambda / f],
        unit: 'm/s',
        explanation: {
          it: `v = fλ = ${f} × ${lambda} = ${v} m/s.`,
          en: `v = fλ = ${f} × ${lambda} = ${v} m/s.`,
        },
      }
    }

    case 'electric-fields': {
      const q = rng.int(2, 20)
      const e = rng.int(10, 90) * 10
      const force = q * e
      return {
        topic,
        stem: {
          it: `Una carica di ${q} C si trova in un campo elettrico di ${e} N/C. Quale forza subisce?`,
          en: `A charge of ${q} C sits in an electric field of ${e} N/C. What force does it feel?`,
        },
        answer: force,
        distractors: [e / q, q + e, force / 2, force * 2],
        unit: 'N',
        explanation: {
          it: `F = qE = ${q} × ${e} = ${force} N.`,
          en: `F = qE = ${q} × ${e} = ${force} N.`,
        },
      }
    }

    case 'circuits': {
      const kind = rng.int(0, 2)
      if (kind === 0) {
        const r = rng.int(2, 40)
        const i = rng.int(1, 12)
        const v = r * i
        return {
          topic,
          stem: {
            it: `Quale tensione serve per far circolare ${i} A in un resistore da ${r} Ω?`,
            en: `What voltage drives ${i} A through a ${r} Ω resistor?`,
          },
          answer: v,
          distractors: [r / i, i / r, v * 2, r + i],
          unit: 'V',
          explanation: {
            it: `V = RI = ${r} × ${i} = ${v} V.`,
            en: `V = RI = ${r} × ${i} = ${v} V.`,
          },
        }
      }
      if (kind === 1) {
        const r1 = rng.int(2, 30)
        const r2 = rng.int(2, 30)
        const parallel = Math.round(((r1 * r2) / (r1 + r2)) * 100) / 100
        return {
          topic,
          stem: {
            it: `Due resistori da ${r1} Ω e ${r2} Ω in parallelo: quale resistenza equivalente?`,
            en: `Two resistors of ${r1} Ω and ${r2} Ω in parallel: what is the equivalent resistance?`,
          },
          answer: parallel,
          distractors: [r1 + r2, (r1 + r2) / 2, Math.abs(r1 - r2), parallel * 2],
          unit: 'Ω',
          explanation: {
            it: `Req = (R₁ × R₂)/(R₁ + R₂) = (${r1} × ${r2})/${r1 + r2} = ${parallel} Ω. In parallelo è sempre minore della più piccola.`,
            en: `Req = (R₁ × R₂)/(R₁ + R₂) = (${r1} × ${r2})/${r1 + r2} = ${parallel} Ω. In parallel it is always lower than the smallest.`,
          },
        }
      }
      const v = rng.pick([12, 24, 28, 115])
      const i = rng.int(2, 15)
      const p = v * i
      return {
        topic,
        stem: {
          it: `Un’utenza assorbe ${i} A a ${v} V. Quale potenza dissipa?`,
          en: `A load draws ${i} A at ${v} V. What power does it dissipate?`,
        },
        answer: p,
        distractors: [v / i, v + i, p / 2, p * 2],
        unit: 'W',
        explanation: {
          it: `P = VI = ${v} × ${i} = ${p} W.`,
          en: `P = VI = ${v} × ${i} = ${p} W.`,
        },
      }
    }
  }
}

function buildItems(config: PhysicsConfig, seed: number): QuizItem[] {
  const rng = createRng(seed)
  const topics = config.topics.length > 0 ? config.topics : ALL_PHYSICS_TOPICS
  const numericCount = Math.round(config.count * config.numericRatio)

  const bank = rng.shuffle(PHYSICS_BANK.filter((q) => topics.includes(q.topic)))
  const items: QuizItem[] = []

  for (let i = 0; i < config.count; i++) {
    const wantNumeric = i < numericCount || bank.length === 0
    if (wantNumeric) {
      const spec = generateNumeric(rng, topics[i % topics.length])
      const format = (value: number) =>
        `${Number.isInteger(value) ? value.toLocaleString('en-GB') : value} ${spec.unit}`
      const { options, correctIndex } = buildOptions(
        rng,
        spec.answer,
        spec.distractors.filter((d) => Number.isFinite(d)).map((d) => Math.round(d * 100) / 100),
        4,
      )
      items.push({
        id: `physics-num-${i}`,
        inputMode: 'choice',
        stem: spec.stem,
        options: options.map((value) => mono(format(value))),
        correctIndex,
        topic: PHYSICS_TOPIC_LABELS[spec.topic],
        explanation: spec.explanation,
      })
    } else {
      const question = bank.pop()
      if (!question) continue
      // Shuffle the options so the answer is never in a fixed position.
      const correct = question.options[question.correctIndex]
      const shuffled = rng.shuffle(question.options)
      items.push({
        id: `physics-${question.id}`,
        inputMode: 'choice',
        stem: question.stem,
        options: shuffled,
        correctIndex: shuffled.indexOf(correct),
        topic: PHYSICS_TOPIC_LABELS[question.topic],
        explanation: question.explanation,
      })
    }
  }

  return rng.shuffle(items)
}

function PhysicsRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<PhysicsConfig>) {
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

export const physicsModule: TrainerModule<PhysicsConfig> = {
  id: 'physics',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'official',
  aiSubject: 'physics',
  icon: 'atom',
  title: { it: 'Fisica', en: 'Physics' },
  blurb: {
    it: 'Il syllabus ufficiale Wizz Air: dieci argomenti di fisica liceale applicata.',
    en: 'The official Wizz Air syllabus: ten topics of applied high-school physics.',
  },
  whatItTests: {
    it: 'Fisica di livello liceale sui dieci argomenti che Wizz Air pubblica: cinematica, forze e moto circolare, lavoro/energia/quantità di moto, statica, momenti e rotazione, temperatura, calore, onde e suono, campi elettrici, circuiti.',
    en: 'High-school physics across the ten topics Wizz Air publishes: kinematics, forces and circular motion, work/energy/momentum, statics, torque and rotation, temperature, heat, waves and sound, electric fields, circuits.',
  },
  instructions: {
    it: [
      'Metà delle domande sono numeriche e generate ogni volta diverse: non si imparano a memoria.',
      'Prima di calcolare, scrivi la formula: gli assessor valutano il ragionamento, non i numeri.',
      'Le spiegazioni contengono l’applicazione aeronautica: servono anche al colloquio tecnico.',
    ],
    en: [
      'Half the questions are numeric and generated fresh every time: nothing to memorise.',
      'Write the formula before computing: assessors look at reasoning, not at numbers.',
      'The explanations include the aviation application: they pay off in the technical interview too.',
    ],
  },
  defaultConfig: {
    count: 20,
    perItemMs: 60000,
    topics: ALL_PHYSICS_TOPICS,
    numericRatio: 0.5,
  },
  examConfig: {
    count: 30,
    perItemMs: 50000,
    topics: ALL_PHYSICS_TOPICS,
    numericRatio: 0.5,
  },
  examDurationMs: 28 * 60 * 1000,
  inProExam: true,
  inPracticeSet: true,
  Component: PhysicsRunner,
}
