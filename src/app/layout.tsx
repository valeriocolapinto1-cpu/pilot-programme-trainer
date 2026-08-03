import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pathway Trainer — Wizz Air / Urbe Aero',
  description:
    'Allenamento con IA per la selezione del Wizz Air Pathway Programme con Urbe Aero: quiz generati sul programma reale e chat di gruppo Stage 3 valutata.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: '#0b0b0c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
