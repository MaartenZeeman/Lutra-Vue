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
