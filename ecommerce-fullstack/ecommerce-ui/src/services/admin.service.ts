import { apiRequest } from '@/services/http/client'
import type {
  AdminStats,
  AdminUser,
  CreateProductPayload,
  UpdateProductPayload,
} from '@/types/admin'
import type { PaginatedResponse } from '@/types/api'
import type { Order } from '@/types/order'
import type { Product } from '@/types/product'

export const adminService = {
  getStats(token: string) {
    return apiRequest<AdminStats>('/admin/stats', { token })
  },

  listUsers(token: string, page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (search) params.set('search', search)
    return apiRequest<PaginatedResponse<AdminUser>>(`/admin/users?${params}`, {
      token,
    })
  },

  updateUserRole(token: string, userId: string, role: 'CUSTOMER' | 'ADMIN') {
    return apiRequest<AdminUser>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
      token,
    })
  },

  deleteUser(token: string, userId: string) {
    return apiRequest<{ success: true }>(`/admin/users/${userId}`, {
      method: 'DELETE',
      token,
    })
  },

  listOrders(token: string, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return apiRequest<PaginatedResponse<Order>>(`/admin/orders?${params}`, {
      token,
    })
  },

  updateOrderStatus(token: string, orderId: string, status: string) {
    return apiRequest<Order>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
      token,
    })
  },

  createProduct(token: string, payload: CreateProductPayload) {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: payload,
      token,
    })
  },

  updateProduct(
    token: string,
    productId: string,
    payload: UpdateProductPayload,
  ) {
    return apiRequest<Product>(`/products/${productId}`, {
      method: 'PATCH',
      body: payload,
      token,
    })
  },

  deleteProduct(token: string, productId: string) {
    return apiRequest<void>(`/products/${productId}`, {
      method: 'DELETE',
      token,
    })
  },
}
