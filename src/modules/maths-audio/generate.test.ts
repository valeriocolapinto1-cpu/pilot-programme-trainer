import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { ALL_MATHS_TOPICS, generateMathsSpec } from './generate'

/**
 * Recomputes the answer from the written form, independently of the generator,
 * so a wrong formula in the generator cannot pass unnoticed.
 */
function evaluateWritten(written: string): number | null {
  const multiplication = written.match(/^(\d+) × (\d+)$/)
  if (multiplication) return Number(multiplication[1]) * Number(multiplication[2])

  const division = written.match(/^(\d+) ÷ (\d+)$/)
  if (division) return Number(division[1]) / Number(division[2])

  const square = written.match(/^(\d+)²$/)
  if (square) return Number(square[1]) ** 2

  const power = written.match(/^(\d+)\^(\d+)$/)
  if (power) return Number(power[1]) ** Number(power[2])

  const percentage = written.match(/^([\d.]+)% × (\d+)$/)
  if (percentage) return (Number(percentage[1]) / 100) * Number(percentage[2])

  const fraction = written.match(/^(\d+)\/(\d+) × (\d+)$/)
  if (fraction) return (Number(fraction[1]) / Number(fraction[2])) * Number(fraction[3])

  return null
}

describe('generateMathsSpec', () => {
  it('answers match an independent evaluation of the written form', () => {
    const rng = createRng(2718)
    for (let i = 0; i < 400; i++) {
      const topic = ALL_MATHS_TOPICS[i % ALL_MATHS_TOPICS.length]
      const spec = generateMathsSpec(rng, topic)
      const expected = evaluateWritten(spec.written)
      if (expected === null) continue
      expect(spec.answer).toBeCloseTo(expected, 6)
    }
  })

  it('produces finite answers for every topic', () => {
    const rng = createRng(3141)
    for (let i = 0; i < 400; i++) {
      const topic = ALL_MATHS_TOPICS[i % ALL_MATHS_TOPICS.length]
      const spec = generateMathsSpec(rng, topic)
      expect(Number.isFinite(spec.answer)).toBe(true)
      expect(spec.written.length).toBeGreaterThan(0)
      expect(spec.spoken.it.length).toBeGreaterThan(0)
      expect(spec.spoken.en.length).toBeGreaterThan(0)
    }
  })

  it('keeps division answers whole', () => {
    const rng = createRng(17)
    for (let i = 0; i < 200; i++) {
      const spec = generateMathsSpec(rng, 'division')
      expect(Number.isInteger(spec.answer)).toBe(true)
    }
  })

  it('keeps speed-distance-time answers clean enough for mental arithmetic', () => {
    const rng = createRng(23)
    for (let i = 0; i < 300; i++) {
      const spec = generateMathsSpec(rng, 'speed-distance-time')
      // Half-units are acceptable; anything finer is not doable in ten seconds.
      expect(Math.abs(spec.answer * 2 - Math.round(spec.answer * 2))).toBeLessThan(1e-9)
    }
  })

  it('continues sequences correctly', () => {
    const rng = createRng(53)
    for (let i = 0; i < 200; i++) {
      const spec = generateMathsSpec(rng, 'sequence')
      const shown = spec.written
        .replace(', ?', '')
        .split(', ')
        .map(Number)
      expect(shown).toHaveLength(4)

      const differences = shown.slice(1).map((v, index) => v - shown[index])
      const ratios = shown.slice(1).map((v, index) => v / shown[index])

      const isArithmetic = new Set(differences).size === 1
      const isGeometric = new Set(ratios).size === 1
      // Third family: the gap grows by a constant 2 at each step.
      const secondDifferences = differences.slice(1).map((d, index) => d - differences[index])
      const isQuadratic = new Set(secondDifferences).size === 1

      expect(isArithmetic || isGeometric || isQuadratic).toBe(true)

      if (isArithmetic) expect(spec.answer).toBe(shown[3] + differences[0])
      else if (isGeometric) expect(spec.answer).toBe(shown[3] * ratios[0])
      else expect(spec.answer).toBe(shown[3] + differences[2] + secondDifferences[0])
    }
  })
})
