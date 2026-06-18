import type { AuthMeResponse } from "@/features/auth/types"
import { mapFetchErrorToUserMessage, mapHttpStatusToUserMessage } from "@/lib/api-error-message"

const BACKEND_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

async function readErrorMessage(response: Response, fallback: string) {
  if (response.status >= 500) {
    return mapHttpStatusToUserMessage(response.status, fallback)
  }

  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const err = (await response.json().catch(() => null)) as {
      detail?: unknown
    } | null
    const detail = err?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
      const joined = detail
        .map((d) =>
          typeof d === "object" && d && "msg" in d ? String((d as { msg: string }).msg) : "",
        )
        .join(" ")
        .trim()
      if (joined) return joined
    }
  }

  const body = await response.text().catch(() => "")
  if (body.trim()) return body

  return fallback
}

async function fetchBackend(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (error: unknown) {
    throw new Error(mapFetchErrorToUserMessage(error))
  }
}

export async function requestMe(accessToken: string): Promise<AuthMeResponse> {
  const response = await fetchBackend(`${BACKEND_API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error("Sessão expirada. Faça login novamente.")
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao validar sessão."))
  }

  try {
    return (await response.json()) as AuthMeResponse
  } catch {
    throw new Error("Resposta inválida ao carregar o perfil.")
  }
}
