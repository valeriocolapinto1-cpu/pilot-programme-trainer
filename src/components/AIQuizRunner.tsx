import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { Quiz } from '@/components/Quiz'
import { Tag } from '@/components/ui'
import type { ModuleScore, QuizItem } from '@/modules/types'

export type AIQuizSubject = 'physics' | 'maths' | 'english' | 'atpl'

type ApiItem = {
  id: string
  stem: { it: string; en: string }
  options: { it: string; en: string }[]
  correctIndex: number
  explanation?: { it: string; en: string }
  topic?: { it: string; en: string }
}

type ApiResponse = { source: 'ai' | 'fallback'; items: ApiItem[] }

function toQuizItems(items: ApiItem[]): QuizItem[] {
  return items.map((it) => ({
    id: it.id,
    inputMode: 'choice',
    stem: it.stem,
    options: it.options,
    correctIndex: it.correctIndex,
    explanation: it.explanation,
    topic: it.topic,
  }))
}

/**
 * Fetches AI-generated (program-grounded) questions and runs them through the
 * shared Quiz engine. The API returns bank questions when no key is configured,
 * so this always resolves to a playable quiz.
 */
export function AIQuizRunner({
  subject,
  difficulty = 'medium',
  count = 10,
  perItemMs = 45000,
  mode,
  onFinish,
}: {
  subject: AIQuizSubject
  difficulty?: 'easy' | 'medium' | 'hard'
  count?: number
  perItemMs?: number
  mode: 'practice' | 'exam'
  onFinish: (score: ModuleScore) => void
}) {
  const { t, b } = useI18n()
  const [state, setState] = useState<
    | { name: 'loading' }
    | { name: 'error' }
    | { name: 'ready'; items: QuizItem[]; source: 'ai' | 'fallback' }
  >({ name: 'loading' })
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ subject, difficulty, count }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as ApiResponse
        const items = toQuizItems(data.items)
        if (items.length === 0) throw new Error('empty')
        setState({ name: 'ready', items, source: data.source })
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('[AIQuizRunner] failed to load quiz:', error)
        setState({ name: 'error' })
      }
    })()

    return () => controller.abort()
  }, [subject, difficulty, count])

  if (state.name === 'loading') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <span
          className="inline-block h-6 w-6 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--line-strong)', borderTopColor: 'var(--accent)' }}
          aria-hidden
        />
        <p className="muted text-sm">
          {b({
            it: 'Sto generando un quiz nuovo sul programma…',
            en: 'Generating a fresh, on-program quiz…',
          })}
        </p>
      </div>
    )
  }

  if (state.name === 'error') {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="muted text-sm">
          {b({
            it: 'Non è stato possibile generare il quiz. Riprova.',
            en: 'Could not generate the quiz. Please try again.',
          })}
        </p>
        <button
          type="button"
          className="btn mt-4"
          onClick={() => {
            startedRef.current = false
            setState({ name: 'loading' })
          }}
        >
          {t('common.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Tag tone={state.source === 'ai' ? 'accent' : undefined}>
          {state.source === 'ai'
            ? b({ it: 'Generato dall’IA', en: 'AI-generated' })
            : b({ it: 'Dalla banca (IA non attiva)', en: 'From the bank (AI off)' })}
        </Tag>
      </div>
      <Quiz
        items={state.items}
        perItemMs={perItemMs}
        feedback={mode === 'exam' ? 'none' : 'immediate'}
        onFinish={onFinish}
        allowSkip={false}
      />
    </div>
  )
}
