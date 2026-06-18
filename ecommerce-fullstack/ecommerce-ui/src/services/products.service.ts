import { apiRequest } from '@/services/http/client'
import type { PaginatedResponse } from '@/types/api'
import type { Product, ProductFilters } from '@/types/product'

function buildQuery(filters: ProductFilters): string {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.categoryId) params.set('categoryId', filters.categoryId)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const productsService = {
  list(filters: ProductFilters = {}) {
    return apiRequest<PaginatedResponse<Product>>(
      `/products${buildQuery(filters)}`,
      { skipAuth: true },
    )
  },

  getById(id: string) {
    return apiRequest<Product>(`/products/${id}`, { skipAuth: true })
  },
}
