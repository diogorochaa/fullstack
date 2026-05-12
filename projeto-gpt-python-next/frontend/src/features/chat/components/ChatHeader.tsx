'use client'

import { ActionIcon, Avatar, Group, Menu, Text } from '@mantine/core'
import { LogOut, MoreVertical, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { displayNameFromEmail, useAuth } from '@/features/auth/context'
import { ApiStatusBadge } from '@/features/system/components/ApiStatusBadge'
import type { ApiStatus } from '@/features/system/hooks/useApiStatus'

type ChatHeaderProps = {
  apiStatus: ApiStatus
}

export function ChatHeader({ apiStatus }: ChatHeaderProps) {
  const { session, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/login')
    router.refresh()
  }

  const label = session ? displayNameFromEmail(session.email) : ''

  return (
    <Group justify="space-between" mb="md" wrap="nowrap">
      <Text fw={700} size="xl" c="gray.0">
        DocMind AI
      </Text>
      <Group gap="sm" wrap="nowrap">
        {session && (
          <Group gap={6} wrap="nowrap" visibleFrom="sm">
            <Avatar size="sm" radius="xl" color="gray.6">
              <User size={14} />
            </Avatar>
            <Text size="sm" c="dimmed" truncate maw={200} title={session.email}>
              {label}
            </Text>
          </Group>
        )}
        <ApiStatusBadge status={apiStatus} />
        {session && (
          <Menu position="bottom-end" shadow="md" width={220}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Menu da conta">
                <MoreVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label tt="none">{session.email}</Menu.Label>
              <Menu.Item leftSection={<LogOut size={14} />} onClick={handleLogout}>
                Sair
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Group>
  )
}
