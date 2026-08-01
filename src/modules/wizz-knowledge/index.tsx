import { useCallback, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { useProgress } from '@/store/progressStore'
import { newCard, pickDue, review, type Grade } from '@/lib/srs'
import { Tag } from '@/components/ui'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'
import {
  SOURCE_NOTE,
  VERIFIED_ON,
  WIZZ_CARDS,
  WIZZ_CATEGORY_LABELS,
} from '@/data/wizz'

export type WizzConfig = {
  /** Cards per session. */
  count: number
}

const GRADES: { grade: Grade; label: { it: string; en: string }; tone: string }[] = [
  { grade: 'again', label: { it: 'Da rivedere', en: 'Again' }, tone: 'var(--bad)' },
  { grade: 'hard', label: { it: 'Difficile', en: 'Hard' }, tone: 'var(--warn)' },
  { grade: 'good', label: { it: 'Bene', en: 'Good' }, tone: 'var(--ok)' },
  { grade: 'easy', label: { it: 'Facile', en: 'Easy' }, tone: 'var(--accent)' },
]

function WizzRunner({ config, onFinish }: ModuleRuntimeProps<WizzConfig>) {
  const { t, b } = useI18n()
  const cardStates = useProgress((s) => s.cards)
  const setCard = useProgress((s) => s.setCard)

  // Snapshot the queue once so grading a card does not reshuffle it mid-session.
  const queue = useMemo(
    () => pickDue(WIZZ_CARDS, cardStates, config.count),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.count],
  )

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const gradesRef = useRef<Grade[]>([])
  const finishedRef = useRef(false)

  const card = queue[index]

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    const grades = gradesRef.current
    const known = grades.filter((g) => g === 'good' || g === 'easy').length
    onFinish({
      percent: grades.length > 0 ? (known / grades.length) * 100 : 0,
      correct: known,
      total: grades.length,
      metrics: [
        {
          label: { it: 'Da rivedere', en: 'Marked again' },
          value: String(grades.filter((g) => g === 'again').length),
        },
      ],
    })
  }, [onFinish])

  const grade = useCallback(
    (value: Grade) => {
      if (!card) return
      gradesRef.current.push(value)
      setCard(card.id, review(cardStates[card.id] ?? newCard(), value))
      setRevealed(false)
      if (index + 1 >= queue.length) finish()
      else setIndex((i) => i + 1)
    },
    [card, cardStates, finish, index, queue.length, setCard],
  )

  if (!card) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="dim">{t('progress.empty')}</p>
        <button type="button" className="btn btn-primary mt-4" onClick={finish}>
          {t('common.finish')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="dim flex items-center justify-between text-sm">
        <span>
          {index + 1} / {queue.length}
        </span>
        <Tag>{b(WIZZ_CATEGORY_LABELS[card.category])}</Tag>
      </div>

      <div className="panel flex min-h-52 flex-col justify-center gap-4 p-5">
        <p className="text-xl font-semibold">{b(card.front)}</p>
        {revealed ? (
          <>
            <hr style={{ borderColor: 'var(--edge)' }} />
            <p className="leading-relaxed">{b(card.back)}</p>
            {card.volatile ? (
              <p className="dim text-xs">
                ⚠️ {b({ it: 'Dato che cambia spesso — verificato il', en: 'Fast-moving figure — verified on' })}{' '}
                {VERIFIED_ON}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map(({ grade: value, label, tone }) => (
            <button
              key={value}
              type="button"
              className="btn"
              style={{ borderColor: tone, color: tone }}
              onClick={() => grade(value)}
            >
              {b(label)}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setRevealed(true)}
          autoFocus
        >
          {b({ it: 'Mostra la risposta', en: 'Show the answer' })}
        </button>
      )}

      <p className="dim text-xs leading-relaxed">{b(SOURCE_NOTE)}</p>
    </div>
  )
}

export const wizzKnowledgeModule: TrainerModule<WizzConfig> = {
  id: 'wizz-knowledge',
  kind: 'reflective',
  phase: 4,
  sourceTier: 'official',
  icon: 'building',
  title: { it: 'Conoscenza Wizz Air', en: 'Wizz Air knowledge' },
  blurb: {
    it: 'Flashcard con ripetizione spaziata su flotta, basi, strategia e percorso.',
    en: 'Spaced-repetition flashcards on fleet, bases, strategy and the programme.',
  },
  whatItTests: {
    it: 'La preparazione sull’azienda che il colloquio motivazionale mette alla prova con “Perché Wizz Air?”. Le carte tornano a distanza crescente: rivedi spesso quelle che sbagli, di rado quelle che sai.',
    en: 'The company preparation the motivational interview probes with “Why Wizz Air?”. Cards come back at growing intervals: often for the ones you miss, rarely for the ones you know.',
  },
  instructions: {
    it: [
      'Rispondi mentalmente prima di scoprire: se ti limiti a leggere, non stai studiando.',
      'Sii onesto nella valutazione: “Bene” solo se avresti risposto al colloquio.',
      'I dati marcati ⚠️ cambiano ogni stagione: verificali su wizzair.com prima del colloquio.',
    ],
    en: [
      'Answer in your head before revealing: just reading is not studying.',
      'Grade yourself honestly: “Good” only if you would have answered in the interview.',
      'Figures marked ⚠️ change every season: check them on wizzair.com before the interview.',
    ],
  },
  defaultConfig: { count: 12 },
  examConfig: { count: 12 },
  examDurationMs: 8 * 60 * 1000,
  inProExam: false,
  inPracticeSet: false,
  Component: WizzRunner,
}
