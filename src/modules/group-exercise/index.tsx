import { useCallback, useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { createRng } from '@/lib/rng'
import { useCountdown } from '@/lib/useTimer'
import { TimerBar } from '@/components/ui'
import { formatDuration } from '@/lib/format'
import { useProgress } from '@/store/progressStore'
import { CRM_RUBRIC, GROUP_SCENARIOS } from '@/data/scenarios'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type GroupConfig = {
  /** Time on the scenario before the self-assessment. */
  scenarioMs: number
}

function GroupRunner({ config, seed, onFinish }: ModuleRuntimeProps<GroupConfig>) {
  const { t, b } = useI18n()
  const rng = useMemo(() => createRng(seed), [seed])
  const scenario = useMemo(() => rng.pick(GROUP_SCENARIOS), [rng])
  const notes = useProgress((s) => s.notes)
  const setNote = useProgress((s) => s.setNote)

  const [phase, setPhase] = useState<'brief' | 'rubric' | 'debrief'>('brief')
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const timer = useCountdown(config.scenarioMs, 'group', {
    running: phase === 'brief',
    onExpire: () => setPhase('rubric'),
  })

  const noteKey = `group.${scenario.id}`

  const finish = useCallback(() => {
    const values = CRM_RUBRIC.map((d) => ratings[d.id] ?? 0)
    const answered = values.filter((v) => v > 0)
    onFinish({
      percent:
        answered.length > 0
          ? (answered.reduce((s, v) => s + v, 0) / (answered.length * 5)) * 100
          : 0,
      correct: answered.length,
      total: CRM_RUBRIC.length,
      metrics: [
        {
          label: { it: 'Autovalutazione', en: 'Self-assessment' },
          value: `${answered.length}/${CRM_RUBRIC.length}`,
          hint: {
            it: 'Questo modulo non ha risposte giuste: il punteggio riflette la tua autovalutazione CRM.',
            en: 'This module has no right answers: the score reflects your own CRM self-assessment.',
          },
        },
      ],
    })
  }, [onFinish, ratings])

  if (phase === 'brief') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <TimerBar fraction={timer.fraction} label={formatDuration(timer.remaining)} />
        <h3 className="text-xl font-semibold">{b(scenario.title)}</h3>
        <p className="leading-relaxed">{b(scenario.brief)}</p>

        <div className="panel-soft p-3">
          <p className="dim mb-2 text-xs uppercase tracking-wide">
            {b({ it: 'Vincoli', en: 'Constraints' })}
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {b(scenario.constraints).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        <label className="flex flex-col gap-2">
          <span className="dim text-sm">
            {b({
              it: 'Scrivi la proposta che porteresti al gruppo, e le assunzioni che dichiareresti:',
              en: 'Write the proposal you would bring to the group, and the assumptions you would state:',
            })}
          </span>
          <textarea
            className="panel-soft focus-ring min-h-40 p-3"
            style={{ color: 'var(--text)' }}
            value={notes[noteKey] ?? ''}
            onChange={(e) => setNote(noteKey, e.target.value)}
          />
        </label>

        <button type="button" className="btn btn-primary self-center" onClick={() => setPhase('rubric')}>
          {t('common.continue')}
        </button>
      </div>
    )
  }

  if (phase === 'rubric') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h3 className="text-xl font-semibold">{t('common.selfAssessment')}</h3>
        <p className="dim text-sm">
          {b({
            it: 'Valuta da 1 a 5 come ti saresti comportato nel gruppo su ciascuna competenza CRM. Sii severo: qui non c’è nessuno da convincere.',
            en: 'Rate 1 to 5 how you would have behaved in the group on each CRM competency. Be strict: there is nobody here to impress.',
          })}
        </p>

        {CRM_RUBRIC.map((dimension) => (
          <div key={dimension.id} className="panel-soft p-3">
            <p className="font-semibold">{b(dimension.label)}</p>
            <p className="mt-1.5 flex gap-2 text-sm">
              <span className="flex-none" style={{ color: 'var(--pos)' }}>
                +
              </span>
              <span className="dim">{b(dimension.good)}</span>
            </p>
            <p className="flex gap-2 text-sm">
              <span className="flex-none" style={{ color: 'var(--neg)' }}>
                −
              </span>
              <span className="dim">{b(dimension.bad)}</span>
            </p>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="btn flex-1"
                  style={
                    ratings[dimension.id] === value
                      ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' }
                      : undefined
                  }
                  onClick={() => setRatings((r) => ({ ...r, [dimension.id]: value }))}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-primary" onClick={() => setPhase('debrief')}>
          {b({ it: 'Vedi il debriefing', en: 'See the debrief' })}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h3 className="text-xl font-semibold">{b({ it: 'Debriefing', en: 'Debrief' })}</h3>
      <ul className="list-inside list-disc space-y-2">
        {b(scenario.debrief).map((line, i) => (
          <li key={i} className="leading-relaxed">
            {line}
          </li>
        ))}
      </ul>
      <p className="dim text-sm leading-relaxed">
        {b({
          it: 'Criterio chiave: non conta risolvere correttamente il problema, ma come interagisci nel gruppo. Cadetti, primi ufficiali esperti e comandanti possono essere valutati insieme.',
          en: 'Key criterion: solving the problem correctly is not the point — how you interact in the group is. Cadets, experienced first officers and captains may be assessed together.',
        })}
      </p>
      <button type="button" className="btn btn-primary" onClick={finish}>
        {t('common.finish')}
      </button>
    </div>
  )
}

export const groupExerciseModule: TrainerModule<GroupConfig> = {
  id: 'group-exercise',
  kind: 'reflective',
  phase: 3,
  sourceTier: 'community',
  icon: 'people',
  title: { it: 'Group exercise', en: 'Group exercise' },
  blurb: {
    it: 'Scenari a risorse insufficienti, con rubrica CRM e debriefing.',
    en: 'Scenarios with insufficient resources, plus a CRM rubric and debrief.',
  },
  whatItTests: {
    it: 'Le competenze CRM valutate nella giornata in presenza: comunicazione, ascolto attivo, equilibrio fra leadership e followership, inclusione, compostezza sotto pressione. Il compito è volutamente impossibile da risolvere bene nel tempo dato — proprio come quello reale.',
    en: 'The CRM competencies assessed on the day: communication, active listening, the balance between leading and following, inclusion, composure under pressure. The task is deliberately impossible to solve well in the time given — just like the real one.',
  },
  instructions: {
    it: [
      'Non cercare la soluzione perfetta: non esiste, ed è per questo che l’esercizio è costruito così.',
      'Dichiara le informazioni che mancano invece di inventarle.',
      'Da evitare: dominare la discussione, restare passivo, fissarsi sulla propria soluzione, competere apertamente.',
      'Coinvolgi chi tace: è una delle poche cose che gli assessor annotano esplicitamente.',
    ],
    en: [
      'Do not look for the perfect solution: there is none, and that is why the exercise is built this way.',
      'State the information that is missing instead of inventing it.',
      'Avoid: dominating the discussion, staying passive, digging in on your own solution, competing openly.',
      'Bring in whoever is quiet: it is one of the few things assessors note explicitly.',
    ],
  },
  defaultConfig: { scenarioMs: 8 * 60 * 1000 },
  examConfig: { scenarioMs: 8 * 60 * 1000 },
  examDurationMs: 12 * 60 * 1000,
  inProExam: false,
  inPracticeSet: false,
  Component: GroupRunner,
}
