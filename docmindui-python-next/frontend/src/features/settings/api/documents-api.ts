import { mapFetchErrorToUserMessage, mapHttpStatusToUserMessage } from "@/lib/api-error-message"

const BACKEND_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

export type DocumentItem = {
  id: string
  titulo: string
  palavras_chave: string
  resumo: string
  arquivo_original: string
  knowledge_base_id?: string | null
  knowledge_base_nome?: string | null
  created_at: string
  updated_at: string
  status: "ativo" | "inativo"
  chunks_count: number
  index_ready: boolean
  vigencia?: string | null
}

type UploadResponse = {
  status: string
  document: DocumentItem
  chunks_indexed: number
  pages_extracted?: number
  chars_extracted?: number
  text_preview?: string
}

function authHeaders(token: string, contentType?: string) {
  return {
    Authorization: `Bearer ${token}`,
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

export async function listDocuments(
  token: string,
  knowledgeBaseId?: string,
): Promise<DocumentItem[]> {
  const query = knowledgeBaseId ? `?knowledge_base_id=${encodeURIComponent(knowledgeBaseId)}` : ""
  const response = await fetchBackend(`${BACKEND_API_URL}/documents/${query || ""}`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao listar documentos."))
  }
  return (await response.json()) as DocumentItem[]
}

export async function uploadDocument(
  token: string,
  file: File,
  knowledgeBaseId?: string,
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)
  const query = knowledgeBaseId ? `?knowledge_base_id=${encodeURIComponent(knowledgeBaseId)}` : ""
  const response = await fetchBackend(`${BACKEND_API_URL}/documents/upload${query}`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao enviar o PDF."))
  }
  return (await response.json()) as UploadResponse
}

export async function fetchDocumentPreviewBlob(token: string, documentId: string): Promise<Blob> {
  const response = await fetchBackend(`${BACKEND_API_URL}/documents/${documentId}/file`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao abrir o PDF."))
  }
  return response.blob()
}

export async function reindexDocument(token: string, documentId: string): Promise<DocumentItem> {
  const response = await fetchBackend(`${BACKEND_API_URL}/documents/${documentId}/reindex`, {
    method: "POST",
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao reindexar o documento."))
  }
  return (await response.json()) as DocumentItem
}

export async function deleteDocument(token: string, documentId: string): Promise<void> {
  const response = await fetchBackend(`${BACKEND_API_URL}/documents/${documentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Falha ao excluir o documento."))
  }
}
