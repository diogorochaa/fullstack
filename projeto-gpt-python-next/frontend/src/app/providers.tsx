'use client'

import { MantineProvider } from '@mantine/core'

import { AuthProvider } from '@/features/auth/context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="dark">
      <AuthProvider>{children}</AuthProvider>
    </MantineProvider>
  )
}
