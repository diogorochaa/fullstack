import type { ChatAttachment, ChatMessage } from "@/features/chat/types"
import type { AgentActivityMeta } from "@/features/chat/types/agent-activity"

type StoredAttachment = {
  id: string
  kind: ChatAttachment["kind"]
  name: string
  mimeType: string
  size?: number
  dataUrl?: string
  textSnippet?: string
}

type StoredMessagePayloadV1 = {
  v: 1
  text: string
  attachment?: {
    kind: ChatAttachment["kind"]
    name: string
    mimeType: string
    dataUrl?: string
  }
}

type StoredMessagePayloadV2 = {
  v: 2
  text: string
  attachments?: StoredAttachment[]
}

type StoredMessagePayloadV3 = {
  v: 3
  text: string
  attachments?: StoredAttachment[]
  agentActivity?: AgentActivityMeta
}

function toChatAttachment(stored: StoredAttachment): ChatAttachment {
  return {
    id: stored.id,
    kind: stored.kind,
    name: stored.name,
    mimeType: stored.mimeType,
    size: stored.size,
    dataUrl: stored.dataUrl,
    previewUrl: stored.dataUrl,
    textSnippet: stored.textSnippet,
  }
}

export function normalizeMessageAttachments(message: ChatMessage): ChatAttachment[] {
  return message.attachments ?? []
}

export function serializeMessageForApi(message: ChatMessage): string {
  const attachments = normalizeMessageAttachments(message)
  const hasRichData = attachments.some((a) => a.dataUrl || a.textSnippet || a.kind !== "pdf")
  const hasActivity = message.role === "assistant" && Boolean(message.agentActivity)

  if (!hasRichData && attachments.length === 0 && !hasActivity) {
    return message.content
  }

  if (hasActivity) {
    const payload: StoredMessagePayloadV3 = {
      v: 3,
      text: message.content,
      agentActivity: message.agentActivity,
      ...(attachments.length > 0
        ? {
            attachments: attachments.map((a) => ({
              id: a.id,
              kind: a.kind,
              name: a.name,
              mimeType: a.mimeType,
              size: a.size,
              ...(a.dataUrl ? { dataUrl: a.dataUrl } : {}),
              ...(a.textSnippet ? { textSnippet: a.textSnippet } : {}),
            })),
          }
        : {}),
    }
    return JSON.stringify(payload)
  }

  const payload: StoredMessagePayloadV2 = {
    v: 2,
    text: message.content,
    attachments: attachments.map((a) => ({
      id: a.id,
      kind: a.kind,
      name: a.name,
      mimeType: a.mimeType,
      size: a.size,
      ...(a.dataUrl ? { dataUrl: a.dataUrl } : {}),
      ...(a.textSnippet ? { textSnippet: a.textSnippet } : {}),
    })),
  }
  return JSON.stringify(payload)
}

export function parseMessageFromApi(
  conversationId: string,
  createdAt: string,
  role: string,
  content: string,
): ChatMessage {
  const base: ChatMessage = {
    conversationId,
    createdAt,
    role: role === "assistant" ? "assistant" : "user",
    content,
  }

  if (!content.startsWith("{")) {
    return base
  }

  try {
    const parsed = JSON.parse(content) as
      | StoredMessagePayloadV1
      | StoredMessagePayloadV2
      | StoredMessagePayloadV3

    if (parsed.v === 3) {
      return {
        ...base,
        content: parsed.text ?? "",
        agentActivity: parsed.agentActivity,
        attachments: Array.isArray(parsed.attachments)
          ? parsed.attachments.map(toChatAttachment)
          : undefined,
      }
    }

    if (parsed.v === 2 && Array.isArray(parsed.attachments)) {
      return {
        ...base,
        content: parsed.text ?? "",
        attachments: parsed.attachments.map(toChatAttachment),
      }
    }

    if (parsed.v === 1 && "attachment" in parsed && parsed.attachment) {
      const legacy = parsed.attachment
      return {
        ...base,
        content: parsed.text ?? "",
        attachments: [
          toChatAttachment({
            id: crypto.randomUUID(),
            kind: legacy.kind,
            name: legacy.name,
            mimeType: legacy.mimeType,
            dataUrl: legacy.dataUrl,
          }),
        ],
      }
    }

    if ("text" in parsed && typeof parsed.text === "string") {
      return { ...base, content: parsed.text }
    }
  } catch {
    return base
  }

  return base
}
