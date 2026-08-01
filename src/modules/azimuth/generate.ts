import { buildOptions, type Rng } from '@/lib/rng'
import type { Bilingual } from '@/i18n'

export type AzimuthVariant = 'heading' | 'relative' | 'clock-traffic' | 'clock-read'

export type AzimuthConfig = {
  count: number
  perItemMs: number
  variants: AzimuthVariant[]
}

/** Pure description of an item; the module turns it into a QuizItem. */
export type AzimuthSpec =
  | {
      variant: 'heading'
      heading: number
      options: string[]
      correctIndex: number
    }
  | {
      variant: 'relative'
      heading: number
      targetBearing: number
      options: string[]
      correctIndex: number
    }
  | {
      variant: 'clock-traffic'
      heading: number
      targetBearing: number
      options: string[]
      correctIndex: number
    }
  | {
      variant: 'clock-read'
      hours: number
      minutes: number
      rotation: number
      options: string[]
      correctIndex: number
    }

export function normaliseBearing(value: number): number {
  return ((value % 360) + 360) % 360
}

export function formatBearing(value: number): string {
  return `${String(normaliseBearing(value)).padStart(3, '0')}°`
}

/** Aviation clock code: 12 positions of 30° each, centred on the nose. */
export function clockPosition(heading: number, targetBearing: number): number {
  const relative = normaliseBearing(targetBearing - heading)
  const slot = Math.round(relative / 30) % 12
  return slot === 0 ? 12 : slot
}

export function formatTime(hours: number, minutes: number): string {
  return `${String(hours === 0 ? 12 : hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function bearingDistractors(rng: Rng, correct: number): number[] {
  const offsets = [180, 90, -90, 10, -10, 30, -30, 45, -45, 20, -20]
  return rng.shuffle(offsets).map((o) => normaliseBearing(correct + o))
}

export function generateAzimuthSpec(rng: Rng, variant: AzimuthVariant): AzimuthSpec {
  if (variant === 'heading') {
    const heading = rng.int(0, 71) * 5
    const { options, correctIndex } = buildOptions(
      rng,
      heading,
      bearingDistractors(rng, heading),
      6,
    )
    return {
      variant,
      heading,
      options: options.map(formatBearing),
      correctIndex,
    }
  }

  if (variant === 'relative') {
    const heading = rng.int(0, 71) * 5
    const relative = rng.int(1, 35) * 10
    const targetBearing = normaliseBearing(heading + relative)
    // Classic errors: reading the relative bearing as if it were the true one,
    // or subtracting the heading instead of adding it.
    const distractors = [
      relative,
      normaliseBearing(heading - relative),
      normaliseBearing(targetBearing + 180),
      ...bearingDistractors(rng, targetBearing),
    ]
    const { options, correctIndex } = buildOptions(rng, targetBearing, distractors, 6)
    return {
      variant,
      heading,
      targetBearing,
      options: options.map(formatBearing),
      correctIndex,
    }
  }

  if (variant === 'clock-traffic') {
    const heading = rng.int(0, 71) * 5
    // Keep the target near a clock slot centre so the answer is unambiguous.
    const slot = rng.int(1, 12)
    const jitter = rng.int(-8, 8)
    const targetBearing = normaliseBearing(heading + slot * 30 + jitter)
    const correct = clockPosition(heading, targetBearing)
    const distractors = rng
      .shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .filter((c) => c !== correct)
    const { options, correctIndex } = buildOptions(rng, correct, distractors, 6)
    return {
      variant,
      heading,
      targetBearing,
      options: options.map((c) => `${c}`),
      correctIndex,
    }
  }

  const hours = rng.int(1, 12)
  const minutes = rng.int(0, 11) * 5
  const rotation = rng.int(1, 11) * 30 + rng.int(-12, 12)
  const correct = formatTime(hours, minutes)
  // Hour and minute hands swapped — the mistake the rotation is designed to provoke.
  const swappedHour = minutes / 5 === 0 ? 12 : minutes / 5
  const distractors = [
    formatTime(swappedHour, (hours % 12) * 5),
    formatTime(hours === 12 ? 1 : hours + 1, minutes),
    formatTime(hours === 1 ? 12 : hours - 1, minutes),
    formatTime(hours, (minutes + 5) % 60),
    formatTime(hours, (minutes + 55) % 60),
    formatTime(hours, (minutes + 30) % 60),
  ]
  const { options, correctIndex } = buildOptions(rng, correct, distractors, 6)
  return { variant: 'clock-read', hours, minutes, rotation, options, correctIndex }
}

export const AZIMUTH_PROMPTS: Record<AzimuthVariant, Bilingual> = {
  heading: {
    it: 'Che prua sta volando l’aereo?',
    en: 'What heading is the aircraft flying?',
  },
  relative: {
    it: 'Qual è il rilevamento (bearing) del traffico indicato in giallo?',
    en: 'What is the bearing of the traffic marked in yellow?',
  },
  'clock-traffic': {
    it: 'In che posizione oraria si trova il traffico indicato in giallo?',
    en: 'At which clock position is the traffic marked in yellow?',
  },
  'clock-read': {
    it: 'Il quadrante è ruotato: il triangolo blu indica le 12. Che ora segna?',
    en: 'The dial is rotated: the blue triangle marks 12 o’clock. What time does it show?',
  },
}
