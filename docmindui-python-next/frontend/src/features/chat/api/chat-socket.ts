import { io, type Socket } from "socket.io-client"

import {
  type AgentActivityPayload,
  type AiActivityEventPayload,
  type AiAskPayload,
  type AiChunkPayload,
  type AiDonePayload,
  type AiErrorPayload,
  SocketEvents,
  type VisionImagePayload,
} from "@/features/chat/api/socket-events"
import type { AgentActivityMeta } from "@/features/chat/types/agent-activity"
import { mapFetchErrorToUserMessage } from "@/lib/api-error-message"

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH ?? "/socket.io"

let activeSocket: Socket | null = null
let activeToken: string | null = null

function getOrCreateSocket(token: string): Socket {
  if (activeSocket && activeToken === token) {
    return activeSocket
  }

  disconnectChatSocket()

  activeToken = token
  activeSocket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
  })

  return activeSocket
}

export function disconnectChatSocket(): void {
  if (activeSocket) {
    activeSocket.removeAllListeners()
    activeSocket.disconnect()
  }
  activeSocket = null
  activeToken = null
}

function toActivityMeta(payload: AgentActivityPayload): AgentActivityMeta {
  return {
    intent: payload.intent,
    steps: payload.steps ?? [],
    tools: payload.tools ?? [],
    sources: payload.sources ?? [],
    documents_in_base: payload.documents_in_base ?? 0,
    knowledge_base_id: payload.knowledge_base_id ?? null,
    knowledge_base_name: payload.knowledge_base_name ?? null,
    search_label: payload.search_label ?? null,
    status_message: payload.status_message ?? null,
    reasoning_log: payload.reasoning_log ?? null,
  }
}

export type StreamAiAnswerOptions = {
  question: string
  conversationId: string
  token: string
  knowledgeBaseId?: string | null
  images?: VisionImagePayload[]
  attachmentContext?: string
  onChunk: (delta: string, fullText: string) => void
  onActivity?: (activity: AgentActivityMeta) => void
}

export function requestAiAnswerStream({
  question,
  conversationId,
  token,
  knowledgeBaseId,
  images = [],
  attachmentContext,
  onChunk,
  onActivity,
}: StreamAiAnswerOptions): Promise<string> {
  const socket = getOrCreateSocket(token)

  return new Promise((resolve, reject) => {
    let fullText = ""
    let settled = false

    const onActivityEvent = (payload: AiActivityEventPayload) => {
      if (!payload.activity) return
      onActivity?.(toActivityMeta(payload.activity))
    }

    const cleanup = () => {
      socket.off(SocketEvents.AI_ACTIVITY, onActivityEvent)
      socket.off(SocketEvents.AI_CHUNK, onChunkEvent)
      socket.off(SocketEvents.AI_DONE, onDone)
      socket.off(SocketEvents.AI_ERROR, onError)
      socket.off("connect_error", onConnectError)
    }

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      cleanup()
      fn()
    }

    const onChunkEvent = (payload: AiChunkPayload) => {
      if (!payload.delta) return
      fullText += payload.delta
      onChunk(payload.delta, fullText)
    }

    const onDone = (_payload: AiDonePayload) => {
      finish(() => resolve(fullText))
    }

    const onError = (payload: AiErrorPayload) => {
      finish(() => reject(new Error(payload.message || "Falha ao consultar a IA.")))
    }

    const onConnectError = (error: Error) => {
      finish(() => reject(new Error(mapFetchErrorToUserMessage(error))))
    }

    const emitAsk = () => {
      const payload: AiAskPayload = {
        question,
        conversation_id: conversationId,
        ...(knowledgeBaseId ? { knowledge_base_id: knowledgeBaseId } : {}),
        ...(images.length > 0 ? { images } : {}),
        ...(attachmentContext?.trim() ? { attachment_context: attachmentContext.trim() } : {}),
      }
      socket.emit(SocketEvents.AI_ASK, payload)
    }

    socket.on(SocketEvents.AI_ACTIVITY, onActivityEvent)
    socket.on(SocketEvents.AI_CHUNK, onChunkEvent)
    socket.on(SocketEvents.AI_DONE, onDone)
    socket.on(SocketEvents.AI_ERROR, onError)
    socket.on("connect_error", onConnectError)

    if (socket.connected) {
      emitAsk()
      return
    }

    socket.once("connect", emitAsk)
    if (!socket.active) {
      socket.connect()
    }
  })
}
