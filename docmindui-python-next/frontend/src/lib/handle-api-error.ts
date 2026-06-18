import { mapFetchErrorToUserMessage } from "@/lib/api-error-message"
import { toastError } from "@/lib/toast"

export type HandleApiErrorOptions = {
  onUnauthorized?: () => void
  fallback?: string
  silent?: boolean
}

export function getErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado. Tente novamente.",
): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return mapFetchErrorToUserMessage(error) || fallback
}

export function handleApiError(error: unknown, options?: HandleApiErrorOptions): string {
  const message = getErrorMessage(error, options?.fallback)

  if (error instanceof Error) {
    const lower = message.toLowerCase()
    if (
      lower.includes("não autorizado") ||
      lower.includes("sessão expirada") ||
      lower.includes("token") ||
      lower.includes("401")
    ) {
      options?.onUnauthorized?.()
    }
  }

  if (!options?.silent) {
    toastError(message)
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[api-error]", error)
  }

  return message
}

export function isUnauthorizedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return (
    msg.includes("401") ||
    msg.includes("não autorizado") ||
    msg.includes("sessão") ||
    msg.includes("credenciais")
  )
}
