import { apiRequest } from '@/services/http/client'
import type { AddCartItemPayload, Cart } from '@/types/cart'

export const cartService = {
  get(token: string) {
    return apiRequest<Cart>('/cart', { token })
  },

  addItem(token: string, payload: AddCartItemPayload) {
    return apiRequest<Cart>('/cart/items', {
      method: 'POST',
      body: payload,
      token,
    })
  },

  updateItem(token: string, itemId: string, quantity: number) {
    return apiRequest<Cart>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: { quantity },
      token,
    })
  },

  removeItem(token: string, itemId: string) {
    return apiRequest<Cart>(`/cart/items/${itemId}`, {
      method: 'DELETE',
      token,
    })
  },
}
