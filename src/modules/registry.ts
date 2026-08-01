import type { ModuleId, TrainerModule } from '@/modules/types'
import { azimuthModule } from './azimuth'
import { cubesModule } from './cubes'
import { numbersModule } from './numbers'
import { clocksModule } from './clocks'
import { decoderModule } from './decoder'
import { equateModule } from './equate'
import { recallModule } from './recall'
import { visualPerceptionModule } from './visual-perception'
import { balanceModule } from './balance'
import { vigilanceModule } from './vigilance'
import { mathsAudioModule } from './maths-audio'
import { mathsAdvancedModule } from './maths-advanced'
import { physicsModule } from './physics'
import { englishModule } from './english'
import { personalityModule } from './personality'
import { groupExerciseModule } from './group-exercise'
import { atplTechnicalModule } from './atpl-technical'
import { interviewHrModule } from './interview-hr'
import { wizzKnowledgeModule } from './wizz-knowledge'

/**
 * Every module in the order the simulated Pro exam runs them. The registry is
 * the single source of truth for the modules list, the exam sequence and the
 * routes — adding a module here is all it takes to wire it in everywhere.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MODULES: TrainerModule<any>[] = [
  azimuthModule,
  cubesModule,
  numbersModule,
  clocksModule,
  decoderModule,
  recallModule,
  balanceModule,
  equateModule,
  visualPerceptionModule,
  mathsAudioModule,
  mathsAdvancedModule,
  physicsModule,
  englishModule,
  vigilanceModule,
  personalityModule,
  groupExerciseModule,
  atplTechnicalModule,
  interviewHrModule,
  wizzKnowledgeModule,
]

export function getModule(id: string): TrainerModule<unknown> | undefined {
  return MODULES.find((m) => m.id === id) as TrainerModule<unknown> | undefined
}

/** The 13 modules that make up the simulated TestAir360 Pro exam. */
export const PRO_EXAM_MODULES = MODULES.filter((m) => m.inProExam)

/** The 5 areas covered by the free TestAir360 practice tests. */
export const PRACTICE_MODULES = MODULES.filter((m) => m.inPracticeSet)

/** Modules whose score is objective enough to drive the "weak spots" ranking. */
export const SCORED_MODULE_IDS: ModuleId[] = MODULES.filter((m) => m.kind !== 'reflective').map(
  (m) => m.id,
)

export const PRO_EXAM_DURATION_MS = PRO_EXAM_MODULES.reduce(
  (sum, m) => sum + m.examDurationMs,
  0,
)

export const PRACTICE_DURATION_MS = PRACTICE_MODULES.reduce(
  (sum, m) => sum + m.examDurationMs,
  0,
)
