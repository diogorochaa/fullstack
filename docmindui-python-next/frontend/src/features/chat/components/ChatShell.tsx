"use client"

import { useEffect, useState } from "react"
import { PageTransition } from "@/components/shared/PageTransition"
import { StatePanel } from "@/components/shared/StatePanel"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthGuard } from "@/features/auth/components/AuthGuard"
import { ChatComposer } from "@/features/chat/components/ChatComposer"
import { ChatHeader } from "@/features/chat/components/ChatHeader"
import { ChatHero } from "@/features/chat/components/ChatHero"
import { ChatMessageList } from "@/features/chat/components/ChatMessageList"
import { ChatQuickActions } from "@/features/chat/components/ChatQuickActions"
import { ChatSidebar } from "@/features/chat/components/ChatSidebar"
import { useChat } from "@/features/chat/hooks/useChat"
import { SettingsModal } from "@/features/settings/components/SettingsModal"
import { useHealthQuery } from "@/features/system/hooks/useHealthQuery"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { usePreferencesStore } from "@/stores/preferences"

export function ChatShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const sidebarCollapsed = usePreferencesStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = usePreferencesStore((s) => s.toggleSidebarCollapsed)
  const isDesktop = useIsDesktop()

  const sidebarOpen = isDesktop ? !sidebarCollapsed : mobileSidebarOpen

  useEffect(() => {
    if (isDesktop) {
      setMobileSidebarOpen(false)
    }
  }, [isDesktop])

  function handleMenuClick() {
    if (isDesktop) {
      toggleSidebarCollapsed()
      return
    }
    setMobileSidebarOpen((open) => !open)
  }
  const { status: apiStatus } = useHealthQuery()

  const {
    conversations,
    activeConversationId,
    messages,
    input,
    pendingFiles,
    loadingPhase,
    liveAgentActivity,
    historyLoading,
    setInput,
    addPendingFiles,
    removePendingFile,
    createConversation,
    selectConversation,
    deleteConversation,
    clearAllConversations,
    sendMessage,
  } = useChat()

  const isEmptyThread = messages.length === 0 && loadingPhase === "idle"

  const sidebar = (
    <ChatSidebar
      conversations={conversations}
      activeConversationId={activeConversationId}
      apiStatus={apiStatus}
      onNewConversation={createConversation}
      onSelectConversation={selectConversation}
      onDeleteConversation={deleteConversation}
      onClearAllConversations={clearAllConversations}
      onNavigate={() => setMobileSidebarOpen(false)}
    />
  )

  return (
    <AuthGuard>
      <TooltipProvider>
        <PageTransition className="relative flex h-full min-h-0 w-full flex-row overflow-hidden bg-background">
          <div className="chat-ambient-glow" aria-hidden />

          <aside
            id="app-sidebar"
            aria-label="Barra lateral"
            aria-hidden={isDesktop ? sidebarCollapsed : true}
            className={cn(
              "hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border/50 bg-sidebar transition-[width] duration-200 md:flex",
              sidebarCollapsed ? "w-0 border-r-0" : "w-sidebar",
            )}
          >
            {!sidebarCollapsed ? (
              <div className="flex h-full min-h-0 w-full flex-col">{sidebar}</div>
            ) : null}
          </aside>

          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetContent
              side="left"
              className="flex h-dvh-screen flex-col overflow-hidden p-0 md:hidden"
            >
              <div className="flex h-full min-h-0 w-full flex-col">{sidebar}</div>
            </SheetContent>
          </Sheet>

          <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <ChatHeader
              sidebarOpen={sidebarOpen}
              isDesktop={isDesktop}
              onMenuClick={handleMenuClick}
            />

            {isEmptyThread ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex flex-1 flex-col items-center justify-center px-3 pt-2 sm:px-4 sm:pt-4">
                  <ChatHero />
                </div>
                <div className="shrink-0 space-y-4 px-2 pb-safe sm:space-y-6 sm:pb-8">
                  <ChatComposer
                    variant="hero"
                    input={input}
                    pendingFiles={pendingFiles}
                    loadingPhase={loadingPhase}
                    onInputChange={setInput}
                    onAddFiles={addPendingFiles}
                    onRemovePending={removePendingFile}
                    onSendMessage={sendMessage}
                  />
                  <ChatQuickActions onPick={(prompt) => setInput(prompt)} />
                </div>
                <p className="px-3 pb-4 text-center text-xs text-muted-foreground sm:px-0">
                  O DocMind pode cometer erros. Verifique informações importantes.
                </p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ChatMessageList
                    messages={messages}
                    loadingPhase={loadingPhase}
                    liveAgentActivity={liveAgentActivity}
                  />
                </div>
                <div className="shrink-0">
                  <ChatComposer
                    variant="thread"
                    input={input}
                    pendingFiles={pendingFiles}
                    loadingPhase={loadingPhase}
                    onInputChange={setInput}
                    onAddFiles={addPendingFiles}
                    onRemovePending={removePendingFile}
                    onSendMessage={sendMessage}
                  />
                </div>
              </div>
            )}
          </main>

          {historyLoading ? (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm"
              aria-busy="true"
            >
              <StatePanel
                variant="loading"
                title="Carregando seu histórico…"
                description="Estamos sincronizando suas conversas."
              />
            </div>
          ) : null}
        </PageTransition>
        <SettingsModal />
      </TooltipProvider>
    </AuthGuard>
  )
}
