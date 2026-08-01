import { buildOptions, type Rng } from '@/lib/rng'

/**
 * Decoder: a sequence of symbols is shown with no key. Only the pattern of
 * repetitions matters — pick the word whose letters repeat in the same places.
 */

export const SYMBOLS = ['◆', '▲', '●', '■', '★', '⬟', '✚', '◗'] as const

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVZ'

/** Canonical repetition signature: "TOTE" → "0,1,0,2". */
export function patternOf(token: string | readonly string[]): string {
  const units = typeof token === 'string' ? [...token] : [...token]
  const seen = new Map<string, number>()
  return units
    .map((unit) => {
      if (!seen.has(unit)) seen.set(unit, seen.size)
      return seen.get(unit)
    })
    .join(',')
}

/** Builds a word of `length` letters whose repetition signature equals `pattern`. */
export function wordForPattern(rng: Rng, pattern: string, letters = LETTERS): string {
  const slots = pattern.split(',').map(Number)
  const distinct = new Set(slots).size
  const chosen = rng.sample([...letters], distinct)
  return slots.map((slot) => chosen[slot]).join('')
}

export type DecoderConfig = {
  count: number
  perItemMs: number
  length: number
}

export type DecoderSpec = {
  symbols: string[]
  options: string[]
  correctIndex: number
}

export function generateDecoderSpec(rng: Rng, config: DecoderConfig): DecoderSpec {
  const length = config.length

  // Build a symbol sequence with at least one repeat, otherwise every distinct
  // word would match and the item would have several correct answers.
  let symbols: string[] = []
  let pattern = ''
  do {
    const alphabet = rng.sample(SYMBOLS, Math.max(2, length - 1))
    symbols = Array.from({ length }, () => rng.pick(alphabet))
    pattern = patternOf(symbols)
  } while (new Set(symbols).size === length)

  const correct = wordForPattern(rng, pattern)

  const distractors: string[] = []
  let guard = 0
  while (distractors.length < 5 && guard < 200) {
    guard += 1
    const candidate = wordForPattern(
      rng,
      patternOf(
        Array.from({ length }, () => rng.pick(SYMBOLS.slice(0, Math.max(2, length - 1)))),
      ),
    )
    if (patternOf(candidate) === pattern) continue
    if (distractors.includes(candidate)) continue
    distractors.push(candidate)
  }

  const { options, correctIndex } = buildOptions(rng, correct, distractors, 6)
  return { symbols, options, correctIndex }
}
