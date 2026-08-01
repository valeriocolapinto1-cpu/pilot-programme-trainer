/**
 * Seeded pseudo-random generator (mulberry32). Every exercise is generated from
 * a seed so a session can be replayed exactly — useful for the exam report and
 * for tests that need deterministic items.
 */
export type Rng = {
  /** float in [0, 1) */
  next: () => number
  /** integer in [min, max] inclusive */
  int: (min: number, max: number) => number
  /** float in [min, max) */
  float: (min: number, max: number) => number
  pick: <T>(items: readonly T[]) => T
  /** returns a new shuffled array, leaving the input untouched */
  shuffle: <T>(items: readonly T[]) => T[]
  /** n distinct items picked at random */
  sample: <T>(items: readonly T[], n: number) => T[]
  bool: (probability?: number) => boolean
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0

  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))

  const shuffle = <T,>(items: readonly T[]): T[] => {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  return {
    next,
    int,
    float: (min, max) => min + next() * (max - min),
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffle,
    sample: (items, n) => shuffle(items).slice(0, n),
    bool: (probability = 0.5) => next() < probability,
  }
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}

/**
 * Builds an options array containing `correct` plus distractors, shuffled, and
 * reports where the correct one landed. Used by most multiple-choice modules.
 */
export function buildOptions<T>(
  rng: Rng,
  correct: T,
  distractors: readonly T[],
  count: number,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b,
): { options: T[]; correctIndex: number } {
  const pool: T[] = []
  for (const d of distractors) {
    if (pool.length >= count - 1) break
    if (isEqual(d, correct)) continue
    if (pool.some((p) => isEqual(p, d))) continue
    pool.push(d)
  }
  const options = rng.shuffle([correct, ...pool])
  return { options, correctIndex: options.findIndex((o) => isEqual(o, correct)) }
}
