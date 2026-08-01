import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dayKey } from '@/lib/format'
import type { ModuleId, ModuleScore, RunMode } from '@/modules/types'

export type Attempt = {
  id: string
  moduleId: ModuleId
  at: number
  durationMs: number
  mode: RunMode
  score: ModuleScore
  /** Set when the attempt was part of a simulated exam run. */
  examId?: string
}

export type ExamRun = {
  id: string
  at: number
  kind: 'full' | 'practice'
  moduleIds: ModuleId[]
  scores: Partial<Record<ModuleId, ModuleScore>>
  completed: boolean
  durationMs: number
}

/** SM-2 style card state for the Wizz Air knowledge flashcards. */
export type CardState = {
  ease: number
  intervalDays: number
  dueAt: number
  reps: number
  lapses: number
}

type ProgressState = {
  attempts: Attempt[]
  exams: ExamRun[]
  cards: Record<string, CardState>
  checklist: Record<string, boolean>
  /** Free-text answers the user drafted for STAR interview questions. */
  notes: Record<string, string>
  addAttempt: (attempt: Omit<Attempt, 'id'>) => void
  saveExam: (run: ExamRun) => void
  setCard: (cardId: string, state: CardState) => void
  toggleChecklist: (key: string) => void
  setNote: (key: string, value: string) => void
  resetAll: () => void
  replaceAll: (data: ExportedData) => void
}

export type ExportedData = {
  version: 1
  exportedAt: number
  attempts: Attempt[]
  exams: ExamRun[]
  cards: Record<string, CardState>
  checklist: Record<string, boolean>
  notes: Record<string, string>
}

/** Keeps localStorage bounded; a year of daily practice fits comfortably. */
const MAX_ATTEMPTS = 800
const MAX_EXAMS = 60

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      attempts: [],
      exams: [],
      cards: {},
      checklist: {},
      notes: {},

      addAttempt: (attempt) =>
        set((state) => ({
          attempts: [{ ...attempt, id: newId() }, ...state.attempts].slice(0, MAX_ATTEMPTS),
        })),

      saveExam: (run) =>
        set((state) => ({
          exams: [run, ...state.exams.filter((e) => e.id !== run.id)].slice(0, MAX_EXAMS),
        })),

      setCard: (cardId, cardState) =>
        set((state) => ({ cards: { ...state.cards, [cardId]: cardState } })),

      toggleChecklist: (key) =>
        set((state) => ({ checklist: { ...state.checklist, [key]: !state.checklist[key] } })),

      setNote: (key, value) => set((state) => ({ notes: { ...state.notes, [key]: value } })),

      resetAll: () => set({ attempts: [], exams: [], cards: {}, checklist: {}, notes: {} }),

      replaceAll: (data) =>
        set({
          attempts: data.attempts ?? [],
          exams: data.exams ?? [],
          cards: data.cards ?? {},
          checklist: data.checklist ?? {},
          notes: data.notes ?? {},
        }),
    }),
    { name: 'pathway.progress' },
  ),
)

// ---------------------------------------------------------------------------
// Derived statistics. Plain functions so they can be unit-tested without React.
// ---------------------------------------------------------------------------

export type ModuleStats = {
  attempts: number
  last: number | null
  best: number | null
  average: number | null
  lastAt: number | null
  /** Oldest → newest, capped at 10, for the sparkline. */
  trend: number[]
}

export function statsForModule(attempts: Attempt[], moduleId: ModuleId): ModuleStats {
  const mine = attempts.filter((a) => a.moduleId === moduleId)
  if (mine.length === 0) {
    return { attempts: 0, last: null, best: null, average: null, lastAt: null, trend: [] }
  }
  const percents = mine.map((a) => a.score.percent)
  return {
    attempts: mine.length,
    last: percents[0],
    best: Math.max(...percents),
    average: percents.reduce((s, p) => s + p, 0) / percents.length,
    lastAt: mine[0].at,
    trend: percents.slice(0, 10).reverse(),
  }
}

/**
 * Modules the candidate should train next: lowest recent average first, with
 * never-attempted scored modules surfaced too (they are unknowns, not zeros).
 */
export function weakestModules(
  attempts: Attempt[],
  candidateIds: ModuleId[],
  count = 3,
): { moduleId: ModuleId; average: number | null }[] {
  const scored = candidateIds.map((moduleId) => {
    const recent = attempts.filter((a) => a.moduleId === moduleId).slice(0, 5)
    const average =
      recent.length > 0
        ? recent.reduce((s, a) => s + a.score.percent, 0) / recent.length
        : null
    return { moduleId, average }
  })

  const attempted = scored.filter((s) => s.average !== null)
  const untouched = scored.filter((s) => s.average === null)

  attempted.sort((a, b) => (a.average as number) - (b.average as number))
  // Untouched modules only fill the remaining slots, after real weak spots.
  return [...attempted, ...untouched].slice(0, count)
}

export function overallAverage(attempts: Attempt[]): number | null {
  if (attempts.length === 0) return null
  const recent = attempts.slice(0, 30)
  return recent.reduce((s, a) => s + a.score.percent, 0) / recent.length
}

/** Consecutive days with at least one attempt, counting back from today. */
export function currentStreak(attempts: Attempt[], now = Date.now()): number {
  if (attempts.length === 0) return 0
  const days = new Set(attempts.map((a) => dayKey(a.at)))
  let streak = 0
  const cursor = new Date(now)
  // Allow the streak to survive a day that has not been trained yet.
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function exportData(state: ProgressState): ExportedData {
  return {
    version: 1,
    exportedAt: Date.now(),
    attempts: state.attempts,
    exams: state.exams,
    cards: state.cards,
    checklist: state.checklist,
    notes: state.notes,
  }
}

export function parseImport(raw: string): ExportedData | null {
  try {
    const data = JSON.parse(raw) as ExportedData
    if (data.version !== 1 || !Array.isArray(data.attempts)) return null
    return data
  } catch {
    return null
  }
}
