import type { ComponentType, ReactNode } from 'react'
import type { Bilingual, BilingualList } from '@/i18n'
import type { IconName } from '@/components/Icon'

export type ModuleId =
  // Phase 1 — TestAir360 Pro exam
  | 'azimuth'
  | 'cubes'
  | 'numbers'
  | 'clocks'
  | 'decoder'
  | 'recall'
  | 'balance'
  | 'equate'
  | 'visual-perception'
  | 'maths-audio'
  | 'maths-advanced'
  | 'physics'
  | 'english'
  | 'vigilance'
  // Phase 2 — psychological questionnaire
  | 'personality'
  // Phases 3-4 — assessment day
  | 'group-exercise'
  | 'atpl-technical'
  | 'interview-hr'
  | 'wizz-knowledge'

export type ModuleKind =
  /** scored objectively, right/wrong answers */
  | 'quiz'
  /** scored on continuous performance metrics */
  | 'psychomotor'
  /** no right answer: self-assessment, consistency, preparation */
  | 'reflective'

/**
 * How well established the format is. The guide is explicit that the official
 * sources cover the structure and syllabus, while the module-by-module detail
 * comes from candidate reports — the UI shows this so nothing is taken as fact.
 */
export type SourceTier = 'official' | 'community'

export type SelectionPhase = 1 | 2 | 3 | 4

export type RunMode = 'practice' | 'exam'

export type ScoreMetric = {
  label: Bilingual
  value: string
  hint?: Bilingual
}

export type ModuleScore = {
  /** 0-100; the format TestAir360 uses to report results. */
  percent: number
  correct?: number
  total?: number
  avgResponseMs?: number
  /** Module-specific figures, e.g. time on target and balls lost for balance. */
  metrics?: ScoreMetric[]
}

export type ModuleRuntimeProps<TConfig> = {
  config: TConfig
  seed: number
  mode: RunMode
  /** Called once when the module is complete; ends the attempt. */
  onFinish: (score: ModuleScore) => void
}

export interface TrainerModule<TConfig = unknown> {
  id: ModuleId
  kind: ModuleKind
  phase: SelectionPhase
  sourceTier: SourceTier
  /** Name from the in-house line-icon set (src/components/Icon.tsx). */
  icon: IconName
  title: Bilingual
  blurb: Bilingual
  /** What the real thing looks like, shown on the intro screen. */
  whatItTests: Bilingual
  instructions: BilingualList
  defaultConfig: TConfig
  examConfig: TConfig
  /** Time slot inside the simulated Pro exam. */
  examDurationMs: number
  /** Part of the 13-module Pro exam sequence. */
  inProExam: boolean
  /** Part of the 5-area TestAir360 practice set. */
  inPracticeSet: boolean
  Component: ComponentType<ModuleRuntimeProps<TConfig>>
}

/** Helper for content that is identical in both languages (numbers, codes). */
export function mono(value: string): Bilingual {
  return { it: value, en: value }
}

/** A multiple-choice or free-entry question used by the shared quiz engine. */
export type QuizItem = {
  id: string
  /** Text above the answer area. */
  stem?: Bilingual
  /** Optional visual (compass, cube, dials…) rendered above the options. */
  visual?: ReactNode
  topic?: Bilingual
  explanation?: Bilingual
} & (
  | {
      inputMode: 'choice'
      options: Bilingual[]
      correctIndex: number
    }
  | {
      inputMode: 'numeric'
      /** Accepted answer; comparison is numeric with an optional tolerance. */
      numericAnswer: number
      tolerance?: number
      unit?: Bilingual
    }
  | {
      inputMode: 'text'
      /** Accepted answers, compared case-insensitively after trimming. */
      textAnswers: string[]
    }
)

export type QuizAnswer = {
  itemId: string
  correct: boolean
  responseMs: number
  /** What the candidate entered / picked, for the review screen. */
  given: string | null
}
