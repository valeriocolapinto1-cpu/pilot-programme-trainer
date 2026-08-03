/**
 * Program grounding for AI generation.
 *
 * Everything the model is told comes from the selection guide (the PDF): the
 * official TestAir360 modules, the Wizz Air physics syllabus, the maths topics,
 * the ATPL interview topics and the company facts. This keeps generated quizzes
 * faithful to the real Wizz Air Pathway selection instead of generic trivia.
 *
 * The built-in banks (also derived from the PDF) double as the fallback when no
 * API key is configured, so the app always has questions.
 */
import { z } from 'zod'
import { createRng, buildOptions, type Rng } from '@/lib/rng'
import { PHYSICS_BANK, PHYSICS_TOPIC_LABELS } from '@/data/physics'
import { ENGLISH_BANK } from '@/data/english'
import { ATPL_BANK, ATPL_TOPIC_LABELS } from '@/data/atpl'
import { generateAdvancedSpec, ALL_ADVANCED_TOPICS } from '@/modules/maths-advanced/generate'

export type Bi = { it: string; en: string }

export type QuizItemDTO = {
  id: string
  stem: Bi
  options: Bi[]
  correctIndex: number
  explanation?: Bi
  topic?: Bi
}

export type Subject = 'physics' | 'maths' | 'english' | 'atpl'
export type Difficulty = 'easy' | 'medium' | 'hard'

export const SUBJECTS: Subject[] = ['physics', 'maths', 'english', 'atpl']

const SUBJECT_LABEL: Record<Subject, string> = {
  physics: 'Physics',
  maths: 'Mathematics',
  english: 'English',
  atpl: 'ATPL technical (interview)',
}

/** Official, PDF-derived syllabus text handed to the model as hard constraints. */
const SUBJECT_SYLLABUS: Record<Subject, string> = {
  physics: `Official Wizz Air physics syllabus (high-school level, applied to aviation):
kinematics; forces and uniform circular motion; work, energy and momentum; statics;
torque and rotational motion; temperature; heat and specific heat; waves and sound;
electric forces and fields; electric circuits (Ohm's law, series/parallel, power).
About half the questions should be numeric with clean, mentally-tractable numbers;
the rest conceptual. Use aviation context where natural (load factor, ISA lapse rate,
28 V DC bus, etc.).`,
  maths: `Maths as tested in TestAir360 and used operationally:
mental arithmetic (multiplication, division, powers, percentages), algebra and
rearranging formulas, ratios/proportions/unit conversions, geometry and measurement,
basic trigonometry and three-figure bearings (SOHCAHTOA, sin/cos), speed-distance-time
and word problems. Prefer aviation units (knots, NM, feet, ft/min, litres/kg of fuel)
and rules of thumb (3:1 descent, GS×5 rate of descent). Numbers must be solvable without
a calculator for easy/medium items.`,
  english: `English at intermediate level, TAKEN IN ENGLISH (do not translate the question):
intermediate grammar (tenses, conditionals, inversion, phrasal verbs), vocabulary and
synonyms, reading comprehension, and aviation phraseology (ICAO level 4+: Roger vs Wilco
vs Affirm vs Cleared, standard calls). Options must be plausible and only one clearly
correct.`,
  atpl: `ATPL technical topics reported from 2024-2025 Wizz Air assessments:
METAR/TAF decoding; runway declared distances (TORA/TODA/ASDA/LDA); V1/VR/V2 and their
order; stabilised-approach criteria and go-around gates; pressure and density altitude
("hot, high and heavy"); how a turbofan works and where thrust comes from; airport
lighting colours; alternate fuel, final reserve, MINIMUM/MAYDAY FUEL. For cadets the
point is reasoning under uncertainty, not memorising exact regulatory numbers.`,
}

/** A couple of bank items per subject, so the model matches style and rigour. */
function fewShot(subject: Subject): string {
  const pick = <T,>(arr: T[], n: number) => arr.slice(0, n)
  const fmt = (stem: Bi, options: Bi[], correctIndex: number, explanation?: Bi) =>
    JSON.stringify(
      {
        stem: { it: stem.it, en: stem.en },
        options: options.map((o) => ({ it: o.it, en: o.en })),
        correct_index: correctIndex,
        explanation: explanation ? { it: explanation.it, en: explanation.en } : undefined,
      },
      null,
      0,
    )

  if (subject === 'physics') {
    return pick(PHYSICS_BANK, 2)
      .map((q) => fmt(q.stem, q.options, q.correctIndex, q.explanation))
      .join('\n')
  }
  if (subject === 'atpl') {
    return pick(ATPL_BANK, 2)
      .map((q) => fmt(q.stem, q.options, q.correctIndex, q.explanation))
      .join('\n')
  }
  if (subject === 'english') {
    return pick(ENGLISH_BANK, 2)
      .map((q) =>
        fmt(
          { it: q.stem, en: q.stem },
          q.options.map((o) => ({ it: o, en: o })),
          q.correctIndex,
          { it: q.explanation, en: q.explanation },
        ),
      )
      .join('\n')
  }
  // maths — synthesise a couple of examples from the generator
  const rng = createRng(7)
  return pick(ALL_ADVANCED_TOPICS, 2)
    .map((topic) => {
      const spec = generateAdvancedSpec(rng, topic)
      return fmt(spec.question, [], 0, spec.explanation).replace('"options":[]', '"(numeric)"')
    })
    .join('\n')
}

export function availableTopics(subject: Subject): string[] {
  if (subject === 'physics') return Object.values(PHYSICS_TOPIC_LABELS).map((t) => t.en)
  if (subject === 'atpl') return Object.values(ATPL_TOPIC_LABELS).map((t) => t.en)
  if (subject === 'english') return ['grammar', 'vocabulary', 'comprehension', 'aviation phraseology']
  return ['arithmetic', 'algebra', 'ratios & conversions', 'geometry', 'trigonometry & bearings', 'speed-distance-time']
}

export function buildQuizPrompt(args: {
  subject: Subject
  topic?: string
  difficulty: Difficulty
  count: number
}): { system: string; user: string } {
  const { subject, topic, difficulty, count } = args
  const system = `You are an item writer for an independent training tool that prepares candidates for the
Wizz Air Pathway Programme selection (run with Urbe Aero). Write ORIGINAL practice
questions — never copy real exam material. Stay strictly inside the program below.

SUBJECT: ${SUBJECT_LABEL[subject]}
${SUBJECT_SYLLABUS[subject]}

Rules:
- Every question is multiple choice with exactly 4 options and exactly one correct answer.
- Provide BOTH Italian ("it") and English ("en") for the stem, each option and the
  explanation — EXCEPT English-subject questions, where "it" and "en" are the same English
  text (the exam is in English).
- Options must be distinct and plausible; distractors should reflect common mistakes.
- Explanations are one or two sentences, teaching the underlying rule.
- Difficulty "${difficulty}". Keep numbers clean enough to solve without a calculator on
  easy/medium.
- Do not include any commentary outside the tool call.

Style examples (format reference only, do not reuse):
${fewShot(subject)}`

  const user = `Generate ${count} fresh ${difficulty} questions${
    topic ? ` focused on: ${topic}` : ' spread across the syllabus topics'
  }. Make them varied and non-repetitive.`

  return { system, user }
}

/** JSON-Schema for the model's structured output. */
export const QUIZ_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stem: {
            type: 'object',
            properties: { it: { type: 'string' }, en: { type: 'string' } },
            required: ['it', 'en'],
          },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              properties: { it: { type: 'string' }, en: { type: 'string' } },
              required: ['it', 'en'],
            },
          },
          correct_index: { type: 'integer', minimum: 0, maximum: 3 },
          explanation: {
            type: 'object',
            properties: { it: { type: 'string' }, en: { type: 'string' } },
            required: ['it', 'en'],
          },
          topic: {
            type: 'object',
            properties: { it: { type: 'string' }, en: { type: 'string' } },
            required: ['it', 'en'],
          },
        },
        required: ['stem', 'options', 'correct_index'],
      },
    },
  },
  required: ['items'],
} as const

const bi = z.object({ it: z.string().min(1), en: z.string().min(1) })
const aiSchema = z.object({
  items: z
    .array(
      z.object({
        stem: bi,
        options: z.array(bi).length(4),
        correct_index: z.number().int().min(0).max(3),
        explanation: bi.optional(),
        topic: bi.optional(),
      }),
    )
    .min(1),
})

export function normaliseAI(raw: unknown, subject: Subject): QuizItemDTO[] {
  const parsed = aiSchema.parse(raw)
  return parsed.items.map((it, i) => ({
    id: `ai-${subject}-${i}`,
    stem: it.stem,
    options: it.options,
    correctIndex: it.correct_index,
    explanation: it.explanation,
    topic: it.topic,
  }))
}

// ---------------------------------------------------------------------------
// Fallback: build items from the built-in banks/generators (also PDF-derived).
// ---------------------------------------------------------------------------

function shuffleWithAnswer(rng: Rng, options: Bi[], correctIndex: number): { options: Bi[]; correctIndex: number } {
  const correct = options[correctIndex]
  const shuffled = rng.shuffle(options)
  return { options: shuffled, correctIndex: shuffled.indexOf(correct) }
}

export function fallbackItems(subject: Subject, count: number, seed: number): QuizItemDTO[] {
  const rng = createRng(seed)

  if (subject === 'physics') {
    return rng.sample(PHYSICS_BANK, Math.min(count, PHYSICS_BANK.length)).map((q, i) => {
      const s = shuffleWithAnswer(rng, q.options, q.correctIndex)
      return {
        id: `fb-physics-${i}`,
        stem: q.stem,
        options: s.options,
        correctIndex: s.correctIndex,
        explanation: q.explanation,
        topic: PHYSICS_TOPIC_LABELS[q.topic],
      }
    })
  }

  if (subject === 'atpl') {
    return rng.sample(ATPL_BANK, Math.min(count, ATPL_BANK.length)).map((q, i) => {
      const s = shuffleWithAnswer(rng, q.options, q.correctIndex)
      return {
        id: `fb-atpl-${i}`,
        stem: q.stem,
        options: s.options,
        correctIndex: s.correctIndex,
        explanation: q.explanation,
        topic: ATPL_TOPIC_LABELS[q.topic],
      }
    })
  }

  if (subject === 'english') {
    return rng.sample(ENGLISH_BANK, Math.min(count, ENGLISH_BANK.length)).map((q, i) => {
      const options = q.options.map((o) => ({ it: o, en: o }))
      const s = shuffleWithAnswer(rng, options, q.correctIndex)
      return {
        id: `fb-english-${i}`,
        stem: { it: q.stem, en: q.stem },
        options: s.options,
        correctIndex: s.correctIndex,
        explanation: { it: q.explanation, en: q.explanation },
        topic: { it: 'Inglese', en: 'English' },
      }
    })
  }

  // maths — turn numeric specs into 4-option questions
  return Array.from({ length: count }, (_, i) => {
    const topic = ALL_ADVANCED_TOPICS[i % ALL_ADVANCED_TOPICS.length]
    const spec = generateAdvancedSpec(rng, topic)
    const round = (n: number) => Math.round(n * 100) / 100
    const answer = round(spec.answer)
    const distractors = [answer * 2, answer + 1, answer - 1, round(answer * 1.1), -answer]
      .map(round)
      .filter((n) => Number.isFinite(n) && n !== answer)
    const unit = spec.unit ? ` ${spec.unit.en}` : ''
    const { options, correctIndex } = buildOptions(
      rng,
      `${answer}${unit}`,
      distractors.map((n) => `${n}${unit}`),
      4,
    )
    return {
      id: `fb-maths-${i}`,
      stem: spec.question,
      options: options.map((o) => ({ it: o, en: o })),
      correctIndex,
      explanation: spec.explanation,
      topic: { it: 'Matematica', en: 'Maths' },
    }
  })
}
