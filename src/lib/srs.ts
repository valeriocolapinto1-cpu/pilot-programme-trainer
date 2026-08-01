import type { CardState } from '@/store/progressStore'

/**
 * Simplified SM-2 spaced repetition. Enough to space out the Wizz Air facts
 * without pretending to be Anki: four grades, an ease factor and an interval.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy'

export const DAY_MS = 24 * 60 * 60 * 1000

export function newCard(now = Date.now()): CardState {
  return { ease: 2.5, intervalDays: 0, dueAt: now, reps: 0, lapses: 0 }
}

export function review(card: CardState, grade: Grade, now = Date.now()): CardState {
  if (grade === 'again') {
    return {
      ease: Math.max(1.3, card.ease - 0.2),
      intervalDays: 0,
      // Show it again in the same session, ten minutes out.
      dueAt: now + 10 * 60 * 1000,
      reps: card.reps + 1,
      lapses: card.lapses + 1,
    }
  }

  const easeDelta = grade === 'hard' ? -0.15 : grade === 'easy' ? 0.15 : 0
  const ease = Math.max(1.3, Math.min(3, card.ease + easeDelta))

  let intervalDays: number
  if (card.intervalDays === 0) {
    intervalDays = grade === 'hard' ? 1 : grade === 'good' ? 2 : 4
  } else {
    const factor = grade === 'hard' ? 1.2 : ease
    intervalDays = Math.max(1, Math.round(card.intervalDays * factor))
  }

  return {
    ease,
    intervalDays,
    dueAt: now + intervalDays * DAY_MS,
    reps: card.reps + 1,
    lapses: card.lapses,
  }
}

export function isDue(card: CardState | undefined, now = Date.now()): boolean {
  return !card || card.dueAt <= now
}

/** Cards due now first, then the ones due soonest. */
export function pickDue<T extends { id: string }>(
  cards: T[],
  states: Record<string, CardState>,
  limit: number,
  now = Date.now(),
): T[] {
  const due = cards.filter((card) => isDue(states[card.id], now))
  if (due.length >= limit) {
    return due
      .sort((a, b) => (states[a.id]?.dueAt ?? 0) - (states[b.id]?.dueAt ?? 0))
      .slice(0, limit)
  }
  const rest = cards
    .filter((card) => !isDue(states[card.id], now))
    .sort((a, b) => (states[a.id]?.dueAt ?? 0) - (states[b.id]?.dueAt ?? 0))
  return [...due, ...rest].slice(0, limit)
}
