import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import { generateEquateSpec } from './generate'

/**
 * Independently evaluates the displayed equation with the chosen option
 * substituted for the blank — the answer must make the equation true.
 */
function equationHolds(display: string, filled: string): boolean {
  const expression = display.replace('▢', filled)
  const [left, right] = expression.split('=').map((side) => side.trim())
  const toJs = (s: string) => s.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
  // eslint-disable-next-line no-new-func
  const value = new Function(`return (${toJs(left)})`)() as number
  const expected = Number(toJs(right))
  return Math.abs(value - expected) < 1e-9
}

describe('generateEquateSpec', () => {
  it('produces an equation the correct option satisfies (simple)', () => {
    const rng = createRng(4242)
    for (let i = 0; i < 300; i++) {
      const spec = generateEquateSpec(rng, { count: 1, perItemMs: 0, hard: false })
      expect(spec.display).toContain('▢')
      expect(equationHolds(spec.display, spec.options[spec.correctIndex])).toBe(true)
    }
  })

  it('produces an equation the correct option satisfies (hard, with precedence)', () => {
    const rng = createRng(777)
    for (let i = 0; i < 300; i++) {
      const spec = generateEquateSpec(rng, { count: 1, perItemMs: 0, hard: true })
      expect(equationHolds(spec.display, spec.options[spec.correctIndex])).toBe(true)
    }
  })

  it('offers distinct options and a valid index', () => {
    const rng = createRng(11)
    for (let i = 0; i < 200; i++) {
      const spec = generateEquateSpec(rng, { count: 1, perItemMs: 0, hard: i % 2 === 0 })
      expect(new Set(spec.options).size).toBe(spec.options.length)
      expect(spec.options[spec.correctIndex]).toBeDefined()
    }
  })

  it('never divides to a non-integer in the simple set', () => {
    const rng = createRng(31)
    for (let i = 0; i < 300; i++) {
      const spec = generateEquateSpec(rng, { count: 1, perItemMs: 0, hard: false })
      const result = Number(spec.display.split('=')[1].trim())
      expect(Number.isFinite(result)).toBe(true)
      expect(Number.isInteger(result)).toBe(true)
    }
  })
})
