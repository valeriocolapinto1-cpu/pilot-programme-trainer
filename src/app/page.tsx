'use client'

import dynamic from 'next/dynamic'

// The trainer is a client SPA (react-router, localStorage, Web Speech, canvas),
// so it renders entirely on the client. Next.js provides the shell, the API
// routes under /app/api, and Vercel hosting.
const App = dynamic(() => import('@/shell/App').then((m) => m.App), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b0b0c',
        color: '#78746c',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      …
    </div>
  ),
})

export default function Page() {
  return <App />
}
