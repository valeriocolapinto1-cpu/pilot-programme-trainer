import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/rng'
import {
  ALL_POSITIONS,
  IDENTITY,
  applyMove,
  applyMoves,
  generateCubeSpec,
  traceMoves,
  type CubeMove,
} from './cube'

const ALL_MOVES: CubeMove[] = ['up', 'down', 'left', 'right', 'cw', 'ccw']

describe('applyMove', () => {
  it('keeps all six faces present after any move', () => {
    for (const move of ALL_MOVES) {
      const result = applyMove(IDENTITY, move)
      expect(new Set(Object.values(result)).size).toBe(6)
    }
  })

  it('sends the front face where the command says', () => {
    expect(applyMove(IDENTITY, 'up').top).toBe(IDENTITY.front)
    expect(applyMove(IDENTITY, 'down').bottom).toBe(IDENTITY.front)
    expect(applyMove(IDENTITY, 'right').right).toBe(IDENTITY.front)
    expect(applyMove(IDENTITY, 'left').left).toBe(IDENTITY.front)
  })

  it('leaves the roll axis untouched for cw and ccw', () => {
    for (const move of ['cw', 'ccw'] as CubeMove[]) {
      const result = applyMove(IDENTITY, move)
      expect(result.front).toBe(IDENTITY.front)
      expect(result.back).toBe(IDENTITY.back)
    }
  })

  it('has an exact inverse for every move', () => {
    const inverses: [CubeMove, CubeMove][] = [
      ['up', 'down'],
      ['left', 'right'],
      ['cw', 'ccw'],
    ]
    for (const [move, inverse] of inverses) {
      expect(applyMoves(IDENTITY, [move, inverse])).toEqual(IDENTITY)
      expect(applyMoves(IDENTITY, [inverse, move])).toEqual(IDENTITY)
    }
  })

  it('returns to the start after four identical rotations', () => {
    for (const move of ALL_MOVES) {
      expect(applyMoves(IDENTITY, [move, move, move, move])).toEqual(IDENTITY)
    }
  })
})

describe('traceMoves', () => {
  it('returns one state per move plus the starting state', () => {
    const moves: CubeMove[] = ['up', 'right', 'cw']
    const states = traceMoves(IDENTITY, moves)
    expect(states).toHaveLength(4)
    expect(states[0]).toEqual(IDENTITY)
    expect(states[3]).toEqual(applyMoves(IDENTITY, moves))
  })
})

describe('generateCubeSpec', () => {
  it('produces a question whose answer matches the final orientation', () => {
    const rng = createRng(2024)
    for (let i = 0; i < 200; i++) {
      const spec = generateCubeSpec(rng, {
        count: 1,
        perItemMs: 0,
        moveCount: 3,
        includeRoll: true,
      })

      // The stated final state must be what the moves actually produce.
      expect(spec.final).toEqual(applyMoves(spec.start, spec.moves))

      if (spec.kind === 'which-face') {
        // The correct option is the letter of the face at the asked position.
        expect(spec.options[spec.correctIndex]).toBe(
          ['A', 'B', 'C', 'D', 'E', 'F'][spec.final[spec.targetPosition]],
        )
      } else {
        // The correct option is the position where the asked face ended up.
        expect(spec.options[spec.correctIndex]).toBe(spec.targetPosition)
        expect(spec.final[spec.targetPosition]).toBe(spec.targetFace)
      }

      expect(new Set(spec.options).size).toBe(spec.options.length)
    }
  })

  it('only uses roll commands when they are enabled', () => {
    const rng = createRng(5)
    for (let i = 0; i < 100; i++) {
      const spec = generateCubeSpec(rng, {
        count: 1,
        perItemMs: 0,
        moveCount: 4,
        includeRoll: false,
      })
      expect(spec.moves.some((m) => m === 'cw' || m === 'ccw')).toBe(false)
    }
  })

  it('asks about a real position', () => {
    const rng = createRng(11)
    const spec = generateCubeSpec(rng, { count: 1, perItemMs: 0, moveCount: 2, includeRoll: true })
    expect(ALL_POSITIONS).toContain(spec.targetPosition)
  })
})
