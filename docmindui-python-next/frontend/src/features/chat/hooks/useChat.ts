"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"

import { useAuth } from "@/features/auth/context"
import type { AuthMeMessageRow } from "@/features/auth/types"
import {
  clearMessageHistory,
  deleteConversationHistory,
  requestAiAnswerStream,
} from "@/features/chat/api"
import type { PendingAttachmentFile } from "@/features/chat/components/AttachmentPreviewGrid"
import { useChatMutations } from "@/features/chat/hooks/useChatMutations"
import { useMessagesQuery } from "@/features/chat/hooks/useMessagesQuery"
import {
  isIndexablePdf,
  isVisionImage,
  MAX_ATTACHMENTS,
  MAX_FILE_BYTES,
} from "@/features/chat/lib/attachments"
import {
  conversationsToMessageRows,
  createConversation,
  getUserMessageContent,
  historyRowsToConversations,
  sortByNewest,
} from "@/features/chat/lib/conversations"
import type { ChatLoadingPhase } from "@/features/chat/lib/loading-status"
import { prepareOutgoingAttachments } from "@/features/chat/lib/prepare-attachments"
import { createStreamUpdateScheduler } from "@/features/chat/lib/stream-update"
import type { ChatConversation, ChatMessage } from "@/features/chat/types"
import type { AgentActivityMeta } from "@/features/chat/types/agent-activity"
import {
  knowledgeBasesWithDocuments,
  listKnowledgeBases,
} from "@/features/knowledge-bases/api/knowledge-bases-api"
import { handleApiError } from "@/lib/handle-api-error"
import { queryKeys } from "@/lib/query-keys"
import { usePreferencesStore } from "@/stores/preferences"

export function useChat() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { session, ready, prefetchedMessages, clearPrefetchedMessages, logout } = useAuth()
  const token = session?.accessToken
  const activeKnowledgeBaseId = usePreferencesStore((s) => s.activeKnowledgeBaseId)
  const setActiveKnowledgeBaseId = usePreferencesStore((s) => s.setActiveKnowledgeBaseId)
  const knowledgeBasesRevision = usePreferencesStore((s) => s.knowledgeBasesRevision)
  const [indexedBaseIds, setIndexedBaseIds] = useState<Set<string>>(new Set())

  const prefetchRef = useRef(prefetchedMessages)
  prefetchRef.current = prefetchedMessages

  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [pendingFiles, setPendingFiles] = useState<PendingAttachmentFile[]>([])
  const [loadingPhase, setLoadingPhase] = useState<ChatLoadingPhase>("idle")
  const [liveAgentActivity, setLiveAgentActivity] = useState<AgentActivityMeta | undefined>()
  const loading = loadingPhase !== "idle"
  const [initialized, setInitialized] = useState(false)
  const activeMessagesRef = useRef<ChatMessage[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: reinicializa conversas ao trocar sessão
  useEffect(() => {
    setInitialized(false)
  }, [token])

  const skipFetch = prefetchRef.current !== null
  const messagesQuery = useMessagesQuery(token, ready && Boolean(token) && !skipFetch)

  useEffect(() => {
    if (!token) {
      setIndexedBaseIds(new Set())
      return
    }
    void listKnowledgeBases(token)
      .then((items) => {
        const ids = new Set(knowledgeBasesWithDocuments(items).map((b) => b.id))
        setIndexedBaseIds(ids)
        const current = usePreferencesStore.getState().activeKnowledgeBaseId
        if (current && !ids.has(current)) {
          setActiveKnowledgeBaseId(null)
        }
      })
      .catch(() => setIndexedBaseIds(new Set()))
  }, [token, setActiveKnowledgeBaseId, knowledgeBasesRevision])
  const { sendMessageMutation } = useChatMutations(token)

  const historyLoading =
    ready && Boolean(token) && !initialized && (skipFetch || messagesQuery.isPending)

  const onUnauthorized = useCallback(() => {
    logout()
    router.push("/login")
  }, [logout, router])

  function upsertConversation(
    conversationId: string,
    messages: ChatMessage[],
    options?: { syncCache?: boolean },
  ) {
    setConversations((previous) => {
      const title = messages.find((m) => m.role === "user")?.content.slice(0, 40) || "Nova conversa"
      const exists = previous.some((conversation) => conversation.id === conversationId)

      const updated = sortByNewest(
        exists
          ? previous.map((conversation) => {
              if (conversation.id !== conversationId) return conversation
              return {
                ...conversation,
                title,
                updatedAt: new Date().toISOString(),
                messages,
              }
            })
          : [
              {
                id: conversationId,
                title,
                updatedAt: new Date().toISOString(),
                messages,
              },
              ...previous,
            ],
      )
      if (options?.syncCache) syncMessagesCache(updated)
      return updated
    })
  }

  useEffect(() => {
    if (!ready) return

    if (!token) {
      setConversations([])
      setActiveConversationId(null)
      setInput("")
      setPendingFiles([])
      setInitialized(true)
      return
    }

    const bootstrap = prefetchRef.current
    if (bootstrap !== null) {
      const loaded = historyRowsToConversations(bootstrap as AuthMeMessageRow[])
      setConversations(loaded)
      setActiveConversationId(loaded[0]?.id ?? null)
      clearPrefetchedMessages()
      if (token) {
        queryClient.setQueryData(queryKeys.messages(token), bootstrap)
      }
      setInitialized(true)
      return
    }

    if (messagesQuery.isSuccess && messagesQuery.data && !initialized) {
      if (loadingPhase !== "idle") {
        setInitialized(true)
        return
      }

      const loaded = historyRowsToConversations(messagesQuery.data)
      setConversations(loaded)
      setActiveConversationId((current) => {
        if (current && loaded.some((conversation) => conversation.id === current)) {
          return current
        }
        return loaded[0]?.id ?? null
      })
      setInitialized(true)
    }

    if (messagesQuery.isError) {
      handleApiError(messagesQuery.error, { onUnauthorized })
      const fallback = createConversation()
      setConversations([fallback])
      setActiveConversationId(fallback.id)
      setInitialized(true)
    }
  }, [
    ready,
    token,
    messagesQuery.isSuccess,
    messagesQuery.isError,
    messagesQuery.data,
    messagesQuery.error,
    initialized,
    loadingPhase,
    clearPrefetchedMessages,
    onUnauthorized,
  ])

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  )

  const messages = activeConversation?.messages ?? []
  activeMessagesRef.current = messages

  const syncMessagesCache = useCallback(
    (nextConversations: ChatConversation[]) => {
      if (!token) return
      queryClient.setQueryData(
        queryKeys.messages(token),
        conversationsToMessageRows(nextConversations),
      )
    },
    [queryClient, token],
  )

  function clearPendingFiles() {
    setPendingFiles([])
  }

  function addPendingFiles(files: FileList | File[]) {
    const incoming = Array.from(files)
    if (incoming.length === 0) return

    setPendingFiles((previous) => {
      const next = [...previous]
      for (const file of incoming) {
        if (next.length >= MAX_ATTACHMENTS) break
        if (file.size > MAX_FILE_BYTES) continue
        next.push({ id: crypto.randomUUID(), file })
      }
      return next
    })
  }

  function removePendingFile(id: string) {
    setPendingFiles((previous) => previous.filter((item) => item.id !== id))
  }

  async function createNewConversation() {
    const conversation = createConversation()
    setConversations((previous) => sortByNewest([conversation, ...previous]))
    setActiveConversationId(conversation.id)
    setInput("")
    clearPendingFiles()
  }

  function selectConversation(conversationId: string) {
    setActiveConversationId(conversationId)
  }

  async function clearAllConversations() {
    if (!token) return

    try {
      await clearMessageHistory(token)
    } catch (error) {
      handleApiError(error, { onUnauthorized, fallback: "Falha ao limpar o histórico." })
      return
    }

    const fresh = createConversation()
    setConversations([fresh])
    setActiveConversationId(fresh.id)
    setInput("")
    clearPendingFiles()
    syncMessagesCache([fresh])
  }

  async function deleteConversation(conversationId: string) {
    if (!token) return

    try {
      await deleteConversationHistory(conversationId, token)
    } catch (error) {
      handleApiError(error, { onUnauthorized, fallback: "Falha ao excluir a conversa." })
      return
    }

    setConversations((previous) => {
      const next = previous.filter((conversation) => conversation.id !== conversationId)

      let updated: ChatConversation[]
      if (activeConversationId === conversationId) {
        const fallbackConversation = next[0] ?? createConversation()
        setActiveConversationId(fallbackConversation.id)
        updated = next.length === 0 ? [fallbackConversation] : next
      } else {
        updated = next.length === 0 ? [createConversation()] : next
      }

      if (updated.length === 1 && updated[0].messages.length === 0) {
        setActiveConversationId(updated[0].id)
      }

      syncMessagesCache(updated)
      return updated
    })
  }

  async function sendMessage() {
    const question = input.trim()
    const files = pendingFiles.map((p) => p.file)
    if (!question && files.length === 0) return
    if (!token) return

    setInitialized(true)

    let conversationId = activeConversationId ?? ""
    if (
      !conversationId ||
      !conversations.some((conversation) => conversation.id === conversationId)
    ) {
      conversationId = createConversation().id
      setConversations((previous) =>
        sortByNewest([
          {
            id: conversationId,
            title: "Nova conversa",
            updatedAt: new Date().toISOString(),
            messages: [],
          },
          ...previous,
        ]),
      )
      setActiveConversationId(conversationId)
    }

    let prepared: Awaited<ReturnType<typeof prepareOutgoingAttachments>> | undefined
    try {
      prepared = files.length > 0 ? await prepareOutgoingAttachments(files) : undefined
    } catch (error) {
      handleApiError(error, { onUnauthorized, silent: false })
      return
    }

    const userMessage: ChatMessage = {
      conversationId,
      createdAt: new Date().toISOString(),
      role: "user",
      content: getUserMessageContent(question, files),
      attachments: prepared?.attachments,
    }

    const nextMessages = [...activeMessagesRef.current, userMessage]
    const turnBaseRef = { current: nextMessages }
    upsertConversation(conversationId, nextMessages)
    if (activeConversationId !== conversationId) {
      setActiveConversationId(conversationId)
    }

    setInput("")
    clearPendingFiles()

    const hasPdf = files.some(isIndexablePdf)
    const hasImage = files.some(isVisionImage)
    if (hasPdf) {
      toast.info("Envie PDFs em Configurações para indexar na base de conhecimento.")
    }
    setLoadingPhase(hasImage ? "analyzing" : "saving")

    try {
      if (prepared && prepared.visionImages.length > 0) {
        setLoadingPhase("analyzing")
      }

      setLoadingPhase("saving")
      await sendMessageMutation.mutateAsync({ ...userMessage, conversationId })

      const shouldAskAi = Boolean(
        question ||
          (prepared && prepared.visionImages.length > 0) ||
          prepared?.attachmentContext.trim(),
      )

      if (shouldAskAi) {
        setLiveAgentActivity(undefined)
        setLoadingPhase("thinking")

        const assistantDraft: ChatMessage = {
          conversationId,
          createdAt: new Date().toISOString(),
          role: "assistant",
          content: "",
        }

        let latestActivity: AgentActivityMeta | undefined
        let assistantVisible = false

        const upsertAssistantDraft = (content: string) => {
          const draft: ChatMessage = {
            ...assistantDraft,
            content,
            agentActivity: latestActivity,
          }
          assistantVisible = true
          upsertConversation(conversationId, [...turnBaseRef.current, draft])
        }

        const streamContent = createStreamUpdateScheduler<string>((fullText) => {
          setLoadingPhase("streaming")
          upsertAssistantDraft(fullText)
        })

        const answer = await requestAiAnswerStream({
          question: question.trim(),
          conversationId,
          token,
          knowledgeBaseId:
            activeKnowledgeBaseId && indexedBaseIds.has(activeKnowledgeBaseId)
              ? activeKnowledgeBaseId
              : undefined,
          images: prepared?.visionImages.map((img) => ({
            base64: img.base64,
            media_type: img.mediaType,
          })),
          attachmentContext: prepared?.attachmentContext,
          onActivity: (activity) => {
            latestActivity = activity
            setLiveAgentActivity(activity)
            if (!assistantVisible) {
              upsertAssistantDraft("")
            }
          },
          onChunk: (_delta, fullText) => {
            streamContent.schedule(fullText)
          },
        })

        streamContent.flushNow(answer)

        const finalAssistant: ChatMessage = {
          ...assistantDraft,
          content: answer,
          agentActivity: latestActivity,
        }
        const saved = await sendMessageMutation.mutateAsync({
          ...finalAssistant,
          conversationId,
        })
        const persisted: ChatMessage = {
          ...finalAssistant,
          createdAt: saved.created_at,
        }
        const finalMessages = [...turnBaseRef.current, persisted]
        upsertConversation(conversationId, finalMessages, { syncCache: true })
        setLiveAgentActivity(undefined)
      } else {
        upsertConversation(conversationId, turnBaseRef.current, { syncCache: true })
      }
    } catch (error) {
      const message = handleApiError(error, { onUnauthorized, silent: false })
      upsertConversation(conversationId, [
        ...nextMessages,
        {
          conversationId,
          createdAt: new Date().toISOString(),
          role: "assistant",
          content: message,
        },
      ])
    } finally {
      setLoadingPhase("idle")
    }
  }

  return {
    conversations,
    activeConversationId,
    messages,
    input,
    pendingFiles,
    loading,
    loadingPhase,
    liveAgentActivity,
    historyLoading,
    setInput,
    addPendingFiles,
    removePendingFile,
    createConversation: createNewConversation,
    selectConversation,
    deleteConversation,
    clearAllConversations,
    sendMessage,
  }
}
