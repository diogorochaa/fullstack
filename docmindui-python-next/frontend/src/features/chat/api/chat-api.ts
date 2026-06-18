import { mapFetchErrorToUserMessage, mapHttpStatusToUserMessage } from "@/lib/api-error-message"

const BACKEND_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

type HistoryMessage = {
  conversation_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

type AskAiResponse = {
  response: string
}

function authHeaders(token?: string, contentType = "application/json") {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(contentType ? { "Content-Type": contentType } : {}),
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  if (response.status === 401 || response.status === 403) {
    return "Sessão expirada. Faça login novamente."
  }

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

export async function requestMessages(token?: string): Promise<HistoryMessage[]> {
  const response = await fetchBackend(`${BACKEND_API_URL}/messages/`, {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao carregar o histórico."))
  }

  try {
    return (await response.json()) as HistoryMessage[]
  } catch {
    throw new Error("Resposta inválida ao carregar o histórico de mensagens.")
  }
}

export async function clearMessageHistory(token?: string): Promise<void> {
  const response = await fetchBackend(`${BACKEND_API_URL}/messages/`, {
    method: "DELETE",
    headers: authHeaders(token),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao limpar o histórico."))
  }
}

export async function deleteConversationHistory(
  conversationId: string,
  token?: string,
): Promise<void> {
  const response = await fetchBackend(
    `${BACKEND_API_URL}/messages/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao excluir a conversa."))
  }
}

export type SavedMessageResponse = {
  conversation_id: string
  role: string
  content: string
  created_at: string
}

export async function postMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  token?: string,
): Promise<SavedMessageResponse> {
  const response = await fetchBackend(`${BACKEND_API_URL}/messages/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ conversation_id: conversationId, role, content }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao salvar a mensagem."))
  }
  return (await response.json()) as SavedMessageResponse
}

export async function requestAiAnswer(question: string, token?: string): Promise<string> {
  const response = await fetchBackend(`${BACKEND_API_URL}/ai`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ question }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao consultar a IA."))
  }

  try {
    const data = (await response.json()) as AskAiResponse
    return data.response
  } catch {
    throw new Error("Resposta inválida da IA.")
  }
}

export async function requestDocumentUpload(file: File, token?: string): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetchBackend(`${BACKEND_API_URL}/documents/upload`, {
    method: "POST",
    headers: authHeaders(token, ""),
    body: formData,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao enviar o arquivo."))
  }
}
