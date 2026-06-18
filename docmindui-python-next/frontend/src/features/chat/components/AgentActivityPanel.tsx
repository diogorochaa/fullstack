"use client"

import { ChevronDown, Sparkles } from "lucide-react"
import { useState } from "react"

import { type AgentActivityMeta, INTENT_LABELS } from "@/features/chat/types/agent-activity"
import { cn } from "@/lib/utils"

type AgentActivityPanelProps = {
  activity?: AgentActivityMeta
  live?: boolean
  className?: string
}

export function AgentActivityPanel({ activity, live = false, className }: AgentActivityPanelProps) {
  const [expanded, setExpanded] = useState(true)

  if (!activity && !live) return null

  const baseName = activity?.knowledge_base_name
  const searchLabel = activity?.search_label
  const statusMessage =
    activity?.status_message || (live ? "Estou buscando a melhor resposta para você…" : undefined)
  const steps = activity?.steps ?? []
  const stepCount = steps.length
  const currentStep = steps[steps.length - 1]
  const intentLabel = INTENT_LABELS[activity?.intent ?? ""] ?? "Processando"
  const showBaseTag =
    Boolean(baseName) &&
    (activity?.intent === "rag" || activity?.intent === "knowledge" || live || !activity?.intent)

  return (
    <div className={cn("mb-3 space-y-2", className)}>
      {showBaseTag ? (
        <span className="inline-flex max-w-full items-center rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-300">
          {baseName}
        </span>
      ) : null}

      <div className="rounded-xl border border-border/50 bg-card/60 px-3 py-2.5 text-xs shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand-pink" aria-hidden />
            {live && !activity?.intent ? "Acompanhando sua resposta" : intentLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            {stepCount > 0 ? `${stepCount} etapa${stepCount === 1 ? "" : "s"}` : null}
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", expanded ? "rotate-180" : "")}
              aria-hidden
            />
          </span>
        </button>

        {expanded ? (
          <div className="mt-2 space-y-2 border-l-2 border-border/60 pl-3">
            {searchLabel || currentStep ? (
              <div className="space-y-1 text-muted-foreground">
                {searchLabel ? (
                  <p>
                    <span className="text-foreground/90">Status atual:</span> {searchLabel}
                  </p>
                ) : null}
                {currentStep?.detail ? (
                  <p className="text-[11px] leading-relaxed">{currentStep.detail}</p>
                ) : currentStep?.label ? (
                  <p className="text-[11px]">{currentStep.label}</p>
                ) : null}
              </div>
            ) : live ? (
              <p className="text-muted-foreground">Classificando intenção e preparando consulta…</p>
            ) : null}

            {steps.length > 1 ? (
              <p className="text-[10px] text-muted-foreground">
                +{steps.length - 1} etapa{steps.length - 1 === 1 ? "" : "s"} anterior
                {steps.length - 1 === 1 ? "" : "es"}
              </p>
            ) : null}

            {activity?.sources && activity.sources.length > 0 ? (
              <div className="space-y-1 pt-1">
                <p className="font-medium text-foreground/80">Trechos encontrados</p>
                <ul className="space-y-0.5 text-[11px] text-muted-foreground">
                  {activity.sources.map((source) => (
                    <li key={source.document_id} className="truncate" title={source.snippet}>
                      {source.titulo}
                    </li>
                  ))}
                </ul>
              </div>
            ) : activity &&
              (activity.intent === "rag" || activity.intent === "knowledge") &&
              activity.documents_in_base === 0 ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Nenhum PDF nesta base. Envie o manual em Configurações e selecione a base correta.
              </p>
            ) : activity &&
              (activity.intent === "rag" || activity.intent === "knowledge") &&
              !activity.sources?.length ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Nenhum trecho correspondente. Confira se o PDF tem texto selecionável (não só
                imagem) e se foi indexado nesta base.
              </p>
            ) : null}
          </div>
        ) : null}

        {statusMessage ? (
          <p className="mt-2 text-[11px] text-muted-foreground">{statusMessage}</p>
        ) : null}
        {searchLabel && live ? (
          <p className="mt-0.5 text-[11px] text-teal-400/90">{searchLabel}</p>
        ) : null}
      </div>
    </div>
  )
}
