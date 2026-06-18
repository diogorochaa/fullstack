"use client"

import { motion } from "framer-motion"
import { ChevronDown, Menu, Sparkles } from "lucide-react"

import { ButtonWithTooltip } from "@/components/shared/ButtonWithTooltip"
import { GradientButton } from "@/components/shared/GradientButton"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type ChatHeaderProps = {
  sidebarOpen?: boolean
  isDesktop?: boolean
  onMenuClick?: () => void
}

function menuTooltip(sidebarOpen: boolean, isDesktop: boolean): string {
  if (isDesktop) {
    return sidebarOpen ? "Recolher barra lateral" : "Expandir barra lateral"
  }
  return sidebarOpen ? "Fechar menu de conversas" : "Abrir menu de conversas"
}

export function ChatHeader({
  sidebarOpen = false,
  isDesktop = true,
  onMenuClick,
}: ChatHeaderProps) {
  const menuLabel = menuTooltip(sidebarOpen, isDesktop)

  return (
    <motion.header
      layout
      className="flex shrink-0 items-center justify-between gap-1.5 border-b border-border/50 px-safe py-2 pt-safe sm:gap-2 sm:px-3 md:px-4"
      transition={{ duration: 0.2 }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <ButtonWithTooltip tooltip={menuLabel} side="bottom">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={menuLabel}
            aria-controls="app-sidebar"
            aria-expanded={sidebarOpen}
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
        </ButtonWithTooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex max-w-[min(100%,10rem)] cursor-pointer items-center gap-1 truncate rounded-lg px-1.5 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-accent sm:max-w-none sm:px-2"
                  aria-label="Selecionar modelo de IA"
                >
                  DocMind
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Selecionar modelo de IA</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem disabled>DocMind RAG (ativo)</DropdownMenuItem>
            <DropdownMenuItem disabled>Outros modelos — em breve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <span className="hidden shrink-0 sm:inline-flex">
            <GradientButton size="sm" disabled className="pointer-events-none opacity-80">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              DocMind
            </GradientButton>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">Assistente com RAG sobre seus documentos</TooltipContent>
      </Tooltip>
    </motion.header>
  )
}
