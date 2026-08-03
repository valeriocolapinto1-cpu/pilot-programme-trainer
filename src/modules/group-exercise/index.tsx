import { GroupChatRunner } from '@/components/GroupChatRunner'
import type { ModuleRuntimeProps, TrainerModule } from '@/modules/types'

export type GroupConfig = {
  /** Time in the live chat before the CRM assessment. */
  scenarioMs: number
}

function GroupRunner({ config, onFinish }: ModuleRuntimeProps<GroupConfig>) {
  return <GroupChatRunner scenarioMs={config.scenarioMs} onFinish={onFinish} />
}

export const groupExerciseModule: TrainerModule<GroupConfig> = {
  id: 'group-exercise',
  kind: 'reflective',
  phase: 3,
  sourceTier: 'community',
  icon: 'people',
  title: { it: 'Group exercise (chat IA)', en: 'Group exercise (AI chat)' },
  blurb: {
    it: 'Una chat di gruppo dal vivo con compagni simulati dall’IA, che valuta le tue competenze CRM.',
    en: 'A live group chat with AI-simulated co-candidates that assesses your CRM competencies.',
  },
  whatItTests: {
    it: 'Le competenze CRM della giornata in presenza: comunicazione, ascolto attivo, equilibrio fra leadership e followership, inclusione, compostezza sotto pressione. Discuti in chat con tre compagni (uno che domina, una silenziosa, uno collaborativo) e un facilitatore che mette pressione sul tempo. Alla fine un assessor IA valuta il tuo comportamento, non la soluzione. Lo scenario è volutamente irrisolvibile nel tempo dato — come quello vero.',
    en: 'The CRM competencies of the assessment day: communication, active listening, the balance between leading and following, inclusion, composure under pressure. You discuss in a chat with three co-candidates (a dominant one, a quiet one, a collaborative one) and a facilitator who applies time pressure. At the end an AI assessor scores your behaviour, not the solution. The scenario is deliberately unsolvable in the time given — like the real one.',
  },
  instructions: {
    it: [
      'Guida la discussione senza dominarla: proponi una struttura e chiedi il parere degli altri.',
      'Includi chi tace (Sofia parla solo se la coinvolgi) e gestisci chi domina (Marco).',
      'Dichiara le informazioni che mancano invece di inventarle: è un comportamento premiante.',
      'Resta calmo quando il facilitatore mette pressione sul tempo. Poi premi “Termina e valuta”.',
      'Serve una API key configurata sul server; senza, resta l’autovalutazione CRM.',
    ],
    en: [
      'Lead the discussion without dominating it: propose a structure and ask others for their view.',
      'Include the quiet one (Sofia speaks only if you invite her) and manage the dominant one (Marco).',
      'State the information that is missing instead of inventing it: it is a rewarded behaviour.',
      'Stay calm when the facilitator applies time pressure. Then press “End & assess”.',
      'This needs an API key configured on the server; without it, the CRM self-assessment remains.',
    ],
  },
  defaultConfig: { scenarioMs: 8 * 60 * 1000 },
  examConfig: { scenarioMs: 8 * 60 * 1000 },
  examDurationMs: 12 * 60 * 1000,
  inProExam: false,
  inPracticeSet: false,
  Component: GroupRunner,
}
