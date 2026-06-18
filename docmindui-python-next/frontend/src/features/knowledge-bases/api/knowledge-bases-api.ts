import { mapFetchErrorToUserMessage } from "@/lib/api-error-message"

const BACKEND_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

export type KnowledgeBaseItem = {
  id: string
  nome: string
  slug: string
  document_count: number
  created_at: string
}

/** Bases vazias não entram no chat (sem PDFs indexados). */
export function knowledgeBasesWithDocuments(bases: KnowledgeBaseItem[]): KnowledgeBaseItem[] {
  return bases.filter((base) => base.document_count > 0)
}

async function fetchBackend(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (error: unknown) {
    throw new Error(mapFetchErrorToUserMessage(error))
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  const err = (await response.json().catch(() => null)) as { detail?: unknown } | null
  if (typeof err?.detail === "string") return err.detail
  return fallback
}

export async function listKnowledgeBases(token: string): Promise<KnowledgeBaseItem[]> {
  const response = await fetchBackend(`${BACKEND_API_URL}/knowledge-bases/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error("Falha ao carregar bases de conhecimento.")
  }
  return response.json() as Promise<KnowledgeBaseItem[]>
}

export async function createKnowledgeBase(token: string, nome: string): Promise<KnowledgeBaseItem> {
  const response = await fetchBackend(`${BACKEND_API_URL}/knowledge-bases/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome }),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao criar base de conhecimento."))
  }
  return response.json() as Promise<KnowledgeBaseItem>
}

export async function updateKnowledgeBase(
  token: string,
  baseId: string,
  nome: string,
): Promise<KnowledgeBaseItem> {
  const response = await fetchBackend(`${BACKEND_API_URL}/knowledge-bases/${baseId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome }),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao renomear base de conhecimento."))
  }
  return response.json() as Promise<KnowledgeBaseItem>
}

export async function deleteKnowledgeBase(token: string, baseId: string): Promise<void> {
  const response = await fetchBackend(`${BACKEND_API_URL}/knowledge-bases/${baseId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao excluir base de conhecimento."))
  }
}
