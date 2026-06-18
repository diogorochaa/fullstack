import "server-only"

import { mapFetchErrorToUserMessage, mapHttpStatusToUserMessage } from "@/lib/api-error-message"

const BACKEND_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

export type LoginResult = {
  access_token: string
  token_type: string
}

export type RegisterResult = {
  id: string
  email: string
}

function parseApiDetail(detail: unknown): string | null {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return (
      detail
        .map((d) =>
          typeof d === "object" && d && "msg" in d ? String((d as { msg: string }).msg) : "",
        )
        .join(" ")
        .trim() || null
    )
  }
  return null
}

export async function requestLogin(email: string, password: string): Promise<LoginResult> {
  let response: Response
  try {
    response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      cache: "no-store",
    })
  } catch (error: unknown) {
    throw new Error(mapFetchErrorToUserMessage(error))
  }

  if (!response.ok) {
    const fallback = mapHttpStatusToUserMessage(response.status, "Falha ao entrar.")
    const err = (await response.json().catch(() => null)) as {
      detail?: unknown
    } | null
    const fromApi = parseApiDetail(err?.detail)
    throw new Error(fromApi || fallback)
  }

  try {
    return (await response.json()) as LoginResult
  } catch {
    throw new Error("Resposta inválida do servidor ao iniciar sessão.")
  }
}

export async function requestRegister(email: string, password: string): Promise<RegisterResult> {
  let response: Response
  try {
    response = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      cache: "no-store",
    })
  } catch (error: unknown) {
    throw new Error(mapFetchErrorToUserMessage(error))
  }

  if (!response.ok) {
    const fallback = mapHttpStatusToUserMessage(response.status, "Falha ao cadastrar.")
    const err = (await response.json().catch(() => null)) as {
      detail?: unknown
    } | null
    const fromApi = parseApiDetail(err?.detail)
    throw new Error(fromApi || fallback)
  }

  try {
    return (await response.json()) as RegisterResult
  } catch {
    throw new Error("Resposta inválida do servidor ao cadastrar.")
  }
}
