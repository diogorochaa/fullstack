"use client"

import { motion } from "framer-motion"
import { ArrowUp, Globe, Loader2, Paperclip, SlidersHorizontal } from "lucide-react"
import { useId, useRef } from "react"

import { GradientButton } from "@/components/shared/GradientButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AttachmentPreviewGrid,
  type PendingAttachmentFile,
} from "@/features/chat/components/AttachmentPreviewGrid"
import { CHAT_FILE_ACCEPT, MAX_ATTACHMENTS } from "@/features/chat/lib/attachments"
import {
  type ChatLoadingPhase,
  chatComposerPlaceholder,
  chatLoadingLabel,
} from "@/features/chat/lib/loading-status"
import { cn } from "@/lib/utils"

type ChatComposerProps = {
  variant: "hero" | "thread"
  input: string
  pendingFiles: PendingAttachmentFile[]
  loadingPhase: ChatLoadingPhase
  onInputChange: (value: string) => void
  onAddFiles: (files: FileList | File[]) => void
  onRemovePending: (id: string) => void
  onSendMessage: () => Promise<void> | void
}

const iconButtonClass =
  "h-11 w-11 shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"

export function ChatComposer({
  variant,
  input,
  pendingFiles,
  loadingPhase,
  onInputChange,
  onAddFiles,
  onRemovePending,
  onSendMessage,
}: ChatComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const attachmentsHintId = useId()
  const loading = loadingPhase !== "idle"
  const statusText = chatLoadingLabel(loadingPhase)
  const canAttachMore = pendingFiles.length < MAX_ATTACHMENTS
  const hasContent = Boolean(input.trim()) || pendingFiles.length > 0
  const sendTooltip = loading
    ? "Processando…"
    : !hasContent
      ? "Digite uma mensagem ou anexe um arquivo"
      : "Enviar mensagem"

  const shell = cn(
    "relative flex w-full flex-col gap-0 rounded-2xl p-[1px] shadow-soft",
    "bg-linear-to-r from-[var(--color-brand-purple)] via-[var(--color-brand-pink)] to-[var(--color-brand-orange)]",
    variant === "hero" && "max-w-2xl",
    variant === "thread" && "max-w-3xl",
  )

  const inner = cn(
    "flex w-full items-end gap-1 rounded-[calc(var(--radius-2xl)-1px)] glass-panel p-2 pl-2.5 sm:pl-3",
  )

  return (
    <motion.div
      layout
      className={cn(
        "w-full",
        variant === "thread" &&
          "border-t border-border/50 bg-background/80 pt-2 backdrop-blur-sm sm:pt-3",
      )}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      aria-busy={loading}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-2",
          variant === "thread" && "px-safe pb-safe sm:px-3 md:px-6 md:pb-4",
        )}
      >
        {statusText ? (
          <p
            className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 px-2 text-center text-xs text-muted-foreground sm:text-sm"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-pink" aria-hidden />
            {statusText}
          </p>
        ) : null}

        <div className={cn("mx-auto flex w-full justify-center", variant === "hero" && "px-2")}>
          <div className={shell}>
            <div className={inner}>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={CHAT_FILE_ACCEPT}
                className="sr-only"
                disabled={loading || !canAttachMore}
                aria-describedby={pendingFiles.length > 0 ? attachmentsHintId : undefined}
                onChange={(e) => {
                  if (e.target.files?.length) {
                    onAddFiles(e.target.files)
                  }
                  e.target.value = ""
                }}
              />

              <div className="flex shrink-0 items-center gap-0.5 pb-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={iconButtonClass}
                      disabled={loading || !canAttachMore}
                      aria-label={
                        canAttachMore
                          ? `Anexar arquivos (até ${MAX_ATTACHMENTS} por mensagem)`
                          : `Limite de ${MAX_ATTACHMENTS} anexos atingido`
                      }
                      onClick={() => fileRef.current?.click()}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {canAttachMore
                      ? "Anexar imagens, PDF, documentos e mais"
                      : `Máximo de ${MAX_ATTACHMENTS} anexos`}
                  </TooltipContent>
                </Tooltip>

                <div className="hidden items-center gap-0.5 sm:flex">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(iconButtonClass, "opacity-50")}
                        disabled
                        aria-label="Pesquisa na web — em breve"
                      >
                        <Globe className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Pesquisa na web (em breve)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(iconButtonClass, "opacity-50")}
                        disabled
                        aria-label="Configurações do chat — em breve"
                      >
                        <SlidersHorizontal className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Configurações (em breve)</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Input
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={chatComposerPlaceholder(loadingPhase)}
                aria-label="Mensagem para o DocMind"
                aria-describedby={pendingFiles.length > 0 ? attachmentsHintId : undefined}
                className="min-h-11 min-w-0 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 sm:text-[15px]"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void onSendMessage()
                  }
                }}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <GradientButton
                    type="button"
                    size="icon"
                    className="mb-0.5 h-11 w-11 shrink-0"
                    disabled={loading || !hasContent}
                    aria-label={loading ? "Aguarde…" : "Enviar mensagem"}
                    onClick={() => void onSendMessage()}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </GradientButton>
                </TooltipTrigger>
                <TooltipContent side="top">{sendTooltip}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {pendingFiles.length > 0 ? (
          <div id={attachmentsHintId} className="mx-auto w-full max-w-3xl px-2" aria-live="polite">
            <AttachmentPreviewGrid
              variant="composer"
              pending={pendingFiles}
              onRemovePending={onRemovePending}
            />
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
