import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import {
  clockPosition,
  formatBearing,
  generateAzimuthSpec,
  normaliseBearing,
  type AzimuthVariant,
} from './generate'

describe('normaliseBearing', () => {
  it('wraps into 0-359', () => {
    expect(normaliseBearing(0)).toBe(0)
    expect(normaliseBearing(360)).toBe(0)
    expect(normaliseBearing(370)).toBe(10)
    expect(normaliseBearing(-10)).toBe(350)
    expect(normaliseBearing(-370)).toBe(350)
  })
})

describe('formatBearing', () => {
  it('always uses three digits', () => {
    expect(formatBearing(5)).toBe('005°')
    expect(formatBearing(45)).toBe('045°')
    expect(formatBearing(360)).toBe('000°')
  })
})

describe('clockPosition', () => {
  it('puts traffic straight ahead at 12', () => {
    expect(clockPosition(90, 90)).toBe(12)
    expect(clockPosition(0, 5)).toBe(12)
  })

  it('puts traffic on the right at 3 and on the left at 9', () => {
    expect(clockPosition(0, 90)).toBe(3)
    expect(clockPosition(0, 270)).toBe(9)
    expect(clockPosition(180, 270)).toBe(3)
  })

  it('puts traffic behind at 6', () => {
    expect(clockPosition(0, 180)).toBe(6)
    expect(clockPosition(270, 90)).toBe(6)
  })

  it('always returns a valid clock position', () => {
    for (let heading = 0; heading < 360; heading += 7) {
      for (let bearing = 0; bearing < 360; bearing += 11) {
        const position = clockPosition(heading, bearing)
        expect(position).toBeGreaterThanOrEqual(1)
        expect(position).toBeLessThanOrEqual(12)
      }
    }
  })
})

describe('generateAzimuthSpec', () => {
  const variants: AzimuthVariant[] = ['heading', 'relative', 'clock-traffic', 'clock-read']

  it('marks the correct option for every variant', () => {
    const rng = createRng(31337)
    for (let i = 0; i < 200; i++) {
      const variant = variants[i % variants.length]
      const spec = generateAzimuthSpec(rng, variant)

      expect(spec.options).toHaveLength(6)
      expect(new Set(spec.options).size).toBe(6)
      expect(spec.correctIndex).toBeGreaterThanOrEqual(0)
      expect(spec.correctIndex).toBeLessThan(6)

      if (spec.variant === 'heading') {
        expect(spec.options[spec.correctIndex]).toBe(formatBearing(spec.heading))
      } else if (spec.variant === 'relative') {
        // The answer is the true bearing, not the relative one.
        expect(spec.options[spec.correctIndex]).toBe(formatBearing(spec.targetBearing))
      } else if (spec.variant === 'clock-traffic') {
        expect(spec.options[spec.correctIndex]).toBe(
          String(clockPosition(spec.heading, spec.targetBearing)),
        )
      } else {
        const expected = `${String(spec.hours).padStart(2, '0')}:${String(spec.minutes).padStart(2, '0')}`
        expect(spec.options[spec.correctIndex]).toBe(expected)
      }
    }
  })

  it('keeps clock-read times legal', () => {
    const rng = createRng(8)
    for (let i = 0; i < 100; i++) {
      const spec = generateAzimuthSpec(rng, 'clock-read')
      if (spec.variant !== 'clock-read') continue
      expect(spec.hours).toBeGreaterThanOrEqual(1)
      expect(spec.hours).toBeLessThanOrEqual(12)
      expect(spec.minutes % 5).toBe(0)
      expect(spec.minutes).toBeLessThan(60)
    }
  })
})
