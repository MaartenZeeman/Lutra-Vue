import { expect, test } from '@playwright/test'

test('toont de applicatieschil', async ({ page }) => {
  await page.route('**/api/verspakketten**', (route) =>
    route.fulfill({ json: { verspakketten: [] } }),
  )

  await page.goto('/')

  await expect(page.getByRole('link', { name: 'Lutra' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Hoofdnavigatie' })).toBeVisible()
})

test('exposes an installable web app manifest', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest')

  expect(response.ok()).toBe(true)

  const manifest = await response.json()
  expect(manifest.name).toBe('Lutra')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThan(0)
})

test('serves the service worker entry point', async ({ request }) => {
  const response = await request.get('/sw.js')

  expect(response.ok()).toBe(true)
})
