import type { CSSProperties } from 'react'
import { FACE_LABELS, type CubePosition, type Orientation } from './cube'

const FACE_COLOURS = [
  '#4da3ff',
  '#f0b429',
  '#3ecf8e',
  '#ef5f6b',
  '#b98cff',
  '#4bd6d6',
] as const

const FACE_TRANSFORMS: Record<CubePosition, (half: number) => string> = {
  front: (h) => `translateZ(${h}px)`,
  back: (h) => `rotateY(180deg) translateZ(${h}px)`,
  right: (h) => `rotateY(90deg) translateZ(${h}px)`,
  left: (h) => `rotateY(-90deg) translateZ(${h}px)`,
  top: (h) => `rotateX(90deg) translateZ(${h}px)`,
  bottom: (h) => `rotateX(-90deg) translateZ(${h}px)`,
}

const POSITIONS: CubePosition[] = ['front', 'back', 'right', 'left', 'top', 'bottom']

export function CubeView({
  orientation,
  size = 140,
  /** Slight tilt so front, top and right are all visible at once. */
  tilt = { x: -22, y: -32 },
  highlightFace,
}: {
  orientation: Orientation
  size?: number
  tilt?: { x: number; y: number }
  highlightFace?: number
}) {
  const half = size / 2

  // The tilted cube projects outside its layout box, so the scene reserves the
  // extra room — otherwise it overlaps whatever sits below it.
  const sceneStyle: CSSProperties = {
    width: size,
    height: size,
    perspective: size * 4,
    margin: `${size * 0.22}px auto`,
  }

  const cubeStyle: CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    transformStyle: 'preserve-3d',
    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: 'transform 400ms ease',
  }

  return (
    <div style={sceneStyle} aria-hidden>
      <div style={cubeStyle}>
        {POSITIONS.map((position) => {
          const face = orientation[position]
          const highlighted = highlightFace === face
          return (
            <div
              key={position}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size / 3,
                fontWeight: 800,
                color: '#04101f',
                background: FACE_COLOURS[face],
                border: `2px solid ${highlighted ? '#ffffff' : 'rgba(4,16,31,0.35)'}`,
                boxShadow: highlighted ? 'inset 0 0 0 4px rgba(255,255,255,0.6)' : undefined,
                transform: FACE_TRANSFORMS[position](half),
                backfaceVisibility: 'hidden',
              }}
            >
              {FACE_LABELS[face]}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Legend showing which colour belongs to which letter. */
export function CubeLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {FACE_LABELS.map((label, i) => (
        <span
          key={label}
          className="rounded px-2 py-0.5 text-xs font-bold"
          style={{ background: FACE_COLOURS[i], color: '#04101f' }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}
