import { describe, expect, it } from 'vitest'
import { buildOptions, createRng } from './rng'

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    const first = Array.from({ length: 20 }, () => a.next())
    const second = Array.from({ length: 20 }, () => b.next())
    expect(first).toEqual(second)
  })

  it('produces different streams for different seeds', () => {
    const a = Array.from({ length: 20 }, (_, i) => createRng(i).next())
    expect(new Set(a).size).toBeGreaterThan(15)
  })

  it('keeps int() inside the inclusive range', () => {
    const rng = createRng(7)
    for (let i = 0; i < 500; i++) {
      const value = rng.int(3, 9)
      expect(value).toBeGreaterThanOrEqual(3)
      expect(value).toBeLessThanOrEqual(9)
      expect(Number.isInteger(value)).toBe(true)
    }
  })

  it('shuffle keeps every element exactly once', () => {
    const rng = createRng(99)
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const output = rng.shuffle(input)
    expect(output).toHaveLength(input.length)
    expect([...output].sort((a, b) => a - b)).toEqual(input)
    // The input must not be mutated.
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('sample returns distinct elements', () => {
    const rng = createRng(4)
    const picked = rng.sample(['a', 'b', 'c', 'd', 'e'], 3)
    expect(picked).toHaveLength(3)
    expect(new Set(picked).size).toBe(3)
  })
})

describe('buildOptions', () => {
  it('always includes the correct answer at the reported index', () => {
    const rng = createRng(1)
    for (let i = 0; i < 100; i++) {
      const correct = rng.int(1, 50)
      const { options, correctIndex } = buildOptions(
        rng,
        correct,
        [correct + 1, correct - 1, correct + 10, correct + 5, correct - 3],
        4,
      )
      expect(options).toHaveLength(4)
      expect(options[correctIndex]).toBe(correct)
    }
  })

  it('never repeats the correct answer among distractors', () => {
    const rng = createRng(2)
    const { options } = buildOptions(rng, 5, [5, 5, 6, 7, 8], 4)
    expect(options.filter((o) => o === 5)).toHaveLength(1)
  })

  it('drops duplicate distractors', () => {
    const rng = createRng(3)
    const { options } = buildOptions(rng, 'x', ['a', 'a', 'b', 'c'], 4)
    expect(new Set(options).size).toBe(options.length)
  })
})
