export type User = {
  id: string
  name: string
  email: string
  role: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: string
  refreshExpiresIn: string
  user: User
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
}
