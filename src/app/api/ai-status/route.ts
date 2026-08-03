import { NextResponse } from 'next/server'
import { providerInfo } from '@/server/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Tells the client whether AI features are live (key present) without ever
// exposing the key itself.
export function GET() {
  const info = providerInfo()
  return NextResponse.json({ configured: info.configured, provider: info.provider })
}
