"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { BookOpen, Code2, FileText, Lightbulb, MessageCircle, PenLine } from "lucide-react"

import { ButtonWithTooltip } from "@/components/shared/ButtonWithTooltip"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { hoverLift, staggerContainer } from "@/lib/motion-variants"
import { cn } from "@/lib/utils"

const items: { icon: LucideIcon; label: string; prompt: string; hint: string }[] = [
  {
    icon: FileText,
    label: "Resumo de PDF",
    prompt: "Faça um resumo objetivo do documento indexado sobre: ",
    hint: "Inserir pedido de resumo do documento indexado",
  },
  {
    icon: Lightbulb,
    label: "Dar ideias",
    prompt: "Sugira ideias criativas para: ",
    hint: "Inserir pedido de ideias e sugestões",
  },
  {
    icon: Code2,
    label: "Programação",
    prompt: "Ajude com código relacionado a: ",
    hint: "Inserir pedido de ajuda com código",
  },
  {
    icon: PenLine,
    label: "Escrever ou editar",
    prompt: "Ajude-me a escrever ou revisar: ",
    hint: "Inserir pedido de escrita ou revisão de texto",
  },
  {
    icon: BookOpen,
    label: "Explicar conceito",
    prompt: "Explique de forma clara e didática: ",
    hint: "Inserir pedido de explicação didática",
  },
  {
    icon: MessageCircle,
    label: "Perguntar ao documento",
    prompt: "Com base nos documentos indexados, responda: ",
    hint: "Inserir pergunta sobre os documentos indexados",
  },
]

type ChatQuickActionsProps = {
  onPick: (prompt: string) => void
}

export function ChatQuickActions({ onPick }: ChatQuickActionsProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-2 px-2 sm:grid-cols-2"
    >
      {items.map(({ icon: Icon, label, prompt, hint }) => (
        <ButtonWithTooltip key={label} tooltip={hint} side="top">
          <motion.button
            type="button"
            variants={{
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
            }}
            {...(reducedMotion ? {} : hoverLift)}
            className={cn(
              "glass-panel flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-foreground transition-colors",
              "hover:border-brand-pink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label={hint}
            onClick={() => onPick(prompt)}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span>{label}</span>
          </motion.button>
        </ButtonWithTooltip>
      ))}
    </motion.div>
  )
}
