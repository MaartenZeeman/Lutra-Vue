import { expect, test } from '@playwright/test'

test('volgt de importstatus tot deze is voltooid', async ({ page }) => {
  let aantalPolls = 0

  await page.route('**/api/verspakketten/import', (route) =>
    route.fulfill({
      status: 202,
      json: { id: 'job-1', status: 0, attemptCount: 0, nextAttemptAt: null, existing: false },
    }),
  )

  await page.route('**/api/background-commands/job-1', async (route) => {
    aantalPolls += 1

    const voltooid = aantalPolls >= 2
    await route.fulfill({
      json: {
        id: 'job-1',
        type: 1,
        status: voltooid ? 3 : 1,
        attemptCount: 0,
        nextAttemptAt: null,
        startedAt: null,
        completedAt: null,
        resultVerspakketId: voltooid ? 'resultaat-1' : null,
        lastError: null,
      },
    })
  })

  await page.goto('/verspakketten/importeren')
  await page.getByLabel('Product-URL').fill('https://example.nl/product')
  await page.getByRole('button', { name: 'Importeren' }).click()

  await expect(page.getByText('Voltooid')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('link', { name: 'Bekijk het resultaat' })).toBeVisible()
})

test('meldt een mislukte import', async ({ page }) => {
  await page.route('**/api/verspakketten/import', (route) =>
    route.fulfill({
      status: 202,
      json: { id: 'job-2', status: 0, attemptCount: 0, nextAttemptAt: null, existing: false },
    }),
  )

  await page.route('**/api/background-commands/job-2', (route) =>
    route.fulfill({
      json: {
        id: 'job-2',
        type: 1,
        status: 4,
        attemptCount: 3,
        nextAttemptAt: null,
        startedAt: null,
        completedAt: null,
        resultVerspakketId: null,
        lastError: 'De productpagina kon niet worden gelezen.',
      },
    }),
  )

  await page.goto('/verspakketten/importeren')
  await page.getByLabel('Product-URL').fill('https://example.nl/product')
  await page.getByRole('button', { name: 'Importeren' }).click()

  await expect(page.getByText('Mislukt', { exact: true })).toBeVisible()
  await expect(
    page.getByText('De import is mislukt. De productpagina kon niet worden gelezen.'),
  ).toBeVisible()
})
