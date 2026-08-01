import type { ReactElement, SVGProps } from 'react'

/**
 * A small, purpose-built line-icon set. One consistent grid (24), one stroke
 * weight, no fills — so every icon reads as part of the same family instead of
 * a bag of borrowed glyphs.
 */

export type IconName =
  // navigation
  | 'home'
  | 'modules'
  | 'exam'
  | 'progress'
  | 'plan'
  | 'settings'
  | 'info'
  | 'mark'
  // modules
  | 'compass'
  | 'cube'
  | 'digits'
  | 'dial'
  | 'cipher'
  | 'recall'
  | 'balance'
  | 'equation'
  | 'flash'
  | 'audio'
  | 'ruler'
  | 'atom'
  | 'language'
  | 'eye'
  | 'mind'
  | 'people'
  | 'aircraft'
  | 'interview'
  | 'building'
  // ui
  | 'sun'
  | 'moon'
  | 'download'
  | 'upload'
  | 'trash'
  | 'check'
  | 'arrowRight'
  | 'replay'

const PATHS: Record<IconName, ReactElement> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 10v9h12v-9" />
    </>
  ),
  modules: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  exam: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2" />
      <path d="M9 2.5h6" />
    </>
  ),
  progress: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="m7.5 15 3.5-4 3 2.5 5-6.5" />
    </>
  ),
  plan: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
      <path d="m8.5 14.5 2 2 4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.6l1.4 2.1 2.5-.5.4 2.5 2.3 1-.6 2.5 1.6 2-1.6 2 .6 2.5-2.3 1-.4 2.5-2.5-.5L12 21.4l-1.4-2.1-2.5.5-.4-2.5-2.3-1 .6-2.5-1.6-2 1.6-2-.6-2.5 2.3-1 .4-2.5 2.5.5z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.6v.8" />
    </>
  ),
  mark: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 3.6 14.4 12 12 10.6 9.6 12z" />
      <path d="M12 20.4 9.6 12l2.4 1.4 2.4-1.4z" />
    </>
  ),

  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  cube: (
    <>
      <path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7z" />
      <path d="M3.5 7 12 11.4 20.5 7" />
      <path d="M12 11.4v9.8" />
    </>
  ),
  digits: (
    <>
      <path d="M6 8.5 8 7v10" />
      <path d="M13 8.5a2.4 2.4 0 1 1 4 1.6L13 17h5" />
    </>
  ),
  dial: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m12 12 4-3" />
      <path d="M12 3.5v1.5M20.5 12H19M12 20.5V19M3.5 12H5" />
    </>
  ),
  cipher: (
    <>
      <path d="M5.5 8.5 3 12l2.5 3.5" />
      <path d="M18.5 8.5 21 12l-2.5 3.5" />
      <path d="m14 6-4 12" />
    </>
  ),
  recall: (
    <>
      <path d="M3.5 6.5A2 2 0 0 1 5.5 4.5h4l2 2.5h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M8 13h8" />
    </>
  ),
  balance: (
    <>
      <path d="M4 16.5 20 12" />
      <path d="m12 14.2 0 5.3" />
      <path d="M9 20.5h6" />
      <circle cx="17" cy="9.6" r="2.2" />
    </>
  ),
  equation: (
    <>
      <path d="M4 9.5h16M4 14.5h16" />
      <path d="M8.5 5.5v3M15.5 15.5v3" />
    </>
  ),
  flash: (
    <>
      <path d="M13.5 2.8 5.5 13.5h5.6l-1 7.7 8.4-11H13z" />
    </>
  ),
  audio: (
    <>
      <path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z" />
      <path d="M16 9a4.5 4.5 0 0 1 0 6" />
      <path d="M18.7 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  ruler: (
    <>
      <path d="M4 20 20 4" />
      <path d="M4 20h6M4 20v-6" />
      <path d="m9.5 14.5 2 2M13 11l2 2M16.5 7.5l2 2" />
    </>
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  language: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9.5h17.6M3.2 14.5h17.6" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </>
  ),
  eye: (
    <>
      <path d="M2.6 12S6.4 5.8 12 5.8 21.4 12 21.4 12 17.6 18.2 12 18.2 2.6 12 2.6 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  mind: (
    <>
      <path d="M15 4.2a4.4 4.4 0 0 1 3.6 6.4A4 4 0 0 1 17 18.4a3.6 3.6 0 0 1-6.6-1" />
      <path d="M10.4 4.9A3.8 3.8 0 0 0 5 9.2a4.2 4.2 0 0 0-.4 7 3.6 3.6 0 0 0 5.8 1.2" />
      <path d="M10.4 4.9v12.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6" />
      <path d="M17.2 14.6a5.5 5.5 0 0 1 3.3 4.9" />
    </>
  ),
  aircraft: (
    <>
      <path d="M12 2.6c1.1 0 1.8 1.4 1.8 3.4v3.3l7.2 4.2v2.2l-7.2-2.2v3.6l2.3 1.8v1.6L12 19.4l-4.1 1.1v-1.6l2.3-1.8v-3.6L3 15.7v-2.2l7.2-4.2V6c0-2 .7-3.4 1.8-3.4z" />
    </>
  ),
  interview: (
    <>
      <rect x="9" y="2.8" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3.2M9 21.2h6" />
    </>
  ),
  building: (
    <>
      <path d="M4.5 21V5.2a1 1 0 0 1 .7-1l7-2.1a1 1 0 0 1 1.3 1V21" />
      <path d="M13.5 9.5H19a1 1 0 0 1 1 1V21" />
      <path d="M2.8 21h18.4" />
      <path d="M8 7.5v0M8 11.5v0M8 15.5v0" />
    </>
  ),

  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  download: (
    <>
      <path d="M12 3.5v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V4" />
      <path d="m7.5 8 4.5-4.5L16.5 8" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V4.2h5v2.3" />
      <path d="M6.5 6.5 7.4 20a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l.9-13.5" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m13.5 6.5 5.5 5.5-5.5 5.5" />
    </>
  ),
  replay: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 3.5v4h-4" />
    </>
  ),
}

export type IconProps = {
  name: IconName
  size?: number
  /** Icons are decorative by default; pass a label when they carry meaning. */
  label?: string
} & Omit<SVGProps<SVGSVGElement>, 'name'>

export function Icon({ name, size = 20, label, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
