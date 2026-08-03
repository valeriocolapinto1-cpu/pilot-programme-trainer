import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pathway Trainer — Wizz Air / Urbe Aero',
  description:
    'Allenamento con IA per la selezione del Wizz Air Pathway Programme con Urbe Aero: quiz generati sul programma reale e chat di gruppo Stage 3 valutata.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
    { media: '(prefers-color-scheme: light)', color: '#faf9f6' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// Applied before first paint so a user's saved theme/language never flashes the
// default first. Reads the same localStorage key the settings store persists to.
const NO_FLASH = `(function(){try{var s=localStorage.getItem('pathway.settings');if(!s)return;var t=JSON.parse(s).state;if(!t)return;var e=document.documentElement;if(t.theme){e.dataset.theme=t.theme;e.style.colorScheme=t.theme;}if(t.locale){e.lang=t.locale;}}catch(_){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        {/* Preload the latin subsets so the serif title and UI sans paint at once. */}
        <link
          rel="preload"
          href="/fonts/cormorant-3e0e6b73.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/jost-35841fe7.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
