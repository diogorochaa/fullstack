import { router } from '@/app/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

type AppProvidersProps = {
  children?: ReactNode
}

export function clearAppQueryCache() {
  queryClient.clear()
}

export function AppProviders({ children }: AppProvidersProps) {
  if (children) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
