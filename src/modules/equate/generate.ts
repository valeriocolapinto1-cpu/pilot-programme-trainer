import { buildOptions, type Rng } from '@/lib/rng'

/**
 * Equate: equations with a missing operator or a missing value. The point is
 * mental arithmetic under time pressure, so numbers stay small enough to be
 * handled without paper.
 */

export type EquateConfig = {
  count: number
  perItemMs: number
  /** Two-operand equations, or three-operand with operator precedence. */
  hard: boolean
}

export type EquateSpec = {
  /** The equation with a blank, e.g. "7 ▢ 3 = 21" */
  display: string
  options: string[]
  correctIndex: number
  kind: 'operator' | 'value'
}

const OPERATORS = ['+', '−', '×', '÷'] as const
type Operator = (typeof OPERATORS)[number]

export function applyOperator(a: number, op: Operator, bValue: number): number {
  switch (op) {
    case '+':
      return a + bValue
    case '−':
      return a - bValue
    case '×':
      return a * bValue
    case '÷':
      return a / bValue
  }
}

function pickCleanPair(rng: Rng, op: Operator): [number, number] {
  switch (op) {
    case '+':
      return [rng.int(6, 60), rng.int(4, 40)]
    case '−': {
      const a = rng.int(15, 80)
      return [a, rng.int(3, a - 2)]
    }
    case '×':
      return [rng.int(3, 19), rng.int(3, 12)]
    case '÷': {
      const divisor = rng.int(2, 12)
      const quotient = rng.int(2, 15)
      return [divisor * quotient, divisor]
    }
  }
}

export function generateEquateSpec(rng: Rng, config: EquateConfig): EquateSpec {
  const kind: EquateSpec['kind'] = rng.bool() ? 'operator' : 'value'

  if (!config.hard) {
    const op = rng.pick(OPERATORS)
    const [a, bValue] = pickCleanPair(rng, op)
    const result = applyOperator(a, op, bValue)

    if (kind === 'operator') {
      const distractors = OPERATORS.filter((o) => o !== op) as unknown as string[]
      const { options, correctIndex } = buildOptions(rng, op as string, distractors, 4)
      return { display: `${a} ▢ ${bValue} = ${result}`, options, correctIndex, kind }
    }

    // Hide one of the operands instead of the operator.
    const hideFirst = rng.bool()
    const hidden = hideFirst ? a : bValue
    const display = hideFirst ? `▢ ${op} ${bValue} = ${result}` : `${a} ${op} ▢ = ${result}`
    const distractors = [hidden + 1, hidden - 1, hidden + 2, hidden - 2, hidden * 2, result - hidden]
      .filter((n) => n > 0 && n !== hidden)
      .map(String)
    const { options, correctIndex } = buildOptions(rng, String(hidden), distractors, 5)
    return { display, options, correctIndex, kind }
  }

  // Hard variant: three operands, so operator precedence matters.
  const op1 = rng.pick(['+', '−', '×'] as Operator[])
  const op2 = rng.pick(['+', '−', '×'] as Operator[])
  const a = rng.int(2, 14)
  const bValue = rng.int(2, 12)
  const c = rng.int(2, 12)

  // Evaluate with precedence: multiplication before addition/subtraction.
  const evaluate = (x: number, o1: Operator, y: number, o2: Operator, z: number): number => {
    if (o1 === '×' && o2 !== '×') return applyOperator(applyOperator(x, o1, y), o2, z)
    if (o2 === '×' && o1 !== '×') return applyOperator(x, o1, applyOperator(y, o2, z))
    return applyOperator(applyOperator(x, o1, y), o2, z)
  }

  const result = evaluate(a, op1, bValue, op2, c)

  if (kind === 'operator') {
    const hideSecond = rng.bool()
    const hidden = hideSecond ? op2 : op1
    const display = hideSecond
      ? `${a} ${op1} ${bValue} ▢ ${c} = ${result}`
      : `${a} ▢ ${bValue} ${op2} ${c} = ${result}`
    const distractors = OPERATORS.filter((o) => o !== hidden) as unknown as string[]
    const { options, correctIndex } = buildOptions(rng, hidden as string, distractors, 4)
    return { display, options, correctIndex, kind }
  }

  const display = `${a} ${op1} ▢ ${op2} ${c} = ${result}`
  const distractors = [bValue + 1, bValue - 1, bValue + 3, bValue - 2, bValue * 2, c]
    .filter((n) => n > 0 && n !== bValue)
    .map(String)
  const { options, correctIndex } = buildOptions(rng, String(bValue), distractors, 5)
  return { display, options, correctIndex, kind }
}
