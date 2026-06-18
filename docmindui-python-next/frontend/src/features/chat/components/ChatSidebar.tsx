"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen,
  ChevronDown,
  Compass,
  LogOut,
  MessageSquare,
  MessageSquarePlus,
  Search,
  Settings,
  Trash2,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { AppLogo } from "@/components/shared/AppLogo"
import { ButtonWithTooltip } from "@/components/shared/ButtonWithTooltip"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { GradientButton } from "@/components/shared/GradientButton"
import { SidebarNavItem } from "@/components/shared/SidebarNavItem"
import { StatePanel } from "@/components/shared/StatePanel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { displayNameFromEmail, useAuth } from "@/features/auth/context"
import { KnowledgeBasesSidebar } from "@/features/chat/components/KnowledgeBasesSidebar"
import { filterConversationsByQuery } from "@/features/chat/lib/conversations"
import type { ChatConversation } from "@/features/chat/types"
import type { ApiStatus } from "@/features/system/hooks/useHealthQuery"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { cn } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings"

type ChatSidebarProps = {
  conversations: ChatConversation[]
  activeConversationId: string | null
  apiStatus: ApiStatus
  onNewConversation: () => Promise<void> | void
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => Promise<void> | void
  onClearAllConversations: () => Promise<void> | void
  onNavigate?: () => void
}

function ApiDot({ status }: { status: ApiStatus }) {
  const color =
    status === "connected"
      ? "bg-emerald-500"
      : status === "checking"
        ? "bg-amber-400"
        : "bg-red-500"
  const title =
    status === "connected"
      ? "API online"
      : status === "checking"
        ? "Verificando API..."
        : "API offline"
  return (
    <span
      title={title}
      role="img"
      aria-label={title}
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", color)}
    />
  )
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  apiStatus,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onClearAllConversations,
  onNavigate,
}: ChatSidebarProps) {
  const { session, logout } = useAuth()
  const router = useRouter()
  const openSettings = useSettingsStore((s) => s.openSettings)
  const [search, setSearch] = useState("")
  const [pendingDelete, setPendingDelete] = useState<{
    id: string
    title: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 250)

  const filtered = useMemo(
    () => filterConversationsByQuery(conversations, debouncedSearch),
    [conversations, debouncedSearch],
  )

  function handleLogout() {
    logout()
    onNavigate?.()
    router.push("/login")
    router.refresh()
  }

  const label = session ? displayNameFromEmail(session.email) : ""

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-sidebar">
      <div className="shrink-0 space-y-4 p-3">
        <div className="flex items-center gap-2 px-1">
          <AppLogo size="sm" decorative />
          <span className="text-sm font-semibold text-sidebar-foreground">DocMind</span>
        </div>

        <ButtonWithTooltip tooltip="Iniciar uma nova conversa" side="right">
          <GradientButton
            type="button"
            fullWidth
            size="lg"
            className="justify-start gap-3"
            aria-label="Iniciar uma nova conversa"
            onClick={() => void onNewConversation()}
          >
            <MessageSquarePlus className="h-5 w-5" />
            Nova conversa
          </GradientButton>
        </ButtonWithTooltip>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversas"
            className="h-11 border-border/60 bg-background/40 pl-9 text-sm"
            aria-label="Buscar conversas"
          />
        </div>

        <nav className="space-y-0.5" aria-label="Navegação principal">
          <SidebarNavItem
            icon={Settings}
            label="Configurações"
            onClick={() => {
              openSettings("knowledge")
              onNavigate?.()
            }}
          />
          <SidebarNavItem icon={BookOpen} label="Biblioteca" comingSoon />
          <SidebarNavItem icon={Compass} label="Explorar" comingSoon />
        </nav>
      </div>

      <KnowledgeBasesSidebar />

      <div className="px-3 pb-1">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Conversas recentes
        </p>
      </div>

      <ScrollArea className="h-0 min-h-0 flex-1 px-2 pr-1">
        {filtered.length === 0 ? (
          <StatePanel
            variant="empty"
            title={debouncedSearch ? "Nenhuma conversa encontrada" : "Sem conversas"}
            description={
              debouncedSearch ? "Tente outro termo de busca." : "Comece uma nova conversa acima."
            }
            className="py-6"
          />
        ) : (
          <div className="w-full min-w-0 space-y-0.5 pb-3">
            <AnimatePresence initial={false}>
              {filtered.map((conversation) => {
                const isActive = conversation.id === activeConversationId

                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "group grid w-full max-w-full grid-cols-[minmax(0,1fr)_2.25rem] items-center rounded-lg transition-colors",
                      isActive ? "glass-panel" : "hover:bg-accent/50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectConversation(conversation.id)
                        onNavigate?.()
                      }}
                      aria-label={`Abrir conversa: ${conversation.title}`}
                      aria-current={isActive ? "page" : undefined}
                      title={conversation.title}
                      className="flex min-w-0 cursor-pointer items-center gap-2 overflow-hidden py-2.5 pl-3 pr-1 text-left"
                    >
                      <MessageSquare
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="min-w-0 truncate text-sm text-foreground">
                        {conversation.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      title="Excluir conversa"
                      aria-label={`Excluir conversa: ${conversation.title}`}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center justify-self-end rounded-md",
                        "text-muted-foreground transition-colors",
                        "hover:bg-destructive/25 hover:text-destructive",
                        "group-hover:bg-destructive/20 group-hover:text-destructive",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingDelete({
                          id: conversation.id,
                          title: conversation.title,
                        })
                      }}
                    >
                      <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {session ? (
        <div className="mt-auto shrink-0 border-t border-border/50 p-3">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/50"
                    aria-label="Conta e menu do usuário"
                  >
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarFallback className="bg-brand-gradient text-xs font-medium text-white">
                        {(label.slice(0, 2) || session.email.slice(0, 2)).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{label}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                          DocMind
                        </Badge>
                        <ApiDot status={apiStatus} />
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Conta, status da API e opção de sair</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {session.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setClearAllOpen(true)
                  onNavigate?.()
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar todo o histórico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  openSettings("knowledge")
                  onNavigate?.()
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/perfil")
                  onNavigate?.()
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <ConfirmDialog
        open={clearAllOpen}
        onOpenChange={(open) => {
          if (!open && !clearingAll) setClearAllOpen(false)
        }}
        title="Limpar todo o histórico?"
        description="Todas as conversas e mensagens serão apagadas permanentemente. Essa ação não pode ser desfeita."
        confirmLabel="Limpar tudo"
        cancelLabel="Cancelar"
        destructive
        loading={clearingAll}
        onConfirm={async () => {
          setClearingAll(true)
          try {
            await onClearAllConversations()
            setClearAllOpen(false)
          } finally {
            setClearingAll(false)
          }
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null)
        }}
        title="Excluir conversa?"
        description={
          pendingDelete
            ? `Todas as mensagens de "${pendingDelete.title}" serão removidas do histórico. Essa ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive
        loading={deleting}
        onConfirm={async () => {
          if (!pendingDelete) return
          setDeleting(true)
          try {
            await onDeleteConversation(pendingDelete.id)
            setPendingDelete(null)
          } finally {
            setDeleting(false)
          }
        }}
      />
    </div>
  )
}
