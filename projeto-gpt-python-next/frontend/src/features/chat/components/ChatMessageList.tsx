import { Group, Paper, ScrollArea, Stack, Text, ThemeIcon } from '@mantine/core'
import { File, FileImage, FileText } from 'lucide-react'

import type { ChatMessage } from '@/types/chat'

type ChatMessageListProps = {
  messages: ChatMessage[]
  loading: boolean
}

export function ChatMessageList({ messages, loading }: ChatMessageListProps) {
  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{
        height: '100%',
        borderColor: '#27272a',
        backgroundColor: 'rgba(24, 24, 27, 0.7)',
      }}
    >
      <ScrollArea h="100%" className="custom-scrollbar" type="hover" scrollbarSize={8}>
        <Stack gap="sm">
          {messages.map((message, index) => (
          <Paper
            key={`${message.role}-${index}`}
            p="md"
            radius="xl"
            ml={message.role === 'user' ? 'auto' : 0}
            mr={message.role === 'assistant' ? 'auto' : 0}
            maw="90%"
            bg={message.role === 'user' ? '#f4f4f5' : '#27272a'}
            c={message.role === 'user' ? '#18181b' : '#f4f4f5'}
          >
              {message.attachment && (
                <Paper
                  p="xs"
                  radius="md"
                  mb={message.content ? 'xs' : 0}
                  bg={
                    message.attachment.kind === 'pdf'
                      ? '#ffe3e3'
                      : message.attachment.kind === 'image'
                        ? '#dbeafe'
                        : '#e4e4e7'
                  }
                >
                  <Group gap="xs" wrap="nowrap">
                    <ThemeIcon
                      size="sm"
                      variant="filled"
                      color={
                        message.attachment.kind === 'pdf'
                          ? 'red'
                          : message.attachment.kind === 'image'
                            ? 'blue'
                            : 'gray'
                      }
                    >
                      {message.attachment.kind === 'pdf' ? (
                        <FileText size={14} />
                      ) : message.attachment.kind === 'image' ? (
                        <FileImage size={14} />
                      ) : (
                        <File size={14} />
                      )}
                    </ThemeIcon>
                    <Text
                      size="xs"
                      fw={600}
                      c={message.role === 'user' ? '#18181b' : '#1f2937'}
                      truncate
                    >
                      {message.attachment.name}
                    </Text>
                  </Group>
                </Paper>
              )}
              {message.content && <Text size="sm">{message.content}</Text>}
          </Paper>
          ))}

          {loading && (
            <Text size="sm" c="dimmed">
              IA esta pensando...
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  )
}
