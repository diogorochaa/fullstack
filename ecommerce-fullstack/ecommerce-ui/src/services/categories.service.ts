import { apiRequest } from '@/services/http/client'
import type { PaginatedResponse } from '@/types/api'
import type { Category } from '@/types/category'

export const categoriesService = {
  list(page = 1, limit = 50) {
    return apiRequest<PaginatedResponse<Category>>(
      `/categories?page=${page}&limit=${limit}`,
      { skipAuth: true },
    )
  },
}
