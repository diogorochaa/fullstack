'use client'

import {
  ActionIcon,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'
import { MessageSquarePlus, Trash2 } from 'lucide-react'

import type { ChatConversation } from '@/types/chat'

type ChatSidebarProps = {
  conversations: ChatConversation[]
  activeConversationId: string | null
  onNewConversation: () => Promise<void> | void
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => Promise<void> | void
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  return (
    <Stack h="100%" gap="sm">
      <Button
        leftSection={<MessageSquarePlus size={16} />}
        onClick={onNewConversation}
        variant="light"
        fullWidth
      >
        Nova conversa
      </Button>

      <ScrollArea className="custom-scrollbar" type="hover" scrollbarSize={8} flex={1}>
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId

          return (
            <Paper
              key={conversation.id}
              withBorder
              p="xs"
              mt="xs"
              className="group"
              bg={isActive ? 'dark.6' : 'dark.8'}
              style={{ borderColor: isActive ? '#52525b' : '#18181b' }}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <UnstyledButton
                  onClick={() => onSelectConversation(conversation.id)}
                  style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
                >
                  <Text lineClamp={1} size="sm" fw={500}>
                    {conversation.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(conversation.updatedAt).toLocaleString('pt-BR')}
                  </Text>
                </UnstyledButton>

                <ActionIcon
                  aria-label="Apagar conversa"
                  title="Apagar conversa"
                  onClick={() => onDeleteConversation(conversation.id)}
                  variant="subtle"
                  color="gray"
                  className="opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </ActionIcon>
              </Group>
            </Paper>
          )
        })}
      </ScrollArea>
    </Stack>
  )
}
