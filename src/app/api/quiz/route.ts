import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateJSON, isConfigured, providerInfo } from '@/server/ai'
import {
  buildQuizPrompt,
  fallbackItems,
  normaliseAI,
  QUIZ_SCHEMA,
  SUBJECTS,
  type QuizItemDTO,
} from '@/server/syllabus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  subject: z.enum(['physics', 'maths', 'english', 'atpl']),
  topic: z.string().max(120).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().int().min(1).max(20).default(10),
})

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request', detail: String(error) }, { status: 400 })
  }

  const seed = (Math.random() * 0xffffffff) >>> 0

  if (isConfigured()) {
    try {
      const { system, user } = buildQuizPrompt(body)
      const raw = await generateJSON<{ items: unknown[] }>({
        system,
        user,
        schema: QUIZ_SCHEMA,
        maxTokens: 4096,
        temperature: 0.8,
      })
      const items = normaliseAI(raw, body.subject).slice(0, body.count)
      if (items.length > 0) {
        return NextResponse.json({ source: 'ai', provider: providerInfo().provider, items })
      }
    } catch (error) {
      // Fall through to the built-in bank so the user is never blocked.
      console.error('[quiz] AI generation failed, using fallback:', error)
    }
  }

  const items: QuizItemDTO[] = fallbackItems(body.subject, body.count, seed)
  return NextResponse.json({ source: 'fallback', items })
}

export function GET() {
  return NextResponse.json({ subjects: SUBJECTS, ai: providerInfo() })
}
