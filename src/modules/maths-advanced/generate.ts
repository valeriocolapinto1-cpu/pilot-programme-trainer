import type { Rng } from '@/lib/rng'
import type { Bilingual } from '@/i18n'

/**
 * The second maths section candidates describe: paper and calculator are
 * allowed, and the work shifts to rearranging algebra, trigonometry, bearings
 * and unit conversions — the pieces the official syllabus lists.
 */

export type AdvancedTopic =
  | 'linear'
  | 'simultaneous'
  | 'rearrange'
  | 'trigonometry'
  | 'conversion'
  | 'geometry'

export type MathsAdvancedConfig = {
  count: number
  perItemMs: number
  topics: AdvancedTopic[]
}

export type AdvancedSpec = {
  topic: AdvancedTopic
  question: Bilingual
  answer: number
  tolerance: number
  unit?: Bilingual
  explanation: Bilingual
}

export const ADVANCED_TOPIC_LABELS: Record<AdvancedTopic, Bilingual> = {
  linear: { it: 'Equazioni', en: 'Equations' },
  simultaneous: { it: 'Sistemi', en: 'Simultaneous' },
  rearrange: { it: 'Formule inverse', en: 'Rearranging' },
  trigonometry: { it: 'Trigonometria', en: 'Trigonometry' },
  conversion: { it: 'Conversioni', en: 'Conversions' },
  geometry: { it: 'Geometria', en: 'Geometry' },
}

export const ALL_ADVANCED_TOPICS: AdvancedTopic[] = [
  'linear',
  'simultaneous',
  'rearrange',
  'trigonometry',
  'conversion',
  'geometry',
]

export function generateAdvancedSpec(rng: Rng, topic: AdvancedTopic): AdvancedSpec {
  switch (topic) {
    case 'linear': {
      const a = rng.int(2, 12)
      const b = rng.int(-30, 30)
      const x = rng.int(-15, 25)
      const c = a * x + b
      return {
        topic,
        question: {
          it: `Risolvi per x:  ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${c}`,
          en: `Solve for x:  ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${c}`,
        },
        answer: x,
        tolerance: 0.01,
        explanation: {
          it: `x = (${c} ${b >= 0 ? '−' : '+'} ${Math.abs(b)}) ÷ ${a} = ${x}.`,
          en: `x = (${c} ${b >= 0 ? '−' : '+'} ${Math.abs(b)}) ÷ ${a} = ${x}.`,
        },
      }
    }

    case 'simultaneous': {
      const x = rng.int(-9, 12)
      const y = rng.int(-9, 12)
      const a1 = rng.int(1, 6)
      const b1 = rng.int(1, 6)
      const a2 = rng.int(1, 6)
      let b2 = rng.int(1, 6)
      // Keep the system independent.
      if (a1 * b2 === a2 * b1) b2 += 1
      const c1 = a1 * x + b1 * y
      const c2 = a2 * x + b2 * y
      const wantX = rng.bool()
      return {
        topic,
        question: {
          it: `${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}\nQuanto vale ${wantX ? 'x' : 'y'}?`,
          en: `${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}\nWhat is ${wantX ? 'x' : 'y'}?`,
        },
        answer: wantX ? x : y,
        tolerance: 0.01,
        explanation: {
          it: `Eliminazione: x = ${x}, y = ${y}.`,
          en: `By elimination: x = ${x}, y = ${y}.`,
        },
      }
    }

    case 'rearrange': {
      const variant = rng.int(0, 2)
      if (variant === 0) {
        // Groundspeed / time / distance triangle.
        const gs = rng.int(6, 9) * 30
        const minutes = rng.int(8, 55)
        const distance = (gs * minutes) / 60
        return {
          topic,
          question: {
            it: `D = GS × t. Percorri ${distance.toFixed(1)} NM in ${minutes} minuti: qual è la GS in nodi?`,
            en: `D = GS × t. You cover ${distance.toFixed(1)} NM in ${minutes} minutes: what is the GS in knots?`,
          },
          answer: gs,
          tolerance: 1,
          unit: { it: 'kt', en: 'kt' },
          explanation: {
            it: `GS = D ÷ t = ${distance.toFixed(1)} ÷ (${minutes}/60) = ${gs} kt.`,
            en: `GS = D ÷ t = ${distance.toFixed(1)} ÷ (${minutes}/60) = ${gs} kt.`,
          },
        }
      }
      if (variant === 1) {
        // Rate of descent from a 3° path.
        const gs = rng.int(4, 9) * 30
        const rod = gs * 5
        return {
          topic,
          question: {
            it: `Su un sentiero di 3° la regola pratica è ROD ≈ GS × 5. Con GS ${gs} kt, quale rateo di discesa in ft/min?`,
            en: `On a 3° path the rule of thumb is ROD ≈ GS × 5. At GS ${gs} kt, what rate of descent in ft/min?`,
          },
          answer: rod,
          tolerance: 1,
          unit: { it: 'ft/min', en: 'ft/min' },
          explanation: {
            it: `${gs} × 5 = ${rod} ft/min. La regola deriva da tan(3°) ≈ 1/20.`,
            en: `${gs} × 5 = ${rod} ft/min. The rule comes from tan(3°) ≈ 1/20.`,
          },
        }
      }
      // Top of descent distance from the 3:1 rule.
      const thousands = rng.int(15, 38)
      const feet = thousands * 1000
      const distance = thousands * 3
      return {
        topic,
        question: {
          it: `Regola del 3:1 — devi perdere ${feet.toLocaleString('it-IT')} ft. A che distanza inizi la discesa (NM)?`,
          en: `3:1 rule — you must lose ${feet.toLocaleString('en-GB')} ft. At what distance do you start down (NM)?`,
        },
        answer: distance,
        tolerance: 0.5,
        unit: { it: 'NM', en: 'NM' },
        explanation: {
          it: `Altitudine in migliaia di piedi × 3: ${thousands} × 3 = ${distance} NM.`,
          en: `Altitude in thousands of feet × 3: ${thousands} × 3 = ${distance} NM.`,
        },
      }
    }

    case 'trigonometry': {
      const variant = rng.int(0, 1)
      const angle = rng.pick([30, 45, 60])
      const hypotenuse = rng.int(4, 30) * 10
      if (variant === 0) {
        const opposite = hypotenuse * Math.sin((angle * Math.PI) / 180)
        return {
          topic,
          question: {
            it: `In un triangolo rettangolo l’ipotenusa misura ${hypotenuse} e l’angolo è ${angle}°. Quanto misura il cateto opposto? (1 decimale)`,
            en: `In a right triangle the hypotenuse is ${hypotenuse} and the angle is ${angle}°. How long is the opposite side? (1 decimal)`,
          },
          answer: Math.round(opposite * 10) / 10,
          tolerance: 0.6,
          explanation: {
            it: `SOH: opposto = ipotenusa × sin(${angle}°) = ${hypotenuse} × ${Math.sin((angle * Math.PI) / 180).toFixed(3)} = ${opposite.toFixed(1)}.`,
            en: `SOH: opposite = hypotenuse × sin(${angle}°) = ${hypotenuse} × ${Math.sin((angle * Math.PI) / 180).toFixed(3)} = ${opposite.toFixed(1)}.`,
          },
        }
      }
      const drift = rng.int(5, 25)
      const tas = rng.int(9, 24) * 10
      const crosswind = Math.round(tas * Math.sin((drift * Math.PI) / 180))
      return {
        topic,
        question: {
          it: `Con TAS ${tas} kt e deriva di ${drift}°, quale componente di vento traverso (kt, arrotondata)?`,
          en: `With TAS ${tas} kt and ${drift}° of drift, what crosswind component (kt, rounded)?`,
        },
        answer: crosswind,
        tolerance: 2,
        unit: { it: 'kt', en: 'kt' },
        explanation: {
          it: `Componente = TAS × sin(deriva) = ${tas} × sin(${drift}°) ≈ ${crosswind} kt.`,
          en: `Component = TAS × sin(drift) = ${tas} × sin(${drift}°) ≈ ${crosswind} kt.`,
        },
      }
    }

    case 'conversion': {
      const kind = rng.int(0, 3)
      if (kind === 0) {
        const nm = rng.int(20, 400)
        return {
          topic,
          question: {
            it: `Converti ${nm} NM in chilometri (1 NM = 1,852 km, 1 decimale).`,
            en: `Convert ${nm} NM to kilometres (1 NM = 1.852 km, 1 decimal).`,
          },
          answer: Math.round(nm * 1.852 * 10) / 10,
          tolerance: 0.6,
          unit: { it: 'km', en: 'km' },
          explanation: {
            it: `${nm} × 1,852 = ${(nm * 1.852).toFixed(1)} km.`,
            en: `${nm} × 1.852 = ${(nm * 1.852).toFixed(1)} km.`,
          },
        }
      }
      if (kind === 1) {
        const celsius = rng.int(-40, 45)
        return {
          topic,
          question: {
            it: `Converti ${celsius} °C in gradi Fahrenheit.`,
            en: `Convert ${celsius} °C to degrees Fahrenheit.`,
          },
          answer: (celsius * 9) / 5 + 32,
          tolerance: 0.2,
          unit: { it: '°F', en: '°F' },
          explanation: {
            it: `°F = °C × 9/5 + 32 = ${celsius} × 1,8 + 32 = ${((celsius * 9) / 5 + 32).toFixed(1)}.`,
            en: `°F = °C × 9/5 + 32 = ${celsius} × 1.8 + 32 = ${((celsius * 9) / 5 + 32).toFixed(1)}.`,
          },
        }
      }
      if (kind === 2) {
        const metres = rng.int(50, 4000)
        return {
          topic,
          question: {
            it: `Converti ${metres} m in piedi (1 m = 3,281 ft, arrotonda all’unità).`,
            en: `Convert ${metres} m to feet (1 m = 3.281 ft, round to the nearest unit).`,
          },
          answer: Math.round(metres * 3.281),
          tolerance: 3,
          unit: { it: 'ft', en: 'ft' },
          explanation: {
            it: `${metres} × 3,281 ≈ ${Math.round(metres * 3.281)} ft.`,
            en: `${metres} × 3.281 ≈ ${Math.round(metres * 3.281)} ft.`,
          },
        }
      }
      const litres = rng.int(200, 9000)
      const density = 0.8
      return {
        topic,
        question: {
          it: `${litres} litri di carburante con densità ${density} kg/l: quanti kg?`,
          en: `${litres} litres of fuel at ${density} kg/l: how many kg?`,
        },
        answer: litres * density,
        tolerance: 1,
        unit: { it: 'kg', en: 'kg' },
        explanation: {
          it: `Massa = volume × densità = ${litres} × ${density} = ${litres * density} kg.`,
          en: `Mass = volume × density = ${litres} × ${density} = ${litres * density} kg.`,
        },
      }
    }

    case 'geometry': {
      const kind = rng.int(0, 2)
      if (kind === 0) {
        const radius = rng.int(3, 40)
        return {
          topic,
          question: {
            it: `Area di un cerchio di raggio ${radius} (usa π = 3,14, 1 decimale).`,
            en: `Area of a circle with radius ${radius} (use π = 3.14, 1 decimal).`,
          },
          answer: Math.round(3.14 * radius * radius * 10) / 10,
          tolerance: 1,
          explanation: {
            it: `A = πr² = 3,14 × ${radius}² = ${(3.14 * radius * radius).toFixed(1)}.`,
            en: `A = πr² = 3.14 × ${radius}² = ${(3.14 * radius * radius).toFixed(1)}.`,
          },
        }
      }
      if (kind === 1) {
        const a = rng.int(3, 20)
        const b = rng.int(3, 20)
        return {
          topic,
          question: {
            it: `Un triangolo rettangolo ha cateti ${a} e ${b}. Quanto misura l’ipotenusa? (2 decimali)`,
            en: `A right triangle has legs ${a} and ${b}. How long is the hypotenuse? (2 decimals)`,
          },
          answer: Math.round(Math.hypot(a, b) * 100) / 100,
          tolerance: 0.05,
          explanation: {
            it: `√(${a}² + ${b}²) = √${a * a + b * b} = ${Math.hypot(a, b).toFixed(2)}.`,
            en: `√(${a}² + ${b}²) = √${a * a + b * b} = ${Math.hypot(a, b).toFixed(2)}.`,
          },
        }
      }
      const length = rng.int(10, 60)
      const width = rng.int(5, 40)
      const height = rng.int(2, 15)
      return {
        topic,
        question: {
          it: `Volume di un parallelepipedo ${length} × ${width} × ${height}.`,
          en: `Volume of a box measuring ${length} × ${width} × ${height}.`,
        },
        answer: length * width * height,
        tolerance: 0.5,
        explanation: {
          it: `V = l × w × h = ${length * width * height}.`,
          en: `V = l × w × h = ${length * width * height}.`,
        },
      }
    }
  }
}
