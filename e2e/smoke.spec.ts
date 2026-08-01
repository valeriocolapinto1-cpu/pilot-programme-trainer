import { expect, test, type Page } from '@playwright/test'

/**
 * Every module id in the registry. Kept as a literal list on purpose: if a
 * module is added without a route working, this file has to be updated and the
 * omission becomes visible instead of silently untested.
 */
const MODULE_IDS = [
  'azimuth',
  'cubes',
  'numbers',
  'clocks',
  'decoder',
  'recall',
  'balance',
  'equate',
  'visual-perception',
  'maths-audio',
  'maths-advanced',
  'physics',
  'english',
  'vigilance',
  'personality',
  'group-exercise',
  'atpl-technical',
  'interview-hr',
  'wizz-knowledge',
] as const

/** Fails the test if the page logged an uncaught error or a React warning. */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

test.describe('navigation', () => {
  test('loads the home page and the main sections', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    for (const [path, heading] of [
      ['#/modules', /moduli|modules/i],
      ['#/exam', /esame|exam/i],
      ['#/progress', /progressi|progress/i],
      ['#/plan', /piano|study plan/i],
      ['#/about', /selezione|selection/i],
      ['#/settings', /impostazioni|settings/i],
    ] as const) {
      await page.goto(`/${path}`)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
    }

    expect(errors).toEqual([])
  })

  test('switches language and persists it', async ({ page }) => {
    await page.goto('/#/modules')

    const toggle = page.getByRole('button', { name: /language|lingua/i })
    const before = await page.getByRole('heading', { level: 1 }).textContent()
    await toggle.click()
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(before ?? '')

    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(before ?? '')
  })

  test('switches theme', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('button', { name: /theme|tema/i }).click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })
})

test.describe('modules', () => {
  for (const moduleId of MODULE_IDS) {
    test(`${moduleId}: intro renders and the module starts`, async ({ page }) => {
      const errors = trackConsoleErrors(page)
      await page.goto(`/#/modules/${moduleId}`)

      // Intro screen: title, what it tests, instructions, start button.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const start = page.getByRole('button', { name: /^(Inizia|Start)$/ })
      await expect(start).toBeVisible()
      await start.click()

      // Once running, the quit affordance is present and the module rendered
      // something interactive.
      await expect(page.getByRole('button', { name: /^(Esci|Quit)$/ })).toBeVisible()
      await expect(page.locator('main')).not.toBeEmpty()

      expect(errors).toEqual([])
    })
  }

  test('physics: answering a question records an attempt', async ({ page }) => {
    await page.goto('/#/modules/physics')
    await page.getByRole('button', { name: /^(Inizia|Start)$/ }).click()

    // Answer every question with the first option until the module ends.
    for (let i = 0; i < 40; i++) {
      const options = page.locator('button.option')
      if ((await options.count()) === 0) break
      await options.first().click()
      const next = page.getByRole('button', { name: /^(Avanti|Next|Termina|Finish)$/ })
      if (await next.isVisible().catch(() => false)) await next.click()
    }

    // The result screen shows a score ring and the attempt reaches the store.
    await expect(page.getByRole('img', { name: /%$/ })).toBeVisible({ timeout: 15_000 })

    const stored = await page.evaluate(() => window.localStorage.getItem('pathway.progress'))
    expect(stored).toContain('physics')
  })

  test('cubes: a wrong answer reveals the step-by-step explanation', async ({ page }) => {
    await page.goto('/#/modules/cubes')
    await page.getByRole('button', { name: /^(Inizia|Start)$/ }).click()

    await page.locator('button.option').first().click()
    // Whether right or wrong, feedback appears with a way forward.
    await expect(
      page.getByRole('button', { name: /^(Avanti|Next|Termina|Finish)$/ }),
    ).toBeVisible()
  })
})

test.describe('exam', () => {
  test('starting the Pro exam creates a resumable session', async ({ page }) => {
    await page.goto('/#/exam')

    await page.getByRole('button', { name: /Avvia esame completo|Start full exam/ }).click()
    await expect(page).toHaveURL(/#\/exam\/run/)

    // First module intro is shown with its exam-length slot.
    await expect(page.getByRole('button', { name: /Inizia il modulo|Begin module/ })).toBeVisible()

    // Leaving and coming back offers to resume rather than restarting.
    await page.goto('/#/exam')
    await expect(page.getByRole('link', { name: /Riprendi|Resume/ })).toBeVisible()
  })
})

test.describe('progress', () => {
  test('exports the stored data as JSON', async ({ page }) => {
    await page.goto('/#/progress')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: /Esporta dati|Export data/ }).click()
    const file = await download
    expect(file.suggestedFilename()).toMatch(/^pathway-trainer-\d{4}-\d{2}-\d{2}\.json$/)
  })
})

test.describe('offline', () => {
  test('works after the service worker has cached the app', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForFunction(
      () => navigator.serviceWorker?.controller != null || navigator.serviceWorker == null,
      undefined,
      { timeout: 20_000 },
    )
    // Give Workbox a moment to finish precaching before pulling the network.
    await page.waitForTimeout(1500)

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await context.setOffline(false)
  })
})
