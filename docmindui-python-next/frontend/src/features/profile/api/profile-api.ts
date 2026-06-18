import { mapFetchErrorToUserMessage, mapHttpStatusToUserMessage } from "@/lib/api-error-message"

const BACKEND_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

export type ProfileData = {
  id: string
  user_id: string
  nome: string | null
  email: string | null
  telefone: string | null
  cep: string | null
  rua: string | null
  numero: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  created_at: string
  updated_at: string
}

export type ProfileUpdatePayload = Partial<
  Pick<
    ProfileData,
    "nome" | "email" | "telefone" | "cep" | "rua" | "numero" | "bairro" | "cidade" | "estado"
  >
>

export type CepData = {
  cep: string
  rua: string
  bairro: string
  cidade: string
  estado: string
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  if (response.status === 401 || response.status === 403) {
    return "Sessão expirada. Faça login novamente."
  }
  if (response.status >= 500) {
    return mapHttpStatusToUserMessage(response.status, fallback)
  }
  const err = (await response.json().catch(() => null)) as { detail?: unknown } | null
  if (typeof err?.detail === "string") return err.detail
  return fallback
}

async function fetchBackend(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (error: unknown) {
    throw new Error(mapFetchErrorToUserMessage(error))
  }
}

export async function fetchProfile(token: string): Promise<ProfileData> {
  const response = await fetchBackend(`${BACKEND_API_URL}/profile/me`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao carregar o perfil."))
  }
  return (await response.json()) as ProfileData
}

export async function updateProfile(
  token: string,
  payload: ProfileUpdatePayload,
): Promise<ProfileData> {
  const response = await fetchBackend(`${BACKEND_API_URL}/profile/me`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao salvar o perfil."))
  }
  return (await response.json()) as ProfileData
}

export async function lookupCep(token: string, cep: string): Promise<CepData> {
  const digits = cep.replace(/\D/g, "")
  const response = await fetchBackend(`${BACKEND_API_URL}/profile/cep/${digits}`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "CEP não encontrado."))
  }
  return (await response.json()) as CepData
}
