import { apiRequest } from '@/services/http/client'
import type { User } from '@/types/auth'

export type UpdateUserPayload = {
  name?: string
  email?: string
  password?: string
}

export const usersService = {
  getMe(token: string) {
    return apiRequest<User>('/users/me', { token })
  },

  updateMe(token: string, payload: UpdateUserPayload) {
    return apiRequest<User>('/users/me', {
      method: 'PATCH',
      body: payload,
      token,
    })
  },
}
