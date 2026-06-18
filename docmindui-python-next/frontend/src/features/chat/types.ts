import type { AttachmentKind } from "@/features/chat/lib/attachments"

export type MessageRole = "user" | "assistant"

export type ChatAttachment = {
  id: string
  name: string
  mimeType: string
  kind: AttachmentKind
  size?: number
  /** Pré-visualização local (blob URL ou data URL). */
  previewUrl?: string
  /** Persistência de imagens (data URL). */
  dataUrl?: string
  /** Trecho de texto enviado à IA (txt, md, csv, etc.). */
  textSnippet?: string
}

import type { AgentActivityMeta } from "@/features/chat/types/agent-activity"

export type ChatMessage = {
  conversationId?: string
  createdAt?: string
  role: MessageRole
  content: string
  attachments?: ChatAttachment[]
  /** Metadados do agente (passos, bases consultadas). */
  agentActivity?: AgentActivityMeta
}

export type ChatConversation = {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
}
