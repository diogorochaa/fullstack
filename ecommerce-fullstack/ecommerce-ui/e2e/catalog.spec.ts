import { expect, test } from '@playwright/test'
import { mockCatalogApi } from './fixtures/api-mocks'

test.beforeEach(async ({ page }) => {
  await mockCatalogApi(page)
})

test('ver todos opens catalog page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Ver todos' }).click()
  await expect(page).toHaveURL(/\/produtos/)
  await expect(
    page.getByRole('heading', { name: 'Todos os produtos' }),
  ).toBeVisible()
})

test('catalog page shows pagination when enough products', async ({ page }) => {
  await page.goto('/produtos')
  await expect(
    page.getByRole('heading', { name: 'Todos os produtos' }),
  ).toBeVisible()
  await expect(page.getByText(/Página 1 de 3/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Página anterior' }),
  ).toBeVisible()
})

test('promoções navigation highlights catalog search', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Promoções' }).click()
  await expect(page).toHaveURL(/\/produtos\?search=promo/)
  await expect(page.getByText('Resultados para "promo"')).toBeVisible()
})
