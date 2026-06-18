"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { AssistantMessageCard } from "@/features/chat/components/AssistantMessageCard"
import { AssistantTypingIndicator } from "@/features/chat/components/AssistantTypingIndicator"
import { AttachmentPreviewGrid } from "@/features/chat/components/AttachmentPreviewGrid"
import { type ChatLoadingPhase, chatLoadingLabel } from "@/features/chat/lib/loading-status"
import { normalizeMessageAttachments } from "@/features/chat/lib/message-content"
import type { ChatMessage } from "@/features/chat/types"
import type { AgentActivityMeta } from "@/features/chat/types/agent-activity"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

type ChatMessageListProps = {
  messages: ChatMessage[]
  loadingPhase: ChatLoadingPhase
  liveAgentActivity?: AgentActivityMeta
}

function isAiResponding(phase: ChatLoadingPhase): boolean {
  return phase === "thinking" || phase === "streaming"
}

export function ChatMessageList({
  messages,
  loadingPhase,
  liveAgentActivity,
}: ChatMessageListProps) {
  const reducedMotion = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const loading = loadingPhase !== "idle"
  const responding = isAiResponding(loadingPhase)
  const statusLabel = chatLoadingLabel(loadingPhase)

  const lastMessage = messages[messages.length - 1]
  const awaitingAssistant = responding && lastMessage?.role === "user"

  const scrollTrigger = `${messages.length}:${lastMessage?.content?.length ?? 0}:${loadingPhase}:${awaitingAssistant}`

  // biome-ignore lint/correctness/useExhaustiveDependencies: rolar ao receber novos tokens ou mudar fase
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" })
  }, [scrollTrigger, reducedMotion])

  return (
    <div
      ref={scrollRef}
      className="custom-scrollbar flex h-full min-h-0 flex-1 flex-col overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-label="Mensagens da conversa"
      aria-busy={loading}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:px-6">
        <AnimatePresence initial={false} mode="sync">
          {messages.map((message, index) => {
            const attachments = normalizeMessageAttachments(message)
            const hasImages = attachments.some((a) => a.kind === "image")
            const isLast = index === messages.length - 1
            const isAssistantLive = responding && isLast && message.role === "assistant"
            const showCursor =
              isAssistantLive && loadingPhase === "streaming" && Boolean(message.content.trim())

            const assistantActivity = isAssistantLive
              ? (liveAgentActivity ?? message.agentActivity)
              : message.agentActivity

            const messageKey = `${message.conversationId ?? "c"}-${index}-${message.role}`
            const animateEntry = !reducedMotion && !isAssistantLive

            return (
              <motion.div
                key={messageKey}
                initial={animateEntry ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animateEntry ? 0.22 : 0, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "flex w-full",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" ? (
                  <AssistantMessageCard
                    message={message}
                    activity={assistantActivity}
                    live={isAssistantLive}
                    showCursor={showCursor}
                  />
                ) : (
                  <article
                    aria-label="Sua mensagem"
                    className={cn(
                      "max-w-[min(92%,100%)] rounded-2xl px-3 py-2.5 text-[15px] leading-relaxed sm:max-w-[85%] sm:px-4 sm:py-3",
                      "text-foreground bg-linear-to-r from-brand-purple to-brand-pink shadow-md shadow-black/10",
                      hasImages && "ring-1 ring-white/10",
                    )}
                  >
                    {attachments.length > 0 ? (
                      <AttachmentPreviewGrid
                        variant="message"
                        attachments={attachments}
                        className="mb-2"
                      />
                    ) : null}
                    <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
                  </article>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {awaitingAssistant ? (
          <div className="flex justify-start">
            <AssistantTypingIndicator
              label={statusLabel || "DocMind está preparando a resposta…"}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
