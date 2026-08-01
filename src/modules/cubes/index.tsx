import { useMemo } from 'react'
import { Quiz } from '@/components/Quiz'
import { createRng } from '@/lib/rng'
import { mono, type ModuleRuntimeProps, type QuizItem, type TrainerModule } from '@/modules/types'
import { CubeLegend, CubeView } from './CubeView'
import {
  FACE_LABELS,
  MOVE_ARROWS,
  MOVE_LABELS,
  POSITION_LABELS,
  generateCubeSpec,
  traceMoves,
  type CubeConfig,
  type CubeSpec,
} from './cube'

function MoveList({ spec }: { spec: CubeSpec }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {spec.moves.map((move, i) => (
        <span key={i} className="chip font-semibold" style={{ color: 'var(--text)' }}>
          <span aria-hidden className="text-base">
            {MOVE_ARROWS[move]}
          </span>
          {MOVE_LABELS[move].en}
        </span>
      ))}
    </div>
  )
}

function explain(spec: CubeSpec): { it: string; en: string } {
  const states = traceMoves(spec.start, spec.moves)
  const stepsIt = spec.moves
    .map((move, i) => `${i + 1}. ${MOVE_LABELS[move].it} → davanti ${FACE_LABELS[states[i + 1].front]}`)
    .join('\n')
  const stepsEn = spec.moves
    .map((move, i) => `${i + 1}. ${MOVE_LABELS[move].en} → front ${FACE_LABELS[states[i + 1].front]}`)
    .join('\n')

  return {
    it: `${stepsIt}\nAlla fine: davanti ${FACE_LABELS[spec.final.front]}, sopra ${FACE_LABELS[spec.final.top]}, destra ${FACE_LABELS[spec.final.right]}.`,
    en: `${stepsEn}\nFinal state: front ${FACE_LABELS[spec.final.front]}, top ${FACE_LABELS[spec.final.top]}, right ${FACE_LABELS[spec.final.right]}.`,
  }
}

function buildItems(config: CubeConfig, seed: number): QuizItem[] {
  const rng = createRng(seed)

  return Array.from({ length: config.count }, (_, i) => {
    const spec = generateCubeSpec(rng, config)

    const stem =
      spec.kind === 'which-face'
        ? {
            it: `Quale lettera si trova ${POSITION_LABELS[spec.targetPosition].it.toLowerCase()} dopo le rotazioni?`,
            en: `Which letter is at the ${POSITION_LABELS[spec.targetPosition].en.toLowerCase()} after the rotations?`,
          }
        : {
            it: `Dove si trova la faccia ${FACE_LABELS[spec.targetFace]} dopo le rotazioni?`,
            en: `Where is face ${FACE_LABELS[spec.targetFace]} after the rotations?`,
          }

    const options =
      spec.kind === 'which-face'
        ? spec.options.map(mono)
        : spec.options.map((position) => POSITION_LABELS[position as keyof typeof POSITION_LABELS])

    return {
      id: `cubes-${i}`,
      inputMode: 'choice',
      stem,
      visual: (
        <div className="flex flex-col items-center gap-3">
          <CubeView orientation={spec.start} />
          <CubeLegend />
          <MoveList spec={spec} />
        </div>
      ),
      options,
      correctIndex: spec.correctIndex,
      explanation: explain(spec),
    } satisfies QuizItem
  })
}

function CubesRunner({ config, seed, mode, onFinish }: ModuleRuntimeProps<CubeConfig>) {
  const items = useMemo(() => buildItems(config, seed), [config, seed])
  return (
    <Quiz
      items={items}
      perItemMs={config.perItemMs}
      feedback={mode === 'exam' ? 'none' : 'immediate'}
      onFinish={onFinish}
      allowSkip={false}
    />
  )
}

export const cubesModule: TrainerModule<CubeConfig> = {
  id: 'cubes',
  kind: 'quiz',
  phase: 1,
  sourceTier: 'community',
  icon: 'cube',
  title: { it: 'Cubi rotanti', en: 'Rotating cubes' },
  blurb: {
    it: 'Rotazione mentale 3D con comandi direzionali. Uno dei moduli più difficili.',
    en: '3D mental rotation with directional commands. One of the hardest modules.',
  },
  whatItTests: {
    it: 'Visualizzazione 3D e rotazione mentale. I candidati riferiscono che i comandi “su/giù” sono la parte che genera più confusione: qui la convenzione è scritta nera su bianco, così alleni il ragionamento e non l’indovinello.',
    en: '3D visualisation and mental rotation. Candidates report the “up/down” commands as the most confusing part: here the convention is spelled out, so you train the reasoning and not the guesswork.',
  },
  instructions: {
    it: [
      'SU (↑): la faccia davanti sale verso l’alto — il cubo rotola allontanandosi da te.',
      'GIÙ (↓): la faccia davanti scende — il cubo rotola verso di te.',
      'DESTRA (→): la faccia davanti va a destra. SINISTRA (←): va a sinistra.',
      'ORARIO (↻) / ANTIORARIO (↺): il cubo ruota sul posto, davanti e dietro restano fermi.',
      'Le facce sono colorate: segui il colore, è più rapido che seguire la lettera.',
    ],
    en: [
      'UP (↑): the front face tips to the top — the cube rolls away from you.',
      'DOWN (↓): the front face tips down — the cube rolls towards you.',
      'RIGHT (→): the front face moves to the right. LEFT (←): it moves to the left.',
      'CLOCKWISE (↻) / ANTICLOCKWISE (↺): the cube spins in place, front and back stay put.',
      'Faces are colour-coded: tracking the colour is faster than tracking the letter.',
    ],
  },
  defaultConfig: { count: 15, perItemMs: 30000, moveCount: 2, includeRoll: false },
  examConfig: { count: 26, perItemMs: 30000, moveCount: 3, includeRoll: true },
  examDurationMs: 14 * 60 * 1000,
  inProExam: true,
  inPracticeSet: false,
  Component: CubesRunner,
}
