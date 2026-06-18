import type { AuthMeMessageRow } from "@/features/auth/types"
import { getFileKind } from "@/features/chat/lib/attachments"
import {
  normalizeMessageAttachments,
  parseMessageFromApi,
  serializeMessageForApi,
} from "@/features/chat/lib/message-content"
import type { ChatConversation, ChatMessage } from "@/features/chat/types"

export function sortByNewest(conversations: ChatConversation[]): ChatConversation[] {
  return [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function getConversationTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === "user")
  const attachments = firstUserMessage ? normalizeMessageAttachments(firstUserMessage) : []
  const attachmentTitle = attachments[0]?.name?.replace(/\.[^/.]+$/, "").slice(0, 40)
  return firstUserMessage?.content.slice(0, 40) || attachmentTitle || "Nova conversa"
}

export function createConversation(
  messages: ChatMessage[] = [],
  id = crypto.randomUUID(),
  updatedAt = new Date().toISOString(),
): ChatConversation {
  return {
    id,
    title: getConversationTitle(messages),
    updatedAt,
    messages,
  }
}

export function getUserMessageContent(question: string, files: File[]): string {
  const trimmed = question.trim()
  if (trimmed) return trimmed
  if (files.length === 0) return ""

  const kinds = files.map((f) => getFileKind(f))
  if (kinds.every((k) => k === "image")) {
    return files.length === 1 ? "Imagem enviada" : `${files.length} imagens enviadas`
  }
  if (files.length === 1) return files[0].name
  return `${files.length} anexos enviados`
}

export function historyRowsToConversations(history: AuthMeMessageRow[]): ChatConversation[] {
  const grouped = history.reduce<Record<string, ChatMessage[]>>((accumulator, message) => {
    const conversationId = message.conversation_id
    if (!accumulator[conversationId]) {
      accumulator[conversationId] = []
    }
    accumulator[conversationId].push(
      parseMessageFromApi(conversationId, message.created_at, message.role, message.content),
    )
    return accumulator
  }, {})

  const loaded = Object.entries(grouped).map(([conversationId, messages]) => ({
    id: conversationId,
    title: getConversationTitle(messages),
    updatedAt: messages.at(-1)?.createdAt ?? new Date().toISOString(),
    messages,
  }))

  return loaded.length > 0 ? sortByNewest(loaded) : [createConversation()]
}

/** Sincroniza o cache do React Query com o estado local das conversas. */
export function conversationsToMessageRows(conversations: ChatConversation[]): AuthMeMessageRow[] {
  const rows: AuthMeMessageRow[] = []
  for (const conversation of conversations) {
    for (const message of conversation.messages) {
      const hasContent = Boolean(message.content.trim())
      const hasMeta = Boolean(message.agentActivity || message.attachments?.length)
      if (!hasContent && !hasMeta) continue

      rows.push({
        conversation_id: conversation.id,
        role: message.role,
        content: serializeMessageForApi(message),
        created_at: message.createdAt || new Date().toISOString(),
      })
    }
  }
  return rows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function filterConversationsByQuery(
  conversations: ChatConversation[],
  query: string,
): ChatConversation[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return conversations
  return conversations.filter((c) => c.title.toLowerCase().includes(normalized))
}
