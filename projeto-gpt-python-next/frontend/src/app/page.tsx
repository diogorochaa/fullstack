'use client'

import { AppShell, Box } from '@mantine/core'

import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { ChatComposer } from '@/features/chat/components/ChatComposer'
import { ChatHeader } from '@/features/chat/components/ChatHeader'
import { ChatMessageList } from '@/features/chat/components/ChatMessageList'
import { ChatSidebar } from '@/features/chat/components/ChatSidebar'
import { useChat } from '@/features/chat/hooks/useChat'
import { useApiStatus } from '@/features/system/hooks/useApiStatus'

export default function Home() {
  const {
    conversations,
    activeConversationId,
    messages,
    input,
    selectedFile,
    loading,
    setInput,
    setSelectedFile,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  } = useChat()
  const apiStatus = useApiStatus()

  return (
    <AuthGuard>
      <AppShell
        padding="md"
        navbar={{
          width: 320,
          breakpoint: 'sm',
        }}
        styles={{
          main: { backgroundColor: '#09090b' },
          navbar: { backgroundColor: '#09090b', borderInlineEnd: '1px solid #27272a' },
        }}
      >
        <AppShell.Navbar p="xs">
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNewConversation={createConversation}
            onSelectConversation={selectConversation}
            onDeleteConversation={deleteConversation}
          />
        </AppShell.Navbar>

        <AppShell.Main style={{ height: '100vh' }}>
          <ChatHeader apiStatus={apiStatus} />

          <Box style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 52px)' }}>
            <Box style={{ flex: 1, minHeight: 0 }}>
              <ChatMessageList messages={messages} loading={loading} />
            </Box>
            <ChatComposer
              input={input}
              selectedFile={selectedFile}
              loading={loading}
              onInputChange={setInput}
              onFileChange={setSelectedFile}
              onSendMessage={sendMessage}
            />
          </Box>
        </AppShell.Main>
      </AppShell>
    </AuthGuard>
  )
}
