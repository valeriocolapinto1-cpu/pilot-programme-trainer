import { buildOptions, type Rng } from '@/lib/rng'
import type { Bilingual } from '@/i18n'

export type CubePosition = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

/** Which labelled face currently occupies each position in space. */
export type Orientation = Record<CubePosition, number>

export const FACE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

export const IDENTITY: Orientation = {
  front: 0,
  back: 1,
  right: 2,
  left: 3,
  top: 4,
  bottom: 5,
}

export type CubeMove = 'up' | 'down' | 'left' | 'right' | 'cw' | 'ccw'

/**
 * Rotations are defined from the viewer's point of view, and the wording is the
 * part candidates report as confusing — so the UI states it explicitly:
 * "up" tips the front face to the top, as if the cube rolled away from you.
 */
export function applyMove(o: Orientation, move: CubeMove): Orientation {
  switch (move) {
    case 'up':
      return { ...o, top: o.front, back: o.top, bottom: o.back, front: o.bottom }
    case 'down':
      return { ...o, front: o.top, top: o.back, back: o.bottom, bottom: o.front }
    case 'right':
      return { ...o, right: o.front, back: o.right, left: o.back, front: o.left }
    case 'left':
      return { ...o, left: o.front, front: o.right, right: o.back, back: o.left }
    case 'cw':
      return { ...o, right: o.top, bottom: o.right, left: o.bottom, top: o.left }
    case 'ccw':
      return { ...o, left: o.top, bottom: o.left, right: o.bottom, top: o.right }
  }
}

export function applyMoves(o: Orientation, moves: CubeMove[]): Orientation {
  return moves.reduce(applyMove, o)
}

/** Every intermediate state, for the step-by-step explanation. */
export function traceMoves(o: Orientation, moves: CubeMove[]): Orientation[] {
  const states = [o]
  for (const move of moves) states.push(applyMove(states[states.length - 1], move))
  return states
}

export const MOVE_LABELS: Record<CubeMove, Bilingual> = {
  up: { it: 'SU', en: 'UP' },
  down: { it: 'GIÙ', en: 'DOWN' },
  left: { it: 'SINISTRA', en: 'LEFT' },
  right: { it: 'DESTRA', en: 'RIGHT' },
  cw: { it: 'ORARIO', en: 'CLOCKWISE' },
  ccw: { it: 'ANTIORARIO', en: 'ANTICLOCKWISE' },
}

export const MOVE_ARROWS: Record<CubeMove, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  cw: '↻',
  ccw: '↺',
}

export const POSITION_LABELS: Record<CubePosition, Bilingual> = {
  front: { it: 'Davanti', en: 'Front' },
  back: { it: 'Dietro', en: 'Back' },
  left: { it: 'Sinistra', en: 'Left' },
  right: { it: 'Destra', en: 'Right' },
  top: { it: 'Sopra', en: 'Top' },
  bottom: { it: 'Sotto', en: 'Bottom' },
}

export const ALL_POSITIONS: CubePosition[] = ['front', 'back', 'left', 'right', 'top', 'bottom']

export type CubeConfig = {
  count: number
  perItemMs: number
  /** How many rotations per question. */
  moveCount: number
  /** Include roll (clockwise / anticlockwise) commands. */
  includeRoll: boolean
}

export type CubeQuestionKind = 'which-face' | 'where-is-face'

export type CubeSpec = {
  start: Orientation
  moves: CubeMove[]
  final: Orientation
  kind: CubeQuestionKind
  /** For 'which-face': the position asked about. For 'where-is-face': the face. */
  targetPosition: CubePosition
  targetFace: number
  options: string[]
  correctIndex: number
}

export function generateCubeSpec(rng: Rng, config: CubeConfig): CubeSpec {
  const moveSet: CubeMove[] = config.includeRoll
    ? ['up', 'down', 'left', 'right', 'cw', 'ccw']
    : ['up', 'down', 'left', 'right']

  const moves = Array.from({ length: config.moveCount }, () => rng.pick(moveSet))
  const start = IDENTITY
  const final = applyMoves(start, moves)
  const kind: CubeQuestionKind = rng.bool() ? 'which-face' : 'where-is-face'

  if (kind === 'which-face') {
    // "Which letter is now on top?" — answer is a face label.
    const targetPosition = rng.pick(ALL_POSITIONS)
    const targetFace = final[targetPosition]
    const { options, correctIndex } = buildOptions(
      rng,
      FACE_LABELS[targetFace] as string,
      rng.shuffle(FACE_LABELS.filter((_, i) => i !== targetFace) as unknown as string[]),
      6,
    )
    return { start, moves, final, kind, targetPosition, targetFace, options, correctIndex }
  }

  // "Where is face C now?" — answer is a position.
  const targetFace = rng.int(0, 5)
  const targetPosition = ALL_POSITIONS.find((p) => final[p] === targetFace) as CubePosition
  const { options, correctIndex } = buildOptions(
    rng,
    targetPosition as string,
    rng.shuffle(ALL_POSITIONS.filter((p) => p !== targetPosition) as string[]),
    6,
  )
  return { start, moves, final, kind, targetPosition, targetFace, options, correctIndex }
}
