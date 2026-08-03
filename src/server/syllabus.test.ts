import { describe, expect, it } from 'vitest'
import {
  SUBJECTS,
  availableTopics,
  buildQuizPrompt,
  fallbackItems,
  normaliseAI,
  type Subject,
} from './syllabus'

/**
 * The fallback path is what runs when no API key is configured, so it must
 * always return valid, playable, program-grounded questions.
 */
describe('fallbackItems', () => {
  for (const subject of SUBJECTS) {
    it(`${subject}: returns well-formed 4-option questions`, () => {
      const items = fallbackItems(subject, 6, 12345)
      expect(items.length).toBeGreaterThan(0)
      for (const item of items) {
        expect(item.options.length).toBe(4)
        expect(item.correctIndex).toBeGreaterThanOrEqual(0)
        expect(item.correctIndex).toBeLessThan(4)
        expect(item.stem.it.length).toBeGreaterThan(0)
        expect(item.stem.en.length).toBeGreaterThan(0)
        // Options are bilingual and distinct.
        const labels = item.options.map((o) => o.it)
        expect(new Set(labels).size).toBe(labels.length)
        for (const opt of item.options) {
          expect(opt.it.length).toBeGreaterThan(0)
          expect(opt.en.length).toBeGreaterThan(0)
        }
      }
    })
  }

  it('is deterministic for a given seed', () => {
    const a = fallbackItems('physics', 4, 999)
    const b = fallbackItems('physics', 4, 999)
    expect(a.map((i) => i.stem.en)).toEqual(b.map((i) => i.stem.en))
  })
})

describe('buildQuizPrompt', () => {
  it('grounds the prompt in the subject syllabus', () => {
    const { system, user } = buildQuizPrompt({ subject: 'physics', difficulty: 'medium', count: 5 })
    expect(system).toContain('Wizz Air Pathway')
    expect(system.toLowerCase()).toContain('kinematics')
    expect(system).toContain('4 options')
    expect(user).toContain('5')
  })

  it('covers every subject with real topics', () => {
    for (const subject of SUBJECTS as Subject[]) {
      expect(availableTopics(subject).length).toBeGreaterThan(0)
      const { system } = buildQuizPrompt({ subject, difficulty: 'hard', count: 3 })
      expect(system.length).toBeGreaterThan(200)
    }
  })
})

describe('normaliseAI', () => {
  it('accepts a valid model payload', () => {
    const raw = {
      items: [
        {
          stem: { it: 'D?', en: 'Q?' },
          options: [
            { it: 'a', en: 'a' },
            { it: 'b', en: 'b' },
            { it: 'c', en: 'c' },
            { it: 'd', en: 'd' },
          ],
          correct_index: 2,
          explanation: { it: 'perché', en: 'because' },
        },
      ],
    }
    const items = normaliseAI(raw, 'maths')
    expect(items).toHaveLength(1)
    expect(items[0].correctIndex).toBe(2)
    expect(items[0].options).toHaveLength(4)
  })

  it('rejects malformed payloads (wrong option count)', () => {
    const bad = {
      items: [{ stem: { it: 'x', en: 'x' }, options: [{ it: 'a', en: 'a' }], correct_index: 0 }],
    }
    expect(() => normaliseAI(bad, 'physics')).toThrow()
  })
})
