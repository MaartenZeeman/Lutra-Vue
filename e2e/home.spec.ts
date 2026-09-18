import { expect, test } from '@playwright/test'

import { samenvatting } from './fixtures'

test('toont de top 10 met een link naar meer verspakketten', async ({ page }) => {
  let aangevraagdeUrl = ''

  await page.route('**/api/verspakketten**', async (route) => {
    aangevraagdeUrl = route.request().url()
    const verspakketten = Array.from({ length: 10 }, (_, index) =>
      samenvatting(`id-${index}`, `Pakket ${index}`),
    )
    await route.fulfill({ json: { verspakketten } })
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Top 10 verspakketten' })).toBeVisible()
  await expect(page.locator('article')).toHaveCount(10)
  await expect(page.getByRole('link', { name: 'Meer verspakketten' })).toBeVisible()

  expect(aangevraagdeUrl).toContain('take=10')
  expect(aangevraagdeUrl).toContain('sortField=2')
  expect(aangevraagdeUrl).toContain('sortDirection=1')
})

test('toont een lege staat zonder verspakketten', async ({ page }) => {
  await page.route('**/api/verspakketten**', (route) =>
    route.fulfill({ json: { verspakketten: [] } }),
  )

  await page.goto('/')

  await expect(page.getByText('Er zijn nog geen verspakketten toegevoegd.')).toBeVisible()
})
