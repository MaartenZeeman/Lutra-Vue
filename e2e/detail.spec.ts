import { expect, test } from '@playwright/test'

import { verspakketDetail } from './fixtures'

test('toont details en plaatst een beoordeling', async ({ page }) => {
  let beoordelingVerzonden = false

  await page.route('**/api/verspakketten/*', async (route) => {
    await route.fulfill({ json: verspakketDetail() })
  })

  await page.route('**/api/verspakketten/*/beoordelingen', async (route) => {
    beoordelingVerzonden = true
    await route.fulfill({ status: 201, json: { id: 'beoordeling-1' } })
  })

  await page.goto('/verspakketten/11111111-1111-1111-1111-111111111111')

  await expect(page.getByRole('heading', { name: 'Jumbo Satépannetje' })).toBeVisible()
  await expect(page.getByText('Kipfilet')).toBeVisible()
  await expect(page.getByText('Heerlijk met de kinderen.')).toBeVisible()

  await page.getByRole('button', { name: 'Beoordeling plaatsen' }).click()

  await expect(page.getByText('Bedankt, je beoordeling is opgeslagen.')).toBeVisible()
  expect(beoordelingVerzonden).toBe(true)
})

test('bewerkt en verwijdert een beoordeling', async ({ page }) => {
  let bijgewerkt = false
  let verwijderd = false

  await page.route('**/api/verspakketten/*', (route) => route.fulfill({ json: verspakketDetail() }))

  await page.route('**/api/verspakketten/*/beoordelingen/*', async (route) => {
    if (route.request().method() === 'PUT') {
      bijgewerkt = true
      await route.fulfill({ status: 204 })
      return
    }

    verwijderd = true
    await route.fulfill({ status: 204 })
  })

  await page.goto('/verspakketten/11111111-1111-1111-1111-111111111111')

  await page.getByRole('button', { name: 'Bewerken' }).click()
  await page.getByRole('button', { name: 'Wijzigingen opslaan' }).click()
  expect(bijgewerkt).toBe(true)

  await page.locator('.beoordelingen').getByRole('button', { name: 'Verwijderen' }).click()
  await page.getByRole('button', { name: 'Ja, verwijderen' }).click()
  expect(verwijderd).toBe(true)
})

test('verwijdert een verspakket en gaat terug naar het overzicht', async ({ page }) => {
  let verwijderd = false

  await page.route('**/api/verspakketten**', (route) =>
    route.fulfill({ json: { verspakketten: [] } }),
  )

  await page.route('**/api/verspakketten/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      verwijderd = true
      await route.fulfill({ status: 204 })
      return
    }

    await route.fulfill({ json: verspakketDetail() })
  })

  await page.goto('/verspakketten/11111111-1111-1111-1111-111111111111')

  await page.locator('.kop').getByRole('button', { name: 'Verwijderen' }).click()
  await page.getByRole('button', { name: 'Ja, verwijderen' }).click()

  await expect(page).toHaveURL(/\/verspakketten$/)
  expect(verwijderd).toBe(true)
})
