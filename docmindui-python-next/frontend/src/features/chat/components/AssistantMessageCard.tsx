"use client"

import { ChevronDown, Copy, Info, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"

import { AppLogo } from "@/components/shared/AppLogo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMessageTimestamp, getReasoningText } from "@/features/chat/lib/agent-reasoning"
import type { ChatMessage } from "@/features/chat/types"
import type { AgentActivityMeta } from "@/features/chat/types/agent-activity"
import { cn } from "@/lib/utils"

type AssistantMessageCardProps = {
  message: ChatMessage
  activity?: AgentActivityMeta
  live?: boolean
  showCursor?: boolean
}

export function AssistantMessageCard({
  message,
  activity,
  live = false,
  showCursor = false,
}: AssistantMessageCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [reasoningOpen, setReasoningOpen] = useState(false)

  const showBaseTag =
    Boolean(activity?.knowledge_base_name) && (activity?.documents_in_base ?? 0) > 0
  const baseName = showBaseTag ? activity?.knowledge_base_name : undefined
  const reasoning = getReasoningText(activity)
  const hasSources = Boolean(activity?.sources?.length)
  const timestamp = formatMessageTimestamp(message.createdAt)
  const hasAnswer = Boolean(message.content.trim())
  const statusLine =
    activity?.status_message ??
    activity?.search_label ??
    "Estou buscando a melhor resposta para você…"
  const showReasoningToggle = Boolean(reasoning) && !live
  const showReasoningBlock = showReasoningToggle && reasoningOpen

  async function copyAnswer() {
    if (!message.content.trim()) return
    try {
      await navigator.clipboard.writeText(message.content)
      toast.success("Resposta copiada.")
    } catch {
      toast.error("Não foi possível copiar.")
    }
  }

  return (
    <div className="flex w-full max-w-3xl gap-3">
      <AppLogo size="sm" decorative className="mt-1 shrink-0 rounded-full shadow-none" />

      <div className="min-w-0 flex-1">
        {baseName ? (
          <Badge
            variant="secondary"
            className="mb-2 rounded-md border border-teal-500/35 bg-teal-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-300"
          >
            {baseName}
          </Badge>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-border/70 bg-card text-[15px] text-foreground shadow-sm">
          {hasSources && !live ? (
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 border-b border-border/50 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/30"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
            >
              <span className="inline-flex items-center gap-2">
                <Info className="h-4 w-4 text-teal-500" aria-hidden />
                Ver detalhes
              </span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", detailsOpen && "rotate-180")}
                aria-hidden
              />
            </button>
          ) : null}

          {detailsOpen && hasSources ? (
            <div className="border-b border-border/50 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
              <p className="mb-2 font-medium text-foreground/90">Fontes consultadas</p>
              <ul className="space-y-1">
                {activity?.sources?.map((source) => (
                  <li key={source.document_id}>
                    <span className="font-medium text-foreground/80">{source.titulo}</span>
                    {source.snippet ? (
                      <span className="block text-[11px] leading-snug">{source.snippet}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="px-4 py-4">
            {hasAnswer ? (
              <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-foreground">
                {message.content}
                {showCursor ? (
                  <span
                    className="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-px animate-pulse bg-brand-pink"
                    aria-hidden
                  />
                ) : null}
              </p>
            ) : live ? (
              <p className="text-sm text-muted-foreground">{statusLine}</p>
            ) : null}
          </div>

          {showReasoningToggle ? (
            <>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 border-t border-border/50 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/30"
                onClick={() => setReasoningOpen((v) => !v)}
                aria-expanded={reasoningOpen}
              >
                <span>
                  {reasoningOpen ? "Ocultar raciocínio completo" : "Ver raciocínio completo"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    reasoningOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>

              {showReasoningBlock ? (
                <div className="max-h-48 overflow-y-auto border-t border-border/40 bg-muted/15 px-4 py-3">
                  <div className="border-l-2 border-border/60 pl-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {reasoning}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-2 text-muted-foreground transition-opacity",
            live && !hasAnswer && "opacity-0 pointer-events-none",
          )}
        >
          {hasSources ? (
            <Badge variant="outline" className="rounded-md text-[10px] font-semibold uppercase">
              Fontes
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Copiar resposta"
            onClick={() => void copyAnswer()}
            disabled={!hasAnswer}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Útil">
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Não útil"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          {timestamp ? (
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">{timestamp}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
