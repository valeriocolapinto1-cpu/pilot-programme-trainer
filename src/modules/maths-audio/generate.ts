import type { Rng } from '@/lib/rng'
import type { Bilingual } from '@/i18n'

/**
 * Mental-arithmetic questions in the shape candidates describe: read out loud,
 * roughly ten seconds each, no calculator and no paper. Everything here must be
 * solvable in the head, so the numbers are chosen to have clean answers.
 */

export type MathsTopic =
  | 'multiplication'
  | 'division'
  | 'powers'
  | 'percentage'
  | 'fractions'
  | 'speed-distance-time'
  | 'ratio'
  | 'sequence'

export type MathsAudioConfig = {
  count: number
  perItemMs: number
  topics: MathsTopic[]
}

export type MathsSpec = {
  topic: MathsTopic
  /** Written form, e.g. "27 × 29". */
  written: string
  /** Form fed to the speech engine, spelled out in words where it helps. */
  spoken: Bilingual
  answer: number
  /** Shown after answering: how to do it quickly in the head. */
  trick: Bilingual
}

export const TOPIC_LABELS: Record<MathsTopic, Bilingual> = {
  multiplication: { it: 'Moltiplicazione', en: 'Multiplication' },
  division: { it: 'Divisione', en: 'Division' },
  powers: { it: 'Potenze e radici', en: 'Powers and roots' },
  percentage: { it: 'Percentuali', en: 'Percentages' },
  fractions: { it: 'Frazioni', en: 'Fractions' },
  'speed-distance-time': { it: 'Velocità-distanza-tempo', en: 'Speed-distance-time' },
  ratio: { it: 'Rapporti e proporzioni', en: 'Ratios and proportions' },
  sequence: { it: 'Sequenze', en: 'Sequences' },
}

export const ALL_MATHS_TOPICS: MathsTopic[] = [
  'multiplication',
  'division',
  'powers',
  'percentage',
  'fractions',
  'speed-distance-time',
  'ratio',
  'sequence',
]

export function generateMathsSpec(rng: Rng, topic: MathsTopic): MathsSpec {
  switch (topic) {
    case 'multiplication': {
      const a = rng.int(12, 39)
      const b = rng.int(11, 29)
      return {
        topic,
        written: `${a} × ${b}`,
        spoken: { it: `${a} per ${b}`, en: `${a} times ${b}` },
        answer: a * b,
        trick: {
          it: `Scomponi: ${a} × ${b} = ${a} × ${b - (b % 10)} + ${a} × ${b % 10} = ${a * (b - (b % 10))} + ${a * (b % 10)}.`,
          en: `Split it: ${a} × ${b} = ${a} × ${b - (b % 10)} + ${a} × ${b % 10} = ${a * (b - (b % 10))} + ${a * (b % 10)}.`,
        },
      }
    }

    case 'division': {
      const divisor = rng.int(3, 19)
      const quotient = rng.int(6, 40)
      const dividend = divisor * quotient
      return {
        topic,
        written: `${dividend} ÷ ${divisor}`,
        spoken: { it: `${dividend} diviso ${divisor}`, en: `${dividend} divided by ${divisor}` },
        answer: quotient,
        trick: {
          it: `Cerca il multiplo di ${divisor} più vicino: ${divisor} × ${Math.floor(quotient / 10) * 10} = ${divisor * Math.floor(quotient / 10) * 10}, poi completa.`,
          en: `Find the nearest multiple of ${divisor}: ${divisor} × ${Math.floor(quotient / 10) * 10} = ${divisor * Math.floor(quotient / 10) * 10}, then finish.`,
        },
      }
    }

    case 'powers': {
      if (rng.bool(0.55)) {
        const base = rng.int(4, 25)
        return {
          topic,
          written: `${base}²`,
          spoken: { it: `${base} al quadrato`, en: `${base} squared` },
          answer: base * base,
          trick: {
            it: `(a±b)²: ${base}² = ${Math.round(base / 10) * 10}² ${base >= Math.round(base / 10) * 10 ? '+' : '−'} … usa il quadrato della decina più vicina.`,
            en: `(a±b)²: ${base}² = ${Math.round(base / 10) * 10}² ${base >= Math.round(base / 10) * 10 ? '+' : '−'} … work from the nearest ten.`,
          },
        }
      }
      const base = rng.int(2, 6)
      const exp = rng.int(3, 4)
      return {
        topic,
        written: `${base}^${exp}`,
        spoken: {
          it: `${base} elevato alla ${exp}`,
          en: `${base} to the power of ${exp}`,
        },
        answer: base ** exp,
        trick: {
          it: `Sali un passo alla volta: ${base}² = ${base ** 2}, poi × ${base}.`,
          en: `Build up one step at a time: ${base}² = ${base ** 2}, then × ${base}.`,
        },
      }
    }

    case 'percentage': {
      const percent = rng.pick([5, 10, 12.5, 15, 20, 25, 30, 40, 60, 75])
      const base = rng.int(4, 40) * 20
      return {
        topic,
        written: `${percent}% × ${base}`,
        spoken: { it: `${percent} per cento di ${base}`, en: `${percent} percent of ${base}` },
        answer: (percent / 100) * base,
        trick: {
          it: `Il 10% di ${base} è ${base / 10}: da lì ricavi ${percent}%.`,
          en: `10% of ${base} is ${base / 10}: build ${percent}% from there.`,
        },
      }
    }

    case 'fractions': {
      const denominator = rng.pick([3, 4, 5, 6, 8])
      const numerator = rng.int(1, denominator - 1)
      const base = denominator * rng.int(4, 25)
      return {
        topic,
        written: `${numerator}/${denominator} × ${base}`,
        spoken: {
          it: `${numerator} ${denominator}esimi di ${base}`,
          en: `${numerator} over ${denominator} of ${base}`,
        },
        answer: (numerator / denominator) * base,
        trick: {
          it: `Dividi prima: ${base} ÷ ${denominator} = ${base / denominator}, poi × ${numerator}.`,
          en: `Divide first: ${base} ÷ ${denominator} = ${base / denominator}, then × ${numerator}.`,
        },
      }
    }

    case 'speed-distance-time': {
      const variant = rng.int(0, 2)
      if (variant === 0) {
        // Multiples of 60 kt keep "miles per minute" a whole number.
        const speed = rng.int(2, 8) * 60
        const minutes = rng.pick([10, 12, 15, 20, 30, 40, 45])
        return {
          topic,
          written: `${speed} kt × ${minutes} min`,
          spoken: {
            it: `Voli a ${speed} nodi. Quante miglia percorri in ${minutes} minuti?`,
            en: `You are flying at ${speed} knots. How many miles do you cover in ${minutes} minutes?`,
          },
          answer: (speed * minutes) / 60,
          trick: {
            it: `A ${speed} kt fai ${speed / 60} NM al minuto: × ${minutes}.`,
            en: `At ${speed} kt you cover ${speed / 60} NM per minute: × ${minutes}.`,
          },
        }
      }
      if (variant === 1) {
        const rate = rng.pick([500, 600, 700, 800, 1000])
        const minutes = rng.int(2, 12)
        return {
          topic,
          written: `${rate} ft/min × ${minutes} min`,
          spoken: {
            it: `Sali a ${rate} piedi al minuto per ${minutes} minuti. Di quanti piedi sali?`,
            en: `You climb at ${rate} feet per minute for ${minutes} minutes. How many feet do you gain?`,
          },
          answer: rate * minutes,
          trick: {
            it: `${rate} × ${minutes}: moltiplica ${rate / 100} × ${minutes} e aggiungi due zeri.`,
            en: `${rate} × ${minutes}: multiply ${rate / 100} × ${minutes} and add two zeros.`,
          },
        }
      }
      const groundspeed = rng.pick([120, 150, 180, 240, 300, 360, 420])
      const distance = (groundspeed / 60) * rng.int(4, 30)
      return {
        topic,
        written: `${distance} NM @ ${groundspeed} kt`,
        spoken: {
          it: `Mancano ${distance} miglia con velocità al suolo ${groundspeed} nodi. Quanti minuti?`,
          en: `You have ${distance} miles to run at ${groundspeed} knots groundspeed. How many minutes?`,
        },
        answer: (distance / groundspeed) * 60,
        trick: {
          it: `Minuti = distanza ÷ (GS/60). A ${groundspeed} kt fai ${groundspeed / 60} NM/min.`,
          en: `Minutes = distance ÷ (GS/60). At ${groundspeed} kt you fly ${groundspeed / 60} NM per minute.`,
        },
      }
    }

    case 'ratio': {
      const unit = rng.int(3, 25)
      const parts = rng.int(3, 9)
      const known = unit * parts
      const wanted = rng.int(2, 12)
      return {
        topic,
        written: `${known} : ${parts} = ? : ${wanted}`,
        spoken: {
          it: `Se ${parts} unità costano ${known}, quanto costano ${wanted} unità?`,
          en: `If ${parts} units cost ${known}, what do ${wanted} units cost?`,
        },
        answer: unit * wanted,
        trick: {
          it: `Trova il valore unitario: ${known} ÷ ${parts} = ${unit}, poi × ${wanted}.`,
          en: `Find the unit value: ${known} ÷ ${parts} = ${unit}, then × ${wanted}.`,
        },
      }
    }

    case 'sequence': {
      const start = rng.int(2, 25)
      const stepKind = rng.int(0, 2)
      const values: number[] = []
      let description: Bilingual

      if (stepKind === 0) {
        const step = rng.int(3, 17)
        for (let i = 0; i < 5; i++) values.push(start + step * i)
        description = {
          it: `Progressione aritmetica: si somma sempre ${step}.`,
          en: `Arithmetic progression: keep adding ${step}.`,
        }
      } else if (stepKind === 1) {
        const factor = rng.int(2, 3)
        for (let i = 0; i < 5; i++) values.push(start * factor ** i)
        description = {
          it: `Progressione geometrica: si moltiplica sempre per ${factor}.`,
          en: `Geometric progression: keep multiplying by ${factor}.`,
        }
      } else {
        let step = rng.int(2, 6)
        let current = start
        for (let i = 0; i < 5; i++) {
          values.push(current)
          current += step
          step += 2
        }
        description = {
          it: 'La differenza cresce di 2 a ogni passo.',
          en: 'The gap grows by 2 at each step.',
        }
      }

      const shown = values.slice(0, 4)
      return {
        topic,
        written: `${shown.join(', ')}, ?`,
        spoken: {
          it: `Sequenza: ${shown.join(', ')}. Qual è il numero successivo?`,
          en: `Sequence: ${shown.join(', ')}. What is the next number?`,
        },
        answer: values[4],
        trick: description,
      }
    }
  }
}
