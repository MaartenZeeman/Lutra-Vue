import { expect, test } from '@playwright/test'

import { samenvatting } from './fixtures'

test('zoekt via de navigatiebalk en toont het resultaat', async ({ page }) => {
  await page.route('**/api/verspakketten**', async (route) => {
    const url = new URL(route.request().url())
    const search = url.searchParams.get('search')

    await route.fulfill({
      json: {
        verspakketten: search
          ? [samenvatting('id-1', 'Pasta Pesto')]
          : [samenvatting('id-2', 'Soep Pakket')],
      },
    })
  })

  await page.goto('/')

  const zoekbalk = page.getByRole('search').first()
  await zoekbalk.getByRole('searchbox').fill('pasta')
  await zoekbalk.getByRole('button', { name: 'Zoeken' }).click()

  await expect(page).toHaveURL(/\/verspakketten\?q=pasta/)
  await expect(page.getByText('1 resultaat voor “pasta”')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pasta Pesto' })).toBeVisible()
})

test('sorteert het overzicht en bewaart de keuze in de URL', async ({ page }) => {
  const sorteerParams: string[] = []

  await page.route('**/api/verspakketten**', async (route) => {
    const url = new URL(route.request().url())
    sorteerParams.push(url.searchParams.toString())
    await route.fulfill({ json: { verspakketten: [samenvatting('id-1', 'Pakket')] } })
  })

  await page.goto('/verspakketten')

  await page.getByLabel('Sorteren op').selectOption('1-0')

  await expect(page).toHaveURL(/veld=1&richting=0/)
  expect(sorteerParams.at(-1)).toContain('sortField=1')
  expect(sorteerParams.at(-1)).toContain('sortDirection=0')
})
