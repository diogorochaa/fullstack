"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer } from "react-toastify"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/features/auth/context"
import { getQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </TooltipProvider>
        <ToastContainer
          theme="dark"
          position="top-right"
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          limit={4}
          aria-label="Notificações"
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
