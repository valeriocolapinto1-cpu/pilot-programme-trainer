import { describe, expect, it } from 'vitest'
import {
  currentStreak,
  overallAverage,
  parseImport,
  statsForModule,
  weakestModules,
  type Attempt,
} from './progressStore'
import type { ModuleId } from '@/modules/types'

const DAY = 24 * 60 * 60 * 1000

function attempt(moduleId: ModuleId, percent: number, at: number): Attempt {
  return {
    id: `${moduleId}-${at}-${percent}`,
    moduleId,
    at,
    durationMs: 60000,
    mode: 'practice',
    score: { percent },
  }
}

describe('statsForModule', () => {
  it('reports nothing for a module never attempted', () => {
    const stats = statsForModule([], 'azimuth')
    expect(stats).toEqual({
      attempts: 0,
      last: null,
      best: null,
      average: null,
      lastAt: null,
      trend: [],
    })
  })

  it('summarises attempts, newest first', () => {
    const now = Date.now()
    // The store keeps attempts newest-first.
    const attempts = [
      attempt('azimuth', 80, now),
      attempt('azimuth', 40, now - DAY),
      attempt('cubes', 10, now - DAY),
    ]
    const stats = statsForModule(attempts, 'azimuth')
    expect(stats.attempts).toBe(2)
    expect(stats.last).toBe(80)
    expect(stats.best).toBe(80)
    expect(stats.average).toBe(60)
    // Trend runs oldest → newest for the sparkline.
    expect(stats.trend).toEqual([40, 80])
  })

  it('caps the trend at ten points', () => {
    const now = Date.now()
    const attempts = Array.from({ length: 20 }, (_, i) => attempt('cubes', i, now - i * 1000))
    expect(statsForModule(attempts, 'cubes').trend).toHaveLength(10)
  })
})

describe('weakestModules', () => {
  it('ranks attempted modules by lowest recent average first', () => {
    const now = Date.now()
    const attempts = [
      attempt('azimuth', 90, now),
      attempt('cubes', 30, now),
      attempt('numbers', 60, now),
    ]
    const result = weakestModules(attempts, ['azimuth', 'cubes', 'numbers'], 3)
    expect(result.map((r) => r.moduleId)).toEqual(['cubes', 'numbers', 'azimuth'])
  })

  it('places never-attempted modules after real weak spots', () => {
    const attempts = [attempt('cubes', 20, Date.now())]
    const result = weakestModules(attempts, ['cubes', 'decoder'], 2)
    expect(result[0].moduleId).toBe('cubes')
    expect(result[1]).toEqual({ moduleId: 'decoder', average: null })
  })

  it('respects the requested count', () => {
    const now = Date.now()
    const attempts = [
      attempt('azimuth', 10, now),
      attempt('cubes', 20, now),
      attempt('numbers', 30, now),
    ]
    expect(weakestModules(attempts, ['azimuth', 'cubes', 'numbers'], 2)).toHaveLength(2)
  })
})

describe('overallAverage', () => {
  it('is null with no attempts', () => {
    expect(overallAverage([])).toBeNull()
  })

  it('averages the most recent attempts', () => {
    const now = Date.now()
    expect(overallAverage([attempt('cubes', 40, now), attempt('cubes', 60, now - 1)])).toBe(50)
  })
})

describe('currentStreak', () => {
  const now = new Date('2026-03-15T12:00:00Z').getTime()

  it('is zero with no attempts', () => {
    expect(currentStreak([], now)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const attempts = [
      attempt('cubes', 50, now),
      attempt('cubes', 50, now - DAY),
      attempt('cubes', 50, now - 2 * DAY),
    ]
    expect(currentStreak(attempts, now)).toBe(3)
  })

  it('survives a day that has not been trained yet', () => {
    const attempts = [attempt('cubes', 50, now - DAY), attempt('cubes', 50, now - 2 * DAY)]
    expect(currentStreak(attempts, now)).toBe(2)
  })

  it('breaks on a gap', () => {
    const attempts = [attempt('cubes', 50, now), attempt('cubes', 50, now - 3 * DAY)]
    expect(currentStreak(attempts, now)).toBe(1)
  })
})

describe('parseImport', () => {
  it('accepts a valid export', () => {
    const payload = JSON.stringify({
      version: 1,
      exportedAt: Date.now(),
      attempts: [],
      exams: [],
      cards: {},
      checklist: {},
      notes: {},
    })
    expect(parseImport(payload)).not.toBeNull()
  })

  it('rejects malformed or foreign data', () => {
    expect(parseImport('not json')).toBeNull()
    expect(parseImport('{"version":2,"attempts":[]}')).toBeNull()
    expect(parseImport('{"version":1}')).toBeNull()
  })
})
