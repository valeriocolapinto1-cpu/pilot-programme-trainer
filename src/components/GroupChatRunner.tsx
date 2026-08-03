import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { formatDuration } from '@/lib/format'
import { Card, Meter, ScoreDial, TimerBar, Tag } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { GROUP_SCENARIOS, CRM_RUBRIC } from '@/data/scenarios'
import type { ModuleScore } from '@/modules/types'

type Turn = { role: 'user' | 'assistant'; content: string }

type Assessment = {
  scores: Record<'communication' | 'listening' | 'leadership' | 'inclusion' | 'composure', number>
  comments: Record<string, { it: string; en: string }>
  overall: number
  summary: { it: string; en: string }
  strengths: { it: string; en: string }[]
  improvements: { it: string; en: string }[]
}

const SPEAKER_COLOURS: Record<string, string> = {
  Marco: '#c8a24e',
  Sofia: '#8fb4d6',
  Andrei: '#9ec6a5',
  Andrea: '#9ec6a5',
  Facilitator: '#b98fb0',
  Facilitatore: '#b98fb0',
}

/** Splits a group turn like "Marco: …\nSofia: …" into per-speaker bubbles. */
function parseSpeakers(text: string): { speaker: string | null; text: string }[] {
  const parts: { speaker: string | null; text: string }[] = []
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const m = line.match(/^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ]+)\s*:\s*(.*)$/)
    if (m) parts.push({ speaker: m[1], text: m[2] })
    else if (parts.length > 0) parts[parts.length - 1].text += ' ' + line
    else parts.push({ speaker: null, text: line })
  }
  return parts
}

export function GroupChatRunner({
  scenarioMs,
  onFinish,
}: {
  scenarioMs: number
  onFinish: (score: ModuleScore) => void
}) {
  const { t, b, locale } = useI18n()
  const scenario = useMemo(() => {
    const rng = createRng(Date.now() >>> 0)
    return rng.pick(GROUP_SCENARIOS)
  }, [])

  const [configured, setConfigured] = useState<boolean | null>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [assessing, setAssessing] = useState(false)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [phase, setPhase] = useState<'briefing' | 'chat'>('briefing')
  const scrollRef = useRef<HTMLDivElement>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    fetch('/api/ai-status')
      .then((r) => r.json())
      .then((d: { configured: boolean }) => setConfigured(!!d.configured))
      .catch(() => setConfigured(false))
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, streaming])

  const streamGroupTurn = useCallback(
    async (history: Turn[]) => {
      setBusy(true)
      setStreaming('')
      try {
        const res = await fetch('/api/group-chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'reply',
            scenarioId: scenario.id,
            locale,
            messages: history,
          }),
        })
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let acc = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          setStreaming(acc)
        }
        setStreaming('')
        setTurns((prev) => [...prev, { role: 'assistant', content: acc.trim() }])
      } catch {
        setStreaming('')
        setTurns((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              locale === 'it'
                ? 'Facilitatore: problema di connessione, riprova a scrivere.'
                : 'Facilitator: connection issue, try writing again.',
          },
        ])
      } finally {
        setBusy(false)
      }
    },
    [locale, scenario.id],
  )

  const beginChat = useCallback(() => {
    setPhase('chat')
    if (configured) void streamGroupTurn([])
  }, [configured, streamGroupTurn])

  const send = useCallback(() => {
    const text = input.trim()
    if (!text || busy) return
    const next: Turn[] = [...turns, { role: 'user', content: text }]
    setTurns(next)
    setInput('')
    if (configured) void streamGroupTurn(next)
  }, [busy, configured, input, streamGroupTurn, turns])

  const requestAssessment = useCallback(async () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setAssessing(true)
    try {
      const res = await fetch('/api/group-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'assess', scenarioId: scenario.id, locale, messages: turns }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Assessment
      setAssessment(data)
    } catch {
      finishedRef.current = false
    } finally {
      setAssessing(false)
    }
  }, [locale, scenario.id, turns])

  const timer = useCountdown(scenarioMs, 'group-chat', {
    running: phase === 'chat' && !assessment,
    onExpire: () => void requestAssessment(),
  })

  const finishFromAssessment = useCallback(
    (a: Assessment) => {
      onFinish({
        percent: a.overall,
        metrics: CRM_RUBRIC.map((d) => ({
          label: d.label,
          value: `${a.scores[d.id as keyof Assessment['scores']] ?? 0}/5`,
        })),
      })
    },
    [onFinish],
  )

  // ---- loading gate --------------------------------------------------------
  if (configured === null) {
    return (
      <div className="py-16 text-center">
        <span
          className="inline-block h-6 w-6 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--line-strong)', borderTopColor: 'var(--accent)' }}
          aria-hidden
        />
      </div>
    )
  }

  // ---- assessment result ---------------------------------------------------
  if (assessment) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="eyebrow">{b({ it: 'Valutazione CRM', en: 'CRM assessment' })}</p>
          <ScoreDial value={assessment.overall} size={120} />
        </div>

        <div className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
          {CRM_RUBRIC.map((d) => {
            const score = assessment.scores[d.id as keyof Assessment['scores']] ?? 0
            return (
              <div key={d.id} className="px-4 py-3" style={{ borderColor: 'var(--line)' }}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[0.9375rem]">{b(d.label)}</span>
                  <span className="mono flex-none">{score}/5</span>
                </div>
                <Meter value={(score / 5) * 100} height={3} />
                {assessment.comments[d.id] ? (
                  <p className="muted-more mt-1.5 text-xs leading-relaxed">
                    {b(assessment.comments[d.id])}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>

        <Card>
          <p className="text-[0.9375rem] leading-relaxed">{b(assessment.summary)}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-1.5">{b({ it: 'Punti di forza', en: 'Strengths' })}</p>
              <ul className="flex flex-col gap-1 text-sm">
                {assessment.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: 'var(--pos)' }}>+</span>
                    <span>{b(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-1.5">{b({ it: 'Da migliorare', en: 'To improve' })}</p>
              <ul className="flex flex-col gap-1 text-sm">
                {assessment.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: 'var(--neg)' }}>−</span>
                    <span>{b(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => finishFromAssessment(assessment)}
        >
          {t('common.finish')}
        </button>
      </div>
    )
  }

  // ---- no key: self-assessment fallback ------------------------------------
  if (!configured) {
    return <SelfAssessFallback scenarioMs={scenarioMs} onFinish={onFinish} scenario={scenario} />
  }

  // ---- briefing ------------------------------------------------------------
  if (phase === 'briefing') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center gap-2">
          <Tag tone="accent">{b({ it: 'Chat di gruppo · IA', en: 'Group chat · AI' })}</Tag>
        </div>
        <h3 className="text-xl">{b(scenario.title)}</h3>
        <p className="leading-relaxed">{b(scenario.brief)}</p>
        <Card>
          <p className="eyebrow mb-2">{b({ it: 'Vincoli', en: 'Constraints' })}</p>
          <ul className="flex flex-col gap-1 text-sm">
            {b(scenario.constraints).map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="muted-more">·</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
        <p className="muted-more text-sm">
          {b({
            it: 'Sei in chat con Marco, Sofia e Andrei più un facilitatore. Guida la discussione, includi chi tace, gestisci chi domina, resta calmo sotto il tempo. Alla fine ricevi una valutazione CRM.',
            en: 'You are in a chat with Marco, Sofia and Andrei plus a facilitator. Lead the discussion, include the quiet one, manage the dominant one, stay composed under time. You get a CRM assessment at the end.',
          })}
        </p>
        <button type="button" className="btn btn-primary" onClick={beginChat} autoFocus>
          {b({ it: 'Entra nella chat', en: 'Enter the chat' })}
        </button>
      </div>
    )
  }

  // ---- live chat -----------------------------------------------------------
  return (
    <div className="mx-auto flex h-[70vh] w-full max-w-2xl flex-col gap-3">
      <TimerBar fraction={timer.fraction} label={formatDuration(timer.remaining)} />

      <div
        ref={scrollRef}
        className="surface flex-1 space-y-3 overflow-y-auto p-4"
        style={{ minHeight: 0 }}
      >
        {turns.map((turn, i) =>
          turn.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div
                className="max-w-[80%] rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--accent-weak)', border: '1px solid var(--accent-line)' }}
              >
                {turn.content}
              </div>
            </div>
          ) : (
            <GroupBubbles key={i} text={turn.content} youLabel={b({ it: 'Tu', en: 'You' })} />
          ),
        )}
        {streaming ? <GroupBubbles text={streaming} youLabel="" streaming /> : null}
        {busy && !streaming ? (
          <p className="muted-more text-xs">{b({ it: 'Il gruppo scrive…', en: 'The group is typing…' })}</p>
        ) : null}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          className="flex-1"
          placeholder={
            b({ it: 'Scrivi al gruppo…', en: 'Write to the group…' }) as string
          }
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          aria-label={b({ it: 'Messaggio', en: 'Message' }) as string}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()}>
          <Icon name="arrowRight" size={16} />
        </button>
      </form>

      <button
        type="button"
        className="btn"
        onClick={() => void requestAssessment()}
        disabled={assessing || turns.filter((x) => x.role === 'user').length === 0}
      >
        {assessing
          ? b({ it: 'Valutazione in corso…', en: 'Assessing…' })
          : b({ it: 'Termina e valuta', en: 'End & assess' })}
      </button>
    </div>
  )
}

function GroupBubbles({
  text,
  youLabel,
  streaming,
}: {
  text: string
  youLabel: string
  streaming?: boolean
}) {
  void youLabel
  return (
    <div className="flex flex-col gap-2">
      {parseSpeakers(text).map((part, i) => {
        const colour = part.speaker ? SPEAKER_COLOURS[part.speaker] ?? 'var(--text-2)' : 'var(--text-2)'
        return (
          <div key={i} className="flex justify-start">
            <div
              className="max-w-[85%] rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
            >
              {part.speaker ? (
                <div className="mb-0.5 text-xs font-medium" style={{ color: colour }}>
                  {part.speaker}
                </div>
              ) : null}
              <span>{part.text}</span>
              {streaming && i === parseSpeakers(text).length - 1 ? (
                <span className="ml-0.5 animate-pulse">▍</span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** When no API key is set, keep the exercise usable with a CRM self-rating. */
function SelfAssessFallback({
  onFinish,
  scenario,
}: {
  scenarioMs: number
  onFinish: (score: ModuleScore) => void
  scenario: (typeof GROUP_SCENARIOS)[number]
}) {
  const { t, b } = useI18n()
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const finish = () => {
    const values = CRM_RUBRIC.map((d) => ratings[d.id] ?? 0).filter((v) => v > 0)
    onFinish({
      percent: values.length ? (values.reduce((s, v) => s + v, 0) / (values.length * 5)) * 100 : 0,
      metrics: CRM_RUBRIC.map((d) => ({ label: d.label, value: `${ratings[d.id] ?? 0}/5` })),
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Card className="border-[var(--accent-line)]">
        <p className="text-sm leading-relaxed">
          {b({
            it: 'La chat di gruppo con IA è disattivata (nessuna API key configurata sul server). Puoi comunque allenarti sullo scenario e autovalutare le tue competenze CRM.',
            en: 'The AI group chat is off (no API key configured on the server). You can still work the scenario and self-assess your CRM competencies.',
          })}
        </p>
      </Card>
      <h3 className="text-xl">{b(scenario.title)}</h3>
      <p className="leading-relaxed">{b(scenario.brief)}</p>
      {CRM_RUBRIC.map((d) => (
        <div key={d.id} className="surface p-3">
          <p className="font-medium">{b(d.label)}</p>
          <p className="muted-more mt-1 text-xs">{b(d.good)}</p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                className="btn flex-1"
                style={
                  ratings[d.id] === v
                    ? { borderColor: 'var(--accent-line)', background: 'var(--accent-weak)' }
                    : undefined
                }
                onClick={() => setRatings((r) => ({ ...r, [d.id]: v }))}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-primary" onClick={finish}>
        {t('common.finish')}
      </button>
    </div>
  )
}
