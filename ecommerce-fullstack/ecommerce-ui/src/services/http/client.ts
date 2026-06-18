import { env } from '@/lib/env'
import type { ApiError } from '@/types/api'

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
  skipAuth?: boolean
}

export class HttpError extends Error {
  status: number
  data: ApiError

  constructor(status: number, data: ApiError) {
    super(Array.isArray(data.message) ? data.message.join(', ') : data.message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

let refreshHandler: (() => Promise<string | null>) | null = null

export function setRefreshHandler(handler: () => Promise<string | null>) {
  refreshHandler = handler
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    return (await response.json()) as ApiError
  } catch {
    return { statusCode: response.status, message: response.statusText }
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  retried = false,
): Promise<T> {
  const { method = 'GET', body, token, skipAuth = false } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (!skipAuth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (response.status === 401 && !retried && refreshHandler && !skipAuth) {
    const newToken = await refreshHandler()
    if (newToken) {
      return apiRequest<T>(path, { ...options, token: newToken }, true)
    }
  }

  if (!response.ok) {
    throw new HttpError(response.status, await parseError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
