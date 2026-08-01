import { useCallback, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng } from '@/lib/rng'
import { TimerBar } from '@/components/ui'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'
import {
  FORCED_CHOICE_ITEMS,
  LIKERT_LABELS,
  PERSONALITY_ITEMS,
  type PersonalityItem,
} from '@/data/personality'

export type PersonalityConfig = {
  /** Likert items shown (always an even number so pairs stay complete). */
  likertCount: number
  forcedChoiceCount: number
}

type Answer = { item: PersonalityItem; value: number }

/**
 * Consistency between the two items of a pair. For 'same' items the answers
 * should match; for 'opposite' items they should mirror around the midpoint.
 * Returns 0-1, where 1 is perfectly consistent.
 */
export function pairConsistency(a: Answer, b: Answer): number {
  const expected = b.item.polarity === a.item.polarity ? a.value : 6 - a.value
  return 1 - Math.abs(expected - b.value) / 4
}

function PersonalityRunner({ config, seed, onFinish }: ModuleRuntimeProps<PersonalityConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])

  const { likert, forced } = useMemo(() => {
    // Keep whole pairs together, then shuffle so partners are far apart —
    // that separation is exactly what the real questionnaire relies on.
    const pairs = [...new Set(PERSONALITY_ITEMS.map((i) => i.pair))]
    const chosen = rng.sample(pairs, Math.floor(config.likertCount / 2))
    const items = PERSONALITY_ITEMS.filter((i) => chosen.includes(i.pair))
    return {
      likert: rng.shuffle(items),
      forced: rng.sample(FORCED_CHOICE_ITEMS, config.forcedChoiceCount),
    }
  }, [config.forcedChoiceCount, config.likertCount, rng])

  const total = likert.length + forced.length
  const [index, setIndex] = useState(0)
  const answersRef = useRef<Answer[]>([])
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true

    const byPair = new Map<string, Answer[]>()
    for (const answer of answersRef.current) {
      const list = byPair.get(answer.item.pair) ?? []
      list.push(answer)
      byPair.set(answer.item.pair, list)
    }

    const scores: number[] = []
    let contradictions = 0
    for (const list of byPair.values()) {
      if (list.length < 2) continue
      const score = pairConsistency(list[0], list[1])
      scores.push(score)
      // A gap of two Likert steps or more is what a screening tool flags.
      if (score < 0.5) contradictions += 1
    }

    const percent =
      scores.length > 0 ? (scores.reduce((s, v) => s + v, 0) / scores.length) * 100 : 100

    onFinish({
      percent,
      correct: scores.length - contradictions,
      total: scores.length,
      metrics: [
        {
          label: { it: 'Coppie contraddittorie', en: 'Contradictory pairs' },
          value: String(contradictions),
          hint: {
            it: 'Domande sullo stesso tratto a cui hai risposto in modo incompatibile: è ciò che alza le bandiere rosse.',
            en: 'Questions on the same trait answered incompatibly: this is what raises red flags.',
          },
        },
      ],
    })
  }, [onFinish])

  const answerLikert = useCallback(
    (value: number) => {
      answersRef.current.push({ item: likert[index], value })
      if (index + 1 >= total) finish()
      else setIndex((i) => i + 1)
    },
    [finish, index, likert, total],
  )

  const answerForced = useCallback(() => {
    if (index + 1 >= total) finish()
    else setIndex((i) => i + 1)
  }, [finish, index, total])

  const isLikert = index < likert.length
  const forcedItem = forced[index - likert.length]

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <TimerBar fraction={1 - index / total} label={`${index + 1}/${total}`} />

      <div className="panel-soft p-3 text-sm leading-relaxed">
        {b({
          it: 'Non esiste una risposta “da pilota ideale”. Il questionario incrocia domande sullo stesso tratto: rispondi d’istinto e in modo onesto, altrimenti le contraddizioni emergono da sole.',
          en: 'There is no “ideal pilot” answer. The questionnaire cross-checks questions on the same trait: answer instinctively and honestly, or the contradictions surface on their own.',
        })}
      </div>

      {isLikert ? (
        <>
          <p className="text-xl leading-relaxed">{b(likert[index].text)}</p>
          <div className="grid gap-2">
            {LIKERT_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                className="option focus-ring"
                onClick={() => answerLikert(i + 1)}
              >
                <span className="chip w-6 justify-center px-0">{i + 1}</span>
                <span>{b(label)}</span>
              </button>
            ))}
          </div>
        </>
      ) : forcedItem ? (
        <>
          <p className="text-xl leading-relaxed">
            {b({ it: 'Quale ti descrive meglio?', en: 'Which describes you better?' })}
          </p>
          <div className="grid gap-2">
            <button type="button" className="option focus-ring" onClick={answerForced}>
              {b(forcedItem.a)}
            </button>
            <button type="button" className="option focus-ring" onClick={answerForced}>
              {b(forcedItem.b)}
            </button>
          </div>
          <p className="dim text-xs">
            {b({
              it: 'Entrambe le opzioni sono socialmente accettabili: è voluto. Serve a impedire di “scegliere la risposta giusta”.',
              en: 'Both options are socially acceptable: that is deliberate. It stops you picking “the right answer”.',
            })}
          </p>
        </>
      ) : (
        <button type="button" className="btn btn-primary" onClick={finish}>
          {t('common.finish')}
        </button>
      )}
    </div>
  )
}

export const personalityModule: TrainerModule<PersonalityConfig> = {
  id: 'personality',
  kind: 'reflective',
  phase: 2,
  sourceTier: 'official',
  icon: 'mind',
  title: { it: 'Questionario di personalità', en: 'Personality questionnaire' },
  blurb: {
    it: 'Simulazione del secondo test online, con rilevatore di contraddizioni.',
    en: 'A simulation of the second online test, with a contradiction detector.',
  },
  whatItTests: {
    it: 'Familiarità con il formato e — soprattutto — la coerenza delle tue risposte. Il questionario reale ha alcune centinaia di domande ed è costruito per resistere alla desiderabilità sociale: incrocia le risposte e rileva le incoerenze. Qui il punteggio misura solo quanto resti coerente con te stesso, non quanto sei “adatto”.',
    en: 'Familiarity with the format and — above all — the consistency of your answers. The real questionnaire runs to several hundred items and is built to resist social desirability: it cross-references answers and detects contradictions. Here the score measures only how consistent you are with yourself, not how “suitable” you are.',
  },
  instructions: {
    it: [
      'Rispondi d’istinto: il tempo speso a costruire un profilo è tempo speso a contraddirti.',
      'Le domande sullo stesso tratto sono lontane fra loro e a volte capovolte: è voluto.',
      'Alla fine vedrai quante coppie sono risultate incompatibili — quelle sarebbero bandiere rosse.',
      'Un punteggio alto qui non significa “profilo giusto”: significa solo che sei stato coerente.',
    ],
    en: [
      'Answer on instinct: time spent constructing a profile is time spent contradicting yourself.',
      'Questions on the same trait sit far apart and are sometimes reversed: that is deliberate.',
      'At the end you will see how many pairs came out incompatible — those would be red flags.',
      'A high score here does not mean “the right profile”: it only means you were consistent.',
    ],
  },
  defaultConfig: { likertCount: 20, forcedChoiceCount: 4 },
  examConfig: { likertCount: 32, forcedChoiceCount: 6 },
  examDurationMs: 12 * 60 * 1000,
  inProExam: false,
  inPracticeSet: false,
  Component: PersonalityRunner,
}
