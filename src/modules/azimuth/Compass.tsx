/**
 * Compass card and clock face drawings for the azimuth module.
 *
 * Screen angles are measured in degrees clockwise from the top, matching how a
 * pilot reads a direction indicator: whatever sits under the lubber line at the
 * top of the instrument is the current heading.
 */

const SIZE = 260
const CENTRE = SIZE / 2

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [CENTRE + radius * Math.sin(rad), CENTRE - radius * Math.cos(rad)]
}

const CARDINALS: { bearing: number; label: string }[] = [
  { bearing: 0, label: 'N' },
  { bearing: 30, label: '3' },
  { bearing: 60, label: '6' },
  { bearing: 90, label: 'E' },
  { bearing: 120, label: '12' },
  { bearing: 150, label: '15' },
  { bearing: 180, label: 'S' },
  { bearing: 210, label: '21' },
  { bearing: 240, label: '24' },
  { bearing: 270, label: 'W' },
  { bearing: 300, label: '30' },
  { bearing: 330, label: '33' },
]

export type CompassProps = {
  /** Heading placed under the lubber line; the card rotates by -heading. */
  heading: number
  /** Optional traffic/target symbol drawn at this true bearing. */
  targetBearing?: number
  /** Hides the heading digits so the card must be read from the rose. */
  showLubberValue?: boolean
}

export function Compass({ heading, targetBearing, showLubberValue = false }: CompassProps) {
  const rotation = -heading
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10)

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="compass"
      className="max-w-full"
    >
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={CENTRE - 4}
        fill="var(--panel-soft)"
        stroke="var(--edge)"
        strokeWidth="2"
      />

      {/* Rotating card: ticks and labels turn with the aircraft heading. */}
      <g transform={`rotate(${rotation} ${CENTRE} ${CENTRE})`}>
        {ticks.map((bearing) => {
          const major = bearing % 30 === 0
          const [x1, y1] = polar(bearing, CENTRE - 10)
          const [x2, y2] = polar(bearing, CENTRE - (major ? 24 : 17))
          return (
            <line
              key={bearing}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={major ? 'var(--text)' : 'var(--text-dim)'}
              strokeWidth={major ? 2 : 1}
            />
          )
        })}

        {CARDINALS.map(({ bearing, label }) => {
          const [x, y] = polar(bearing, CENTRE - 42)
          const isCardinal = bearing % 90 === 0
          return (
            <text
              key={bearing}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isCardinal ? 18 : 13}
              fontWeight={isCardinal ? 700 : 500}
              fill={bearing === 0 ? 'var(--accent)' : 'var(--text)'}
              transform={`rotate(${-rotation} ${x} ${y})`}
            >
              {label}
            </text>
          )
        })}

        {targetBearing !== undefined
          ? (() => {
              const [x, y] = polar(targetBearing, CENTRE - 68)
              return (
                <g transform={`rotate(${targetBearing} ${x} ${y})`}>
                  <polygon
                    points={`${x},${y - 9} ${x - 7},${y + 7} ${x + 7},${y + 7}`}
                    fill="var(--warn)"
                    stroke="var(--warn)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </g>
              )
            })()
          : null}
      </g>

      {/* Fixed aircraft symbol and lubber line. */}
      <g stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1={CENTRE} y1={CENTRE - 26} x2={CENTRE} y2={CENTRE + 26} />
        <line x1={CENTRE - 22} y1={CENTRE - 2} x2={CENTRE + 22} y2={CENTRE - 2} />
        <line x1={CENTRE - 9} y1={CENTRE + 20} x2={CENTRE + 9} y2={CENTRE + 20} />
      </g>
      {/* Lubber line: the fixed index the heading is read against. */}
      <polygon
        points={`${CENTRE},${20} ${CENTRE - 9},${3} ${CENTRE + 9},${3}`}
        fill="var(--accent)"
      />

      {showLubberValue ? (
        <text
          x={CENTRE}
          y={SIZE - 14}
          textAnchor="middle"
          fontSize={16}
          fontWeight={700}
          fill="var(--text-dim)"
        >
          {String(Math.round(heading)).padStart(3, '0')}°
        </text>
      ) : null}
    </svg>
  )
}

export type ClockFaceProps = {
  hours: number
  minutes: number
  /** Whole face rotation in degrees; the 12 marker rotates with it. */
  rotation: number
}

export function ClockFace({ hours, minutes, rotation }: ClockFaceProps) {
  const minuteAngle = minutes * 6
  const hourAngle = (hours % 12) * 30 + minutes * 0.5

  const [mx, my] = polar(minuteAngle, CENTRE - 40)
  const [hx, hy] = polar(hourAngle, CENTRE - 70)
  const [markX, markY] = polar(0, CENTRE - 22)

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="clock"
      className="max-w-full"
    >
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={CENTRE - 4}
        fill="var(--panel-soft)"
        stroke="var(--edge)"
        strokeWidth="2"
      />
      <g transform={`rotate(${rotation} ${CENTRE} ${CENTRE})`}>
        {Array.from({ length: 60 }, (_, i) => i).map((i) => {
          const major = i % 5 === 0
          const [x1, y1] = polar(i * 6, CENTRE - 10)
          const [x2, y2] = polar(i * 6, CENTRE - (major ? 22 : 15))
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={major ? 'var(--text)' : 'var(--text-dim)'}
              strokeWidth={major ? 2 : 1}
            />
          )
        })}
        {/* The only reference point: this triangle marks 12 o'clock. */}
        <polygon
          points={`${markX},${markY - 12} ${markX - 8},${markY + 4} ${markX + 8},${markY + 4}`}
          fill="var(--accent)"
        />

        <line
          x1={CENTRE}
          y1={CENTRE}
          x2={hx}
          y2={hy}
          stroke="var(--text)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1={CENTRE}
          y1={CENTRE}
          x2={mx}
          y2={my}
          stroke="var(--warn)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={CENTRE} cy={CENTRE} r={6} fill="var(--text)" />
      </g>
    </svg>
  )
}
