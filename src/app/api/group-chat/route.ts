import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateJSON, isConfigured, streamText, type ChatMessage } from '@/server/ai'
import {
  ASSESS_SCHEMA,
  assessSystemPrompt,
  assessmentSchema,
  chatSystemPrompt,
  scenarioById,
} from '@/server/groupChat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const turnSchema = z.object({ role: z.enum(['user', 'assistant']), content: z.string() })
const bodySchema = z.object({
  action: z.enum(['reply', 'assess']),
  scenarioId: z.string().optional(),
  locale: z.enum(['it', 'en']).default('it'),
  messages: z.array(turnSchema).max(80),
})

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request', detail: String(error) }, { status: 400 })
  }

  if (!isConfigured()) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const scenario = scenarioById(body.scenarioId)
  const messages: ChatMessage[] = body.messages.map((m) => ({ role: m.role, content: m.content }))

  if (body.action === 'reply') {
    try {
      // Seed an opening turn if the candidate hasn't spoken yet.
      const seeded: ChatMessage[] =
        messages.length === 0
          ? [{ role: 'user', content: '(the exercise begins — open the discussion)' }]
          : messages
      const stream = await streamText({
        system: chatSystemPrompt(scenario, body.locale),
        messages: seeded,
        maxTokens: 400,
        temperature: 0.9,
      })
      return new Response(stream, {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      })
    } catch (error) {
      return NextResponse.json({ error: 'AI error', detail: String(error) }, { status: 502 })
    }
  }

  // assess
  try {
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'CANDIDATE' : 'GROUP'}: ${m.content}`)
      .join('\n')
    const result = await generateJSON<unknown>({
      system: assessSystemPrompt(scenario),
      user: `Transcript:\n${transcript}\n\nEvaluate the CANDIDATE only.`,
      schema: ASSESS_SCHEMA,
      maxTokens: 1500,
      temperature: 0.3,
    })
    const parsed = assessmentSchema.parse(result)
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: 'AI error', detail: String(error) }, { status: 502 })
  }
}
