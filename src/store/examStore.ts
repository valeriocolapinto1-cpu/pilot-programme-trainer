import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModuleId, ModuleScore } from '@/modules/types'

export type ExamKind = 'full' | 'practice'

export type ExamSession = {
  id: string
  kind: ExamKind
  startedAt: number
  moduleIds: ModuleId[]
  /** One seed per module so a resumed exam regenerates identical items. */
  seeds: number[]
  index: number
  scores: Partial<Record<ModuleId, ModuleScore>>
  /** Set once the halfway break has been taken. */
  breakTaken: boolean
}

type ExamState = {
  session: ExamSession | null
  start: (session: ExamSession) => void
  recordScore: (moduleId: ModuleId, score: ModuleScore) => void
  advance: () => void
  takeBreak: () => void
  clear: () => void
}

export const useExam = create<ExamState>()(
  persist(
    (set) => ({
      session: null,
      start: (session) => set({ session }),
      recordScore: (moduleId, score) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, scores: { ...state.session.scores, [moduleId]: score } } }
            : state,
        ),
      advance: () =>
        set((state) =>
          state.session ? { session: { ...state.session, index: state.session.index + 1 } } : state,
        ),
      takeBreak: () =>
        set((state) => (state.session ? { session: { ...state.session, breakTaken: true } } : state)),
      clear: () => set({ session: null }),
    }),
    { name: 'pathway.exam' },
  ),
)
