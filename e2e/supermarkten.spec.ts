import { expect, test } from '@playwright/test'

import { supermarkt } from './fixtures'

test('bewerkt en verwijdert een supermarkt', async ({ page }) => {
  let bijgewerkt = false
  let verwijderd = false

  await page.route('**/api/supermarkten**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, json: { id: 'nieuwe-supermarkt' } })
      return
    }

    await route.fulfill({ json: { supermarkten: [supermarkt] } })
  })

  await page.route('**/api/supermarkten/*', async (route) => {
    if (route.request().method() === 'PUT') {
      bijgewerkt = true
      await route.fulfill({ status: 204 })
      return
    }

    verwijderd = true
    await route.fulfill({ status: 204 })
  })

  await page.goto('/supermarkten')

  await page.getByRole('button', { name: 'Bewerken' }).click()
  await page.getByLabel('Naam van Jumbo').fill('Jumbo XL')
  await page.getByRole('button', { name: 'Opslaan' }).click()
  expect(bijgewerkt).toBe(true)

  await page.getByRole('button', { name: 'Verwijderen' }).click()
  await page.getByRole('button', { name: 'Ja, verwijderen' }).click()
  expect(verwijderd).toBe(true)
})

test('meldt dat een supermarkt met verspakketten niet verwijderd kan worden', async ({ page }) => {
  await page.route('**/api/supermarkten**', (route) =>
    route.fulfill({ json: { supermarkten: [supermarkt] } }),
  )

  await page.route('**/api/supermarkten/*', (route) =>
    route.fulfill({
      status: 409,
      contentType: 'application/problem+json',
      json: { title: 'Conflict', status: 409 },
    }),
  )

  await page.goto('/supermarkten')

  await page.getByRole('button', { name: 'Verwijderen' }).click()
  await page.getByRole('button', { name: 'Ja, verwijderen' }).click()

  await expect(
    page.getByText('Deze supermarkt heeft nog verspakketten. Verwijder of verplaats die eerst.'),
  ).toBeVisible()
})
