import { expect, test } from '@playwright/test'

import { supermarkt, verspakketDetail } from './fixtures'

test('maakt een verspakket aan', async ({ page }) => {
  let verzondenBody: Record<string, unknown> | null = null

  await page.route('**/api/supermarkten**', (route) =>
    route.fulfill({ json: { supermarkten: [supermarkt] } }),
  )

  await page.route('**/api/verspakketten', async (route) => {
    if (route.request().method() === 'POST') {
      verzondenBody = route.request().postDataJSON() as Record<string, unknown>
      await route.fulfill({ status: 201, json: { id: 'nieuw-id' } })
      return
    }

    await route.fulfill({ json: { verspakketten: [] } })
  })

  await page.route('**/api/verspakketten/*', (route) =>
    route.fulfill({ json: verspakketDetail('Nieuw Pakket') }),
  )

  await page.goto('/verspakketten/toevoegen')

  await page.locator('#form-naam').fill('Nieuw Pakket')
  await page.locator('#form-prijs').fill('7,49')
  await page.locator('#form-supermarkt').selectOption(supermarkt.id)
  await page.getByRole('button', { name: 'Verspakket toevoegen' }).click()

  await expect(page).toHaveURL(/\/verspakketten\/nieuw-id/)
  expect(verzondenBody).toMatchObject({
    naam: 'Nieuw Pakket',
    prijsInCenten: 749,
    aantalPersonen: 2,
    supermarktId: supermarkt.id,
  })
})

test('weigert een onvolledig formulier', async ({ page }) => {
  await page.route('**/api/supermarkten**', (route) =>
    route.fulfill({ json: { supermarkten: [supermarkt] } }),
  )

  await page.goto('/verspakketten/toevoegen')
  await page.getByRole('button', { name: 'Verspakket toevoegen' }).click()

  await expect(page.getByText('Vul een naam in.')).toBeVisible()
  await expect(page.getByText('Vul een geldige prijs in euro’s in.')).toBeVisible()
})
