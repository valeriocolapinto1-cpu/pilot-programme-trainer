import { buildOptions, type Rng } from '@/lib/rng'
import type { Bilingual } from '@/i18n'

/**
 * METAR generator. Decoding a METAR is one of the technical questions
 * candidates report most often, so the reports are built from parts and the
 * questions are derived from the same data — the answer is always provable
 * from the string on screen.
 */

const STATIONS = ['LIRF', 'LIML', 'LIRN', 'LICC', 'LIMC', 'LIPZ', 'LHBP', 'EPKK'] as const

const CLOUD_TYPES = ['FEW', 'SCT', 'BKN', 'OVC'] as const

const WEATHER = [
  { code: '-RA', it: 'pioggia debole', en: 'light rain' },
  { code: 'RA', it: 'pioggia moderata', en: 'moderate rain' },
  { code: '+RA', it: 'pioggia forte', en: 'heavy rain' },
  { code: '-SN', it: 'neve debole', en: 'light snow' },
  { code: 'BR', it: 'foschia', en: 'mist' },
  { code: 'FG', it: 'nebbia', en: 'fog' },
  { code: 'TSRA', it: 'temporale con pioggia', en: 'thunderstorm with rain' },
  { code: 'DZ', it: 'pioviggine', en: 'drizzle' },
] as const

export type Metar = {
  raw: string
  station: string
  day: number
  hour: number
  minute: number
  windDirection: number
  windSpeed: number
  gust: number | null
  variable: boolean
  visibility: number
  weather: (typeof WEATHER)[number] | null
  clouds: { type: (typeof CLOUD_TYPES)[number]; base: number }[]
  cavok: boolean
  temperature: number
  dewPoint: number
  qnh: number
}

export function generateMetar(rng: Rng): Metar {
  const station = rng.pick(STATIONS)
  const day = rng.int(1, 28)
  const hour = rng.int(0, 23)
  const minute = rng.pick([20, 50])

  const windDirection = rng.int(1, 36) * 10
  const windSpeed = rng.int(2, 32)
  const gust = windSpeed >= 12 && rng.bool(0.45) ? windSpeed + rng.int(6, 18) : null
  const variable = windSpeed <= 4 && rng.bool(0.4)

  const cavok = rng.bool(0.18)
  const visibility = cavok ? 9999 : rng.pick([200, 400, 800, 1500, 3000, 5000, 8000, 9999])
  const weather = cavok || visibility === 9999 ? (rng.bool(0.4) ? rng.pick(WEATHER) : null) : rng.pick(WEATHER)

  const cloudCount = cavok ? 0 : rng.int(1, 3)
  const clouds: Metar['clouds'] = []
  let base = rng.int(2, 30)
  for (let i = 0; i < cloudCount; i++) {
    clouds.push({ type: rng.pick(CLOUD_TYPES), base: base * 100 })
    base += rng.int(5, 40)
  }

  const temperature = rng.int(-15, 38)
  const dewPoint = temperature - rng.int(0, 12)
  const qnh = rng.int(978, 1039)

  const windGroup = variable
    ? `VRB0${windSpeed}KT`
    : `${String(windDirection === 360 ? 360 : windDirection).padStart(3, '0')}${String(windSpeed).padStart(2, '0')}${gust ? `G${gust}` : ''}KT`

  const visGroup = cavok ? 'CAVOK' : visibility === 9999 ? '9999' : String(visibility).padStart(4, '0')

  const cloudGroup = clouds
    .map((c) => `${c.type}${String(c.base / 100).padStart(3, '0')}`)
    .join(' ')

  const temperatureGroup = `${temperature < 0 ? `M${String(Math.abs(temperature)).padStart(2, '0')}` : String(temperature).padStart(2, '0')}/${
    dewPoint < 0 ? `M${String(Math.abs(dewPoint)).padStart(2, '0')}` : String(dewPoint).padStart(2, '0')
  }`

  const raw = [
    station,
    `${String(day).padStart(2, '0')}${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}Z`,
    windGroup,
    visGroup,
    weather && !cavok ? weather.code : '',
    cloudGroup,
    temperatureGroup,
    `Q${qnh}`,
    'NOSIG',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    raw,
    station,
    day,
    hour,
    minute,
    windDirection,
    windSpeed,
    gust,
    variable,
    visibility: cavok ? 9999 : visibility,
    weather: cavok ? null : weather,
    clouds,
    cavok,
    temperature,
    dewPoint,
    qnh,
  }
}

export type MetarQuestion = {
  stem: Bilingual
  options: Bilingual[]
  correctIndex: number
  explanation: Bilingual
}

/** Values identical in both languages (bearings, altitudes, pressures). */
const same = (value: string): Bilingual => ({ it: value, en: value })

/** Two options are the same answer when their Italian text matches. */
const sameOption = (a: Bilingual, b: Bilingual) => a.it === b.it

/** Wraps a heading into 001-360, the way a wind group is written. */
function normaliseTrack(value: number): number {
  const wrapped = ((value % 360) + 360) % 360
  return wrapped === 0 ? 360 : wrapped
}

/** Headwind and crosswind components for a runway, rounded to the knot. */
export function windComponents(
  windDirection: number,
  windSpeed: number,
  runwayHeading: number,
): { headwind: number; crosswind: number } {
  const angle = ((windDirection - runwayHeading + 540) % 360) - 180
  const rad = (angle * Math.PI) / 180
  return {
    headwind: Math.round(windSpeed * Math.cos(rad)),
    crosswind: Math.round(Math.abs(windSpeed * Math.sin(rad))),
  }
}

export function metarQuestions(rng: Rng, metar: Metar): MetarQuestion[] {
  const questions: MetarQuestion[] = []

  // Wind
  if (!metar.variable) {
    const { options, correctIndex } = buildOptions(
      rng,
      same(`${metar.windDirection}° / ${metar.windSpeed} kt`),
      [
        same(`${metar.windSpeed}° / ${metar.windDirection} kt`),
        same(`${(metar.windDirection + 180) % 360}° / ${metar.windSpeed} kt`),
        same(`${metar.windDirection}° / ${metar.gust ?? metar.windSpeed + 10} kt`),
        same(`${normaliseTrack(metar.windDirection + 10)}° / ${metar.windSpeed} kt`),
        same(`${normaliseTrack(metar.windDirection - 20)}° / ${metar.windSpeed} kt`),
      ],
      4,
      sameOption,
    )
    questions.push({
      stem: {
        it: 'Qual è la direzione e l’intensità del vento riportate?',
        en: 'What wind direction and speed are reported?',
      },
      options,
      correctIndex,
      explanation: {
        it: `Il gruppo vento indica direzione (3 cifre, gradi veri) e intensità (2 cifre, nodi)${metar.gust ? `, con raffica a ${metar.gust} kt dopo la G` : ''}.`,
        en: `The wind group gives direction (3 digits, degrees true) and speed (2 digits, knots)${metar.gust ? `, with gusts to ${metar.gust} kt after the G` : ''}.`,
      },
    })
  }

  // Crosswind on the most closely aligned runway
  if (!metar.variable && metar.windSpeed >= 5) {
    const runway = Math.round(metar.windDirection / 10 / 3) * 30 || 360
    const { crosswind } = windComponents(metar.windDirection, metar.windSpeed, runway)
    const { options, correctIndex } = buildOptions(
      rng,
      same(`${crosswind} kt`),
      [
        same(`${crosswind + 3} kt`),
        same(`${Math.max(0, crosswind - 3)} kt`),
        same(`${metar.windSpeed} kt`),
        same(`${crosswind + 7} kt`),
        same(`${crosswind + 5} kt`),
      ],
      4,
      sameOption,
    )
    questions.push({
      stem: {
        it: `Con questo vento, quale componente di traverso sulla pista ${String(runway / 10).padStart(2, '0')}? (arrotonda al nodo)`,
        en: `With this wind, what crosswind component on runway ${String(runway / 10).padStart(2, '0')}? (round to the knot)`,
      },
      options,
      correctIndex,
      explanation: {
        it: `Componente traverso = velocità × sin(angolo fra vento e pista) = ${metar.windSpeed} × sin(${Math.abs(((metar.windDirection - runway + 540) % 360) - 180)}°) ≈ ${crosswind} kt.`,
        en: `Crosswind = speed × sin(angle between wind and runway) = ${metar.windSpeed} × sin(${Math.abs(((metar.windDirection - runway + 540) % 360) - 180)}°) ≈ ${crosswind} kt.`,
      },
    })
  }

  // Cloud base
  const lowest = metar.clouds[0]
  if (lowest) {
    const { options, correctIndex } = buildOptions(
      rng,
      same(`${lowest.base} ft`),
      [
        same(`${lowest.base * 10} ft`),
        same(`${lowest.base / 10} ft`),
        same(`${lowest.base + 500} ft`),
        same(`${lowest.base - 200} ft`),
      ],
      4,
      sameOption,
    )
    questions.push({
      stem: {
        it: 'A quale altezza si trova il primo strato di nubi riportato?',
        en: 'At what height is the first reported cloud layer?',
      },
      options,
      correctIndex,
      explanation: {
        it: `${lowest.type}${String(lowest.base / 100).padStart(3, '0')}: le basi si esprimono in centinaia di piedi AGL, quindi ${lowest.base} ft.`,
        en: `${lowest.type}${String(lowest.base / 100).padStart(3, '0')}: bases are in hundreds of feet AGL, so ${lowest.base} ft.`,
      },
    })
  }

  // Ceiling: first BKN or OVC layer
  const ceiling = metar.clouds.find((c) => c.type === 'BKN' || c.type === 'OVC')
  questions.push(
    (() => {
      const noCeiling: Bilingual = { it: 'Nessun ceiling', en: 'No ceiling' }
      const correct = ceiling ? same(`${ceiling.base} ft`) : noCeiling
      const distractors: Bilingual[] = [
        ...metar.clouds.filter((c) => c !== ceiling).map((c) => same(`${c.base} ft`)),
        noCeiling,
        // Plausible heights so a CAVOK report still offers four options.
        same('1500 ft'),
        same('3000 ft'),
        same('800 ft'),
        same('4500 ft'),
      ]
      const { options, correctIndex } = buildOptions(rng, correct, distractors, 4, sameOption)
      return {
        stem: {
          it: 'Qual è il ceiling riportato?',
          en: 'What is the reported ceiling?',
        },
        options,
        correctIndex,
        explanation: {
          it: 'Il ceiling è la base del primo strato BKN (5-7 ottavi) o OVC (8 ottavi). FEW e SCT non fanno ceiling.',
          en: 'The ceiling is the base of the first BKN (5-7 oktas) or OVC (8 oktas) layer. FEW and SCT do not make a ceiling.',
        },
      }
    })(),
  )

  // QNH
  {
    const { options, correctIndex } = buildOptions(
      rng,
      same(`${metar.qnh} hPa`),
      [
        same(`${metar.qnh - 10} hPa`),
        same(`${metar.qnh + 10} hPa`),
        same('1013 hPa'),
        same(`${metar.qnh - 3} hPa`),
        same(`${metar.qnh + 6} hPa`),
      ],
      4,
      sameOption,
    )
    questions.push({
      stem: { it: 'Quale QNH è riportato?', en: 'What QNH is reported?' },
      options,
      correctIndex,
      explanation: {
        it: `Il gruppo Q indica il QNH in ettopascal: Q${metar.qnh} = ${metar.qnh} hPa.`,
        en: `The Q group gives QNH in hectopascals: Q${metar.qnh} = ${metar.qnh} hPa.`,
      },
    })
  }

  // Temperature / dew point spread
  {
    const spread = metar.temperature - metar.dewPoint
    const { options, correctIndex } = buildOptions(
      rng,
      same(`${spread} °C`),
      [
        same(`${spread + 2} °C`),
        same(`${Math.abs(spread - 2)} °C`),
        same(`${metar.temperature} °C`),
        same(`${spread + 5} °C`),
        same(`${spread + 8} °C`),
      ],
      4,
      sameOption,
    )
    questions.push({
      stem: {
        it: 'Qual è lo scarto fra temperatura e punto di rugiada?',
        en: 'What is the temperature/dew point spread?',
      },
      options,
      correctIndex,
      explanation: {
        it: `${metar.temperature} − ${metar.dewPoint} = ${spread} °C. Uno scarto piccolo (≤ 3 °C) segnala rischio di nebbia o nubi basse in formazione.`,
        en: `${metar.temperature} − ${metar.dewPoint} = ${spread} °C. A small spread (≤ 3 °C) flags a risk of fog or low cloud forming.`,
      },
    })
  }

  // Weather phenomenon
  if (metar.weather) {
    const weather = metar.weather
    const { options, correctIndex } = buildOptions(
      rng,
      { it: weather.it, en: weather.en },
      WEATHER.filter((w) => w.code !== weather.code).map((w) => ({ it: w.it, en: w.en })),
      4,
      sameOption,
    )
    questions.push({
      stem: {
        it: `Che fenomeno indica il gruppo ${weather.code}?`,
        en: `What phenomenon does the group ${weather.code} indicate?`,
      },
      options,
      correctIndex,
      explanation: {
        it: 'Il segno − indica intensità debole, + forte, nessun segno intensità moderata.',
        en: 'A − sign means light, + means heavy, no sign means moderate.',
      },
    })
  }

  return rng.shuffle(questions)
}
