import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const OUT = '/home/user/pilot-programme-trainer/public/icons'
mkdirSync(OUT, { recursive: true })

/** The compass mark, matching the in-app icon and favicon. */
function page(size, pad, rounded) {
  const inner = size - pad * 2
  return `<!doctype html><html><body style="margin:0">
<div style="width:${size}px;height:${size}px;background:#0b0b0c;display:flex;align-items:center;justify-content:center;${
    rounded ? `border-radius:${size * 0.22}px;` : ''
  }">
  <svg width="${inner}" height="${inner}" viewBox="0 0 64 64" fill="none"
       stroke="#c8a24e" stroke-width="2.4" stroke-linejoin="round">
    <circle cx="32" cy="32" r="24"/>
    <path d="M32 9 L39 32 L32 28.5 L25 32 Z" fill="#c8a24e"/>
    <path d="M32 55 L25 32 L32 35.5 L39 32 Z" fill="#6b6459" stroke="#6b6459"/>
  </svg>
</div></body></html>`
}

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})

for (const [name, size, pad, rounded] of [
  ['icon-192.png', 192, 20, true],
  ['icon-512.png', 512, 54, true],
  ['icon-512-maskable.png', 512, 104, false],
]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } })
  await p.setContent(page(size, pad, rounded))
  await p.screenshot({ path: `${OUT}/${name}`, omitBackground: false })
  await p.close()
  console.log('wrote', name)
}

await browser.close()
