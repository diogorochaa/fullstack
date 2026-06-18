import { authService } from '@/services/auth.service'
import { setRefreshHandler } from '@/services/http/client'
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/auth'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  refreshAccessToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setSession: (session) => {
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user,
          isAuthenticated: true,
        })
      },

      login: async (payload) => {
        const session = await authService.login(payload)
        get().setSession(session)
      },

      register: async (payload) => {
        const session = await authService.register(payload)
        get().setSession(session)
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user) => {
        set({ user })
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return null

        try {
          const session = await authService.refresh(refreshToken)
          get().setSession(session)
          return session.accessToken
        } catch {
          get().logout()
          return null
        }
      },
    }),
    {
      name: 'shopmax-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

setRefreshHandler(() => useAuthStore.getState().refreshAccessToken())
