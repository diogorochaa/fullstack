"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { postMessage, requestDocumentUpload } from "@/features/chat/api"
import { serializeMessageForApi } from "@/features/chat/lib/message-content"
import type { ChatMessage } from "@/features/chat/types"
import { queryKeys } from "@/lib/query-keys"
import { toastSuccess } from "@/lib/toast"

export function useChatMutations(token: string | undefined) {
  const queryClient = useQueryClient()

  const invalidateMessages = () => {
    if (token) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages(token) })
    }
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!token) throw new Error("Sessão expirada. Faça login novamente.")
      return requestDocumentUpload(file, token)
    },
    onSuccess: () => {
      toastSuccess("Documento indexado com sucesso.")
      invalidateMessages()
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (message: ChatMessage) => {
      if (!token) throw new Error("Sessão expirada. Faça login novamente.")
      const conversationId = message.conversationId
      if (!conversationId) throw new Error("Conversa inválida.")
      const content = serializeMessageForApi(message)
      return postMessage(conversationId, message.role, content, token)
    },
    // Não invalidar aqui: refetch após só a mensagem do usuário sobrescreve o chat
    // com cache sem a resposta do assistente (resposta antiga / pergunta duplicada).
  })

  return {
    uploadMutation,
    sendMessageMutation,
    invalidateMessages,
  }
}
