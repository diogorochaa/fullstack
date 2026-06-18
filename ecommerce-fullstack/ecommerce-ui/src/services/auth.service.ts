import { apiRequest } from '@/services/http/client'
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/auth'

export const authService = {
  login(payload: LoginPayload) {
    return apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  },

  register(payload: RegisterPayload) {
    return apiRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  },

  refresh(refreshToken: string) {
    return apiRequest<AuthSession>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    })
  },

  getMe(token: string) {
    return apiRequest<User>('/users/me', { token })
  },
}
