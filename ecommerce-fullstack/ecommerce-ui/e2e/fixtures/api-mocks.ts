import type { Page } from '@playwright/test'

const API_URL = 'http://localhost:3000'

type MockProductsOptions = {
  total?: number
  limit?: number
}

export async function mockCatalogApi(
  page: Page,
  { total = 32, limit = 12 }: MockProductsOptions = {},
) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  await page.route(`${API_URL}/categories**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1,
      }),
    })
  })

  await page.route(`${API_URL}/products**`, async (route) => {
    const url = new URL(route.request().url())
    const pageNum = Number(url.searchParams.get('page') ?? 1)
    const pageLimit = Number(url.searchParams.get('limit') ?? limit)
    const search = url.searchParams.get('search') ?? ''
    const start = (pageNum - 1) * pageLimit
    const count = Math.min(pageLimit, Math.max(0, total - start))

    const products = Array.from({ length: count }, (_, index) => {
      const n = start + index + 1
      return {
        id: `prod-${n}`,
        name: search ? `Promo ${n}` : `Produto ${n}`,
        slug: `produto-${n}`,
        description: 'Descrição de teste',
        price: 99.9,
        stock: 10,
        imageUrl: null,
        active: true,
        categoryId: 'cat-1',
      }
    })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: products,
        total,
        page: pageNum,
        limit: pageLimit,
        totalPages,
      }),
    })
  })
}
