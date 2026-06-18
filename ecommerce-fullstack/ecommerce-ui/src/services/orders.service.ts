import { apiRequest } from '@/services/http/client'
import type { Order } from '@/types/order'

export const ordersService = {
  list(token: string) {
    return apiRequest<Order[]>('/orders', { token })
  },

  getById(token: string, id: string) {
    return apiRequest<Order>(`/orders/${id}`, { token })
  },
}
