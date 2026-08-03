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
        background: 'var(--bg, #0b0b0c)',
      }}
    >
      <span
        aria-label="Loading"
        style={{
          width: 26,
          height: 26,
          display: 'inline-block',
          borderRadius: '50%',
          border: '2px solid var(--line-strong, #3a3a3d)',
          borderTopColor: 'var(--accent, #c8a24e)',
          animation: 'spin 720ms linear infinite',
        }}
      />
    </div>
  ),
})

export default function Page() {
  return <App />
}
