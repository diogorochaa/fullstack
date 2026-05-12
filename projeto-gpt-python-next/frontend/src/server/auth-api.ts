import 'server-only'

const BACKEND_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export type LoginResult = {
  access_token: string
  token_type: string
}

export type RegisterResult = {
  id: number
  email: string
}

export async function requestLogin(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => null)) as { detail?: unknown } | null
    const detail = err?.detail
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String((d as { msg: string }).msg) : '')).join(' ')
          : 'Falha ao entrar.'
    throw new Error(message || 'Falha ao entrar.')
  }

  return (await response.json()) as LoginResult
}

export async function requestRegister(email: string, password: string): Promise<RegisterResult> {
  const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => null)) as { detail?: unknown } | null
    const detail = err?.detail
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String((d as { msg: string }).msg) : '')).join(' ')
          : 'Falha ao cadastrar.'
    throw new Error(message || 'Falha ao cadastrar.')
  }

  return (await response.json()) as RegisterResult
}
