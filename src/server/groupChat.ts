/**
 * Stage-3 group exercise, run as a live AI group chat.
 *
 * The model plays a facilitator and three fictional co-candidates with distinct
 * styles, so the user has to practise the exact CRM behaviours the assessment
 * day measures (from the guide): communication, active listening, the balance
 * between leading and following, inclusion of quieter members, and composure
 * under time pressure. A separate assessor pass scores those competencies.
 */
import { z } from 'zod'
import { CRM_RUBRIC, GROUP_SCENARIOS } from '@/data/scenarios'
import type { JsonSchema } from '@/server/ai'

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export function scenarioById(id?: string) {
  return GROUP_SCENARIOS.find((s) => s.id === id) ?? GROUP_SCENARIOS[0]
}

export function randomScenario() {
  return GROUP_SCENARIOS[Math.floor(Math.random() * GROUP_SCENARIOS.length)]
}

const PERSONAS = `The other participants (you play all of them, never the user):
- Marco — confident and fast, tends to dominate and push his own solution. If unchecked he steamrolls others.
- Sofia — sharp but quiet; contributes real insight only when actively invited. Tests whether the user includes her.
- Andrei — friendly and collaborative; builds on ideas and helps keep time.
- Facilitator (the assessor) — sets the task, enforces the time pressure, and only intervenes briefly.`

const CRM_FOCUS = CRM_RUBRIC.map((d) => `- ${d.label.en}: good = ${d.good.en}`).join('\n')

export function chatSystemPrompt(scenario: (typeof GROUP_SCENARIOS)[number], locale: 'it' | 'en') {
  const brief = locale === 'it' ? scenario.brief.it : scenario.brief.en
  const constraints = (locale === 'it' ? scenario.constraints.it : scenario.constraints.en)
    .map((c) => `- ${c}`)
    .join('\n')
  return `You are running a Wizz Air Pathway Programme (Urbe Aero) Stage-3 group exercise as a
group chat. This is a training simulation; keep it realistic and in ${
    locale === 'it' ? 'Italian' : 'English'
  }.

SCENARIO
${brief}
Constraints (deliberately not enough time or information — that is intentional):
${constraints}

${PERSONAS}

The exercise assesses these CRM behaviours in the human candidate:
${CRM_FOCUS}

How to respond:
- Reply as the group. Produce ONE OR TWO short messages from the co-candidates or the
  facilitator, each prefixed with the speaker's name and a colon, e.g. "Marco: ...".
- Keep each message to 1-3 sentences, natural and conversational.
- Actively create situations that test the candidate: let Marco dominate so the candidate
  must manage it; keep Sofia quiet unless the candidate invites her; have the facilitator
  apply time pressure ("two minutes left").
- Never speak for the candidate. Never break character or mention that you are an AI.
- Do not resolve the whole problem yourself — the candidate must drive.`
}

// ------------------------------------------------------------- assessment ---

export function assessSystemPrompt(scenario: (typeof GROUP_SCENARIOS)[number]) {
  return `You are a Wizz Air assessor evaluating ONE candidate's CRM performance in the Stage-3
group exercise below. Judge ONLY the messages sent by "user" (the candidate); the other
speakers are simulated. Be fair but honest — the real pass rate is low.

SCENARIO: ${scenario.title.en}

Score each competency from 1 (poor) to 5 (excellent), with a one-sentence justification in
BOTH Italian and English:
${CRM_RUBRIC.map((d) => `- ${d.id}: ${d.label.en}`).join('\n')}

Also give an overall score 0-100, a two-sentence summary, and concrete strengths and
improvements. Base everything on what the candidate actually wrote; if they barely
participated, score low and say so.`
}

export const ASSESS_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    scores: {
      type: 'object',
      properties: {
        communication: { type: 'integer', minimum: 1, maximum: 5 },
        listening: { type: 'integer', minimum: 1, maximum: 5 },
        leadership: { type: 'integer', minimum: 1, maximum: 5 },
        inclusion: { type: 'integer', minimum: 1, maximum: 5 },
        composure: { type: 'integer', minimum: 1, maximum: 5 },
      },
      required: ['communication', 'listening', 'leadership', 'inclusion', 'composure'],
    },
    comments: {
      type: 'object',
      properties: {
        communication: biSchema(),
        listening: biSchema(),
        leadership: biSchema(),
        inclusion: biSchema(),
        composure: biSchema(),
      },
      required: ['communication', 'listening', 'leadership', 'inclusion', 'composure'],
    },
    overall: { type: 'integer', minimum: 0, maximum: 100 },
    summary: biSchema(),
    strengths: { type: 'array', items: biSchema() },
    improvements: { type: 'array', items: biSchema() },
  },
  required: ['scores', 'comments', 'overall', 'summary', 'strengths', 'improvements'],
}

function biSchema(): JsonSchema {
  return {
    type: 'object',
    properties: { it: { type: 'string' }, en: { type: 'string' } },
    required: ['it', 'en'],
  }
}

const bi = z.object({ it: z.string(), en: z.string() })
export const assessmentSchema = z.object({
  scores: z.object({
    communication: z.number().int().min(1).max(5),
    listening: z.number().int().min(1).max(5),
    leadership: z.number().int().min(1).max(5),
    inclusion: z.number().int().min(1).max(5),
    composure: z.number().int().min(1).max(5),
  }),
  comments: z.object({
    communication: bi,
    listening: bi,
    leadership: bi,
    inclusion: bi,
    composure: bi,
  }),
  overall: z.number().int().min(0).max(100),
  summary: bi,
  strengths: z.array(bi),
  improvements: z.array(bi),
})

export type Assessment = z.infer<typeof assessmentSchema>
