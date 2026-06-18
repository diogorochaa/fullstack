/** Contrato de eventos Socket.IO (espelha backend `src/realtime/events.py`). */

export const SocketEvents = {
  AI_ASK: "ai:ask",
  AI_ACTIVITY: "ai:activity",
  AI_CHUNK: "ai:chunk",
  AI_DONE: "ai:done",
  AI_ERROR: "ai:error",
  CONNECTED: "connected",
} as const

export type AgentActivityPayload = {
  intent: string
  steps: { phase: string; label: string; detail?: string | null }[]
  tools: string[]
  sources: {
    document_id: string
    titulo: string
    palavras_chave?: string
    snippet?: string
  }[]
  documents_in_base: number
  knowledge_base_id?: string | null
  knowledge_base_name?: string | null
  search_label?: string | null
  status_message?: string | null
  reasoning_log?: string | null
}

export type AiActivityEventPayload = {
  conversation_id?: string | null
  activity: AgentActivityPayload
}

export type AiChunkPayload = {
  delta: string
  conversation_id?: string | null
}

export type AiDonePayload = {
  conversation_id?: string | null
}

export type AiErrorPayload = {
  message: string
  conversation_id?: string | null
}

export type VisionImagePayload = {
  base64: string
  media_type: string
}

export type AiAskPayload = {
  question: string
  conversation_id?: string
  knowledge_base_id?: string
  images?: VisionImagePayload[]
  attachment_context?: string
  /** @deprecated use `images` */
  image_base64?: string
  /** @deprecated use `images` */
  image_media_type?: string
}
