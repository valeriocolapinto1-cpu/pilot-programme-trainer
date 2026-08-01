import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { MODULES, PRACTICE_MODULES, PRO_EXAM_MODULES, getModule } from './registry'
import { generateDecoderSpec, patternOf } from './decoder/generate'
import { generateAdvancedSpec, ALL_ADVANCED_TOPICS } from './maths-advanced/generate'
import { generateMetar, metarQuestions, windComponents } from './atpl-technical/metar'
import { pairConsistency } from './personality'
import { newCard, review } from '@/lib/srs'

describe('module registry', () => {
  it('has unique ids', () => {
    const ids = MODULES.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('resolves every module by id', () => {
    for (const module of MODULES) {
      expect(getModule(module.id)).toBe(module)
    }
    expect(getModule('nope')).toBeUndefined()
  })

  it('covers the Pro exam modules', () => {
    // The guide counts 13 modules, treating Mathematics as one module with an
    // audio part and a written part. Those are separate modules here — they
    // need different UI and different practice — so the sequence runs to 14.
    expect(PRO_EXAM_MODULES).toHaveLength(14)
    expect(PRO_EXAM_MODULES.filter((m) => m.id.startsWith('maths-'))).toHaveLength(2)

    for (const module of PRO_EXAM_MODULES) {
      expect(module.examDurationMs).toBeGreaterThan(0)
      expect(module.phase).toBe(1)
    }
  })

  it('keeps the simulated exam close to the real 3-4 hour length', () => {
    const totalMs = PRO_EXAM_MODULES.reduce((sum, m) => sum + m.examDurationMs, 0)
    expect(totalMs).toBeGreaterThanOrEqual(2.5 * 60 * 60 * 1000)
    expect(totalMs).toBeLessThanOrEqual(4 * 60 * 60 * 1000)
  })

  it('covers the five TestAir360 practice areas', () => {
    expect(PRACTICE_MODULES.length).toBeGreaterThanOrEqual(5)
    const ids = PRACTICE_MODULES.map((m) => m.id)
    expect(ids).toContain('physics')
    expect(ids).toContain('maths-audio')
    expect(ids).toContain('english')
    expect(ids).toContain('balance')
  })

  it('gives every module bilingual copy and instructions', () => {
    for (const module of MODULES) {
      for (const field of [module.title, module.blurb, module.whatItTests]) {
        expect(field.it.length).toBeGreaterThan(0)
        expect(field.en.length).toBeGreaterThan(0)
      }
      expect(module.instructions.it.length).toBeGreaterThan(0)
      expect(module.instructions.it).toHaveLength(module.instructions.en.length)
      expect(module.icon.length).toBeGreaterThan(0)
    }
  })
})

describe('decoder generator', () => {
  it('gives exactly one option matching the symbol pattern', () => {
    const rng = createRng(909)
    for (let i = 0; i < 200; i++) {
      const spec = generateDecoderSpec(rng, { count: 1, perItemMs: 0, length: 5 })
      const target = patternOf(spec.symbols)
      const matching = spec.options.filter((option) => patternOf(option) === target)
      expect(matching).toHaveLength(1)
      expect(spec.options[spec.correctIndex]).toBe(matching[0])
    }
  })

  it('always includes at least one repeated symbol', () => {
    const rng = createRng(31)
    for (let i = 0; i < 100; i++) {
      const spec = generateDecoderSpec(rng, { count: 1, perItemMs: 0, length: 6 })
      expect(new Set(spec.symbols).size).toBeLessThan(spec.symbols.length)
    }
  })
})

describe('advanced maths generator', () => {
  it('produces finite answers and a tolerance for every topic', () => {
    const rng = createRng(606)
    for (let i = 0; i < 300; i++) {
      const topic = ALL_ADVANCED_TOPICS[i % ALL_ADVANCED_TOPICS.length]
      const spec = generateAdvancedSpec(rng, topic)
      expect(Number.isFinite(spec.answer)).toBe(true)
      expect(spec.tolerance).toBeGreaterThan(0)
      expect(spec.question.it.length).toBeGreaterThan(0)
      expect(spec.explanation.en.length).toBeGreaterThan(0)
    }
  })

  it('solves linear equations correctly', () => {
    const rng = createRng(12)
    for (let i = 0; i < 100; i++) {
      const spec = generateAdvancedSpec(rng, 'linear')
      const match = spec.question.en.match(/Solve for x:\s+(\d+)x ([+−]) (\d+) = (-?\d+)/)
      if (!match) continue
      const [, a, sign, b, c] = match
      const expected = (Number(c) - (sign === '+' ? Number(b) : -Number(b))) / Number(a)
      expect(spec.answer).toBeCloseTo(expected, 6)
    }
  })
})

describe('METAR generator', () => {
  it('builds a report whose groups match the parsed values', () => {
    const rng = createRng(1013)
    for (let i = 0; i < 200; i++) {
      const metar = generateMetar(rng)
      expect(metar.raw.startsWith(metar.station)).toBe(true)
      expect(metar.raw).toContain(`Q${metar.qnh}`)
      // Dew point can never exceed temperature.
      expect(metar.dewPoint).toBeLessThanOrEqual(metar.temperature)
      if (metar.cavok) expect(metar.raw).toContain('CAVOK')
    }
  })

  it('derives questions whose correct option is present exactly once', () => {
    const rng = createRng(2020)
    for (let i = 0; i < 100; i++) {
      const metar = generateMetar(rng)
      for (const question of metarQuestions(rng, metar)) {
        expect(question.options[question.correctIndex]).toBeDefined()
        expect(new Set(question.options).size).toBe(question.options.length)
      }
    }
  })

  it('computes wind components correctly', () => {
    // Straight down the runway: all headwind, no crosswind.
    expect(windComponents(90, 20, 90)).toEqual({ headwind: 20, crosswind: 0 })
    // Directly across: all crosswind.
    expect(windComponents(180, 20, 90)).toEqual({ headwind: 0, crosswind: 20 })
    // Straight tailwind reads as negative headwind.
    expect(windComponents(270, 20, 90)).toEqual({ headwind: -20, crosswind: 0 })
    // 45° off gives an equal split of about 0.707.
    const angled = windComponents(135, 20, 90)
    expect(angled.headwind).toBe(14)
    expect(angled.crosswind).toBe(14)
  })
})

describe('personality consistency', () => {
  const same = { id: 'a', pair: 'p', polarity: 'same' as const, text: { it: '', en: '' } }
  const opposite = { id: 'b', pair: 'p', polarity: 'opposite' as const, text: { it: '', en: '' } }

  it('is perfect when reverse-keyed answers mirror', () => {
    expect(pairConsistency({ item: same, value: 5 }, { item: opposite, value: 1 })).toBe(1)
    expect(pairConsistency({ item: same, value: 2 }, { item: opposite, value: 4 })).toBe(1)
  })

  it('is zero when the same trait is answered in flat contradiction', () => {
    expect(pairConsistency({ item: same, value: 5 }, { item: opposite, value: 5 })).toBe(0)
  })

  it('is perfect when same-keyed answers match', () => {
    expect(pairConsistency({ item: same, value: 4 }, { item: same, value: 4 })).toBe(1)
  })
})

describe('spaced repetition', () => {
  it('sends a failed card back within the session', () => {
    const now = Date.now()
    const card = review(newCard(now), 'again', now)
    expect(card.intervalDays).toBe(0)
    expect(card.dueAt - now).toBeLessThanOrEqual(10 * 60 * 1000)
    expect(card.lapses).toBe(1)
  })

  it('grows the interval on success', () => {
    const now = Date.now()
    let card = review(newCard(now), 'good', now)
    expect(card.intervalDays).toBe(2)
    card = review(card, 'good', now)
    expect(card.intervalDays).toBeGreaterThan(2)
  })

  it('never lets ease fall below the floor', () => {
    const now = Date.now()
    let card = newCard(now)
    for (let i = 0; i < 20; i++) card = review(card, 'again', now)
    expect(card.ease).toBeGreaterThanOrEqual(1.3)
  })
})
