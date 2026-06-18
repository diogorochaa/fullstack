import { expect, test } from '@playwright/test'

test('home page shows shopmax branding', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('shopmax').first()).toBeVisible()
  await expect(page.getByText('Produtos em destaque')).toBeVisible()
})

test('login page renders form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Bem-vindo de volta')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
})
