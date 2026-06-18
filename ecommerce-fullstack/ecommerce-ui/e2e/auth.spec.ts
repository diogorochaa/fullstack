import { expect, test } from '@playwright/test'

test('register page renders form', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible()
})

test('admin route redirects unauthenticated users to login', async ({
  page,
}) => {
  await page.goto('/admin/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
