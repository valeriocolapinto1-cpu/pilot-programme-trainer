import { useCallback, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar, Tag } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import { useProgress } from '@/store/progressStore'
import { INTERVIEW_QUESTIONS, STAR_STEPS, type InterviewCategory } from '@/data/scenarios'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type InterviewConfig = {
  count: number
  /** Time to answer out loud before the guidance is revealed. */
  answerMs: number
  categories: InterviewCategory[]
}

const CATEGORY_LABELS: Record<InterviewCategory, { it: string; en: string }> = {
  star: { it: 'Comportamentale (STAR)', en: 'Behavioural (STAR)' },
  crm: { it: 'Scenario CRM', en: 'CRM scenario' },
  motivational: { it: 'Motivazionale', en: 'Motivational' },
}

export const ALL_INTERVIEW_CATEGORIES: InterviewCategory[] = ['star', 'crm', 'motivational']

function InterviewRunner({ config, seed, onFinish }: ModuleRuntimeProps<InterviewConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const notes = useProgress((s) => s.notes)
  const setNote = useProgress((s) => s.setNote)

  const questions = useMemo(() => {
    const categories =
      config.categories.length > 0 ? config.categories : ALL_INTERVIEW_CATEGORIES
    return rng.sample(
      INTERVIEW_QUESTIONS.filter((q) => categories.includes(q.category)),
      config.count,
    )
  }, [config.categories, config.count, rng])

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const ratingsRef = useRef<number[]>([])
  const finishedRef = useRef(false)

  const question = questions[index]

  const timer = useCountdown(config.answerMs, index, {
    running: !revealed,
    onExpire: () => setRevealed(true),
  })

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const ratings = ratingsRef.current
    onFinish({
      percent:
        ratings.length > 0 ? (ratings.reduce((s, v) => s + v, 0) / (ratings.length * 5)) * 100 : 0,
      correct: ratings.filter((r) => r >= 4).length,
      total: questions.length,
      metrics: [
        {
          label: { it: 'Risposte da rifare', en: 'Answers to redo' },
          value: String(ratings.filter((r) => r <= 2).length),
        },
      ],
    })
  }, [onFinish, questions.length])

  const next = useCallback(() => {
    if (rating != null) ratingsRef.current.push(rating)
    setRating(null)
    setRevealed(false)
    if (index + 1 >= questions.length) finish()
    else setIndex((i) => i + 1)
  }, [finish, index, questions.length, rating])

  if (!question) return null

  const noteKey = `interview.${question.id}`

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="dim flex items-center justify-between text-sm">
        <span>
          {index + 1} / {questions.length}
        </span>
        <Tag>{b(CATEGORY_LABELS[question.category])}</Tag>
      </div>

      <TimerBar fraction={timer.fraction} label={formatDuration(timer.remaining)} />

      <h3 className="text-xl leading-relaxed font-semibold">{b(question.question)}</h3>

      {!revealed ? (
        <>
          <p className="dim text-sm">
            {b({
              it: 'Rispondi ad alta voce, come faresti davanti agli assessor. Usa gli appunti solo come traccia — al colloquio non li avrai.',
              en: 'Answer out loud, as you would in front of the assessors. Use the notes as a skeleton only — you will not have them in the room.',
            })}
          </p>

          {question.category === 'star' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {STAR_STEPS.map((step) => (
                <label key={step.key} className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{b(step.label)}</span>
                  <span className="dim text-xs">{b(step.hint)}</span>
                  <textarea
                    className="panel-soft focus-ring min-h-20 p-2 text-sm"
                    style={{ color: 'var(--text)' }}
                    value={notes[`${noteKey}.${step.key}`] ?? ''}
                    onChange={(e) => setNote(`${noteKey}.${step.key}`, e.target.value)}
                  />
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="panel-soft focus-ring min-h-32 p-3"
              style={{ color: 'var(--text)' }}
              placeholder={
                b({ it: 'Traccia della tua risposta…', en: 'Outline of your answer…' }) as string
              }
              value={notes[noteKey] ?? ''}
              onChange={(e) => setNote(noteKey, e.target.value)}
            />
          )}

          <button type="button" className="btn btn-primary self-center" onClick={() => setRevealed(true)}>
            {b({ it: 'Ho risposto — mostra la guida', en: 'I have answered — show the guidance' })}
          </button>
        </>
      ) : (
        <>
          <div className="panel-soft p-3">
            <p className="dim mb-2 text-xs uppercase tracking-wide">
              {b({ it: 'Cosa valutano', en: 'What they listen for' })}
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed">
              {b(question.looksFor).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="panel-soft p-3" style={{ borderColor: 'var(--bad)' }}>
            <p className="dim mb-1 text-xs uppercase tracking-wide">
              {b({ it: 'Da evitare', en: 'Avoid' })}
            </p>
            <p className="text-sm leading-relaxed">{b(question.avoid)}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">
              {b({
                it: 'Quanto è stata solida la tua risposta? (1-5)',
                en: 'How solid was your answer? (1-5)',
              })}
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="btn flex-1"
                  style={
                    rating === value
                      ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' }
                      : undefined
                  }
                  onClick={() => setRating(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={next}
            disabled={rating == null}
          >
            {index + 1 >= questions.length ? t('common.finish') : t('common.next')}
          </button>
        </>
      )}
    </div>
  )
}

export const interviewHrModule: TrainerModule<InterviewConfig> = {
  id: 'interview-hr',
  kind: 'reflective',
  phase: 4,
  sourceTier: 'community',
  icon: 'interview',
  title: { it: 'Colloquio HR e motivazionale', en: 'HR and motivational interview' },
  blurb: {
    it: 'Domande STAR, scenari CRM e “Perché Wizz Air?”, con guida su cosa valutano.',
    en: 'STAR questions, CRM scenarios and “Why Wizz Air?”, with guidance on what is assessed.',
  },
  whatItTests: {
    it: 'Il colloquio è condotto da assessor Wizz Air (tipicamente due piloti) e mescola domande comportamentali, scenari CRM e motivazione. Gli appunti restano salvati nel browser, così costruisci il tuo repertorio di storie STAR una risposta alla volta.',
    en: 'The interview is run by Wizz Air assessors (typically two pilots) and mixes behavioural questions, CRM scenarios and motivation. Your notes stay in the browser, so you build your STAR story bank one answer at a time.',
  },
  instructions: {
    it: [
      'Rispondi a voce alta e cronometrati: 60-90 secondi è il formato giusto.',
      'Struttura STAR: Situazione, Compito, Azione, Risultato. La parte lunga è l’Azione, e va detta in prima persona.',
      'Negli scenari CRM la risposta corretta enfatizza sempre de-escalation strutturata, aderenza alle procedure e assertività professionale.',
      'Prepara due domande da fare tu: “nessuna domanda” è l’ultima impressione che lasci.',
    ],
    en: [
      'Answer out loud and time yourself: 60-90 seconds is the right format.',
      'STAR structure: Situation, Task, Action, Result. The long part is the Action, and it is told in the first person.',
      'In CRM scenarios the correct answer always emphasises structured de-escalation, adherence to procedures and professional assertiveness.',
      'Prepare two questions of your own: “no questions” is the last impression you leave.',
    ],
  },
  defaultConfig: { count: 5, answerMs: 90000, categories: ALL_INTERVIEW_CATEGORIES },
  examConfig: { count: 8, answerMs: 90000, categories: ALL_INTERVIEW_CATEGORIES },
  examDurationMs: 20 * 60 * 1000,
  inProExam: false,
  inPracticeSet: false,
  Component: InterviewRunner,
}
