import { HttpError } from '@/services/http/client'
import { z } from 'zod'

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  timestamp: z.string().optional(),
})

export type ParsedApiError = z.infer<typeof apiErrorSchema>

export type ErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'SERVER'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION'
  | 'UNKNOWN'

export type ErrorContext = 'api' | 'ia' | 'auth'

export type AppErrorDetails = {
  code: ErrorCode
  title: string
  message: string
  retryable: boolean
}

const statusFallbacks: Record<number, { title: string; message: string }> = {
  400: {
    title: 'Dados inválidos',
    message: 'Verifique os campos e tente novamente.',
  },
  401: {
    title: 'Sessão expirada',
    message: 'Faça login novamente para continuar.',
  },
  403: {
    title: 'Acesso negado',
    message: 'Você não tem permissão para esta ação.',
  },
  404: {
    title: 'Não encontrado',
    message: 'O recurso solicitado não existe ou foi removido.',
  },
  409: {
    title: 'Conflito',
    message: 'Este registro já existe. Tente com outros dados.',
  },
  422: {
    title: 'Dados inválidos',
    message: 'Não foi possível processar os dados enviados.',
  },
  500: {
    title: 'Erro no servidor',
    message: 'Algo deu errado do nosso lado. Tente em instantes.',
  },
  502: {
    title: 'Serviço indisponível',
    message: 'O servidor não respondeu. Tente novamente em breve.',
  },
  503: {
    title: 'Serviço em manutenção',
    message: 'Estamos com instabilidade. Tente novamente em breve.',
  },
}

const NETWORK_PATTERNS = [
  'failed to fetch',
  'networkerror',
  'network request failed',
  'load failed',
  'err_connection_refused',
  'econnrefused',
]

const contextNetworkMessages: Record<
  ErrorContext,
  { title: string; message: string }
> = {
  ia: {
    title: 'Assistente indisponível',
    message:
      'Não conseguimos conectar ao assistente. Verifique se o serviço de IA está rodando (porta 8100) e tente de novo.',
  },
  api: {
    title: 'Loja indisponível',
    message:
      'Não foi possível carregar os dados. Verifique sua internet ou se a API está rodando (porta 3000).',
  },
  auth: {
    title: 'Sem conexão',
    message:
      'Não foi possível entrar agora. Verifique sua conexão e tente novamente.',
  },
}

function formatMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join('. ') : message
}

function isNetworkError(error: Error): boolean {
  const normalized = `${error.name} ${error.message}`.toLowerCase()
  return NETWORK_PATTERNS.some((pattern) => normalized.includes(pattern))
}

const ENGLISH_MESSAGE_MAP: Record<string, string> = {
  'Invalid email or password': 'E-mail ou senha inválidos',
  'invalid email or password': 'E-mail ou senha inválidos',
  Unauthorized: 'Não autorizado',
  'Forbidden resource': 'Acesso negado',
}

function mapHttpStatus(status: number): ErrorCode {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 404) return 'NOT_FOUND'
  if (status >= 400 && status < 500) return 'VALIDATION'
  if (status >= 500) return 'SERVER'
  return 'UNKNOWN'
}

function translateMessage(message: string): string {
  return (
    ENGLISH_MESSAGE_MAP[message] ??
    ENGLISH_MESSAGE_MAP[message.toLowerCase()] ??
    message
  )
}

function resolveAuthTitle(
  status: number,
  message: string,
  context: ErrorContext,
): string {
  if (status === 401 && contextMatchesCredentials(message)) {
    return 'Falha no login'
  }
  if (status === 401 && context === 'auth') {
    return 'Falha na autenticação'
  }
  return statusFallbacks[status]?.title ?? 'Erro na requisição'
}

function contextMatchesCredentials(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('e-mail ou senha') ||
    normalized.includes('invalid email or password') ||
    normalized.includes('credencial')
  )
}

export function parseAppError(
  error: unknown,
  context: ErrorContext = 'api',
): AppErrorDetails {
  if (error instanceof HttpError) {
    const parsed = apiErrorSchema.safeParse(error.data)
    const fallback = statusFallbacks[error.status] ?? {
      title: 'Erro na requisição',
      message: `Ocorreu um problema (código ${error.status}).`,
    }

    if (parsed.success) {
      const rawMessage = formatMessage(parsed.data.message)
      const message = translateMessage(rawMessage)
      const title =
        context === 'auth'
          ? resolveAuthTitle(error.status, message, context)
          : fallback.title

      return {
        code: mapHttpStatus(error.status),
        title,
        message,
        retryable: error.status >= 500 || error.status === 408,
      }
    }

    const message = translateMessage(error.message || fallback.message)
    const title =
      context === 'auth'
        ? resolveAuthTitle(error.status, message, context)
        : fallback.title

    return {
      code: mapHttpStatus(error.status),
      title,
      message,
      retryable: error.status >= 500,
    }
  }

  if (error instanceof Error) {
    if (isNetworkError(error)) {
      const copy = contextNetworkMessages[context]
      return {
        code: 'NETWORK',
        title: copy.title,
        message: copy.message,
        retryable: true,
      }
    }

    if (context === 'ia') {
      if (
        error.message.includes('/chat/admin') ||
        error.message.toLowerCase().includes('not found')
      ) {
        return {
          code: 'NOT_FOUND',
          title: 'IA desatualizada',
          message:
            'O serviço de IA em execução não tem o endpoint de análise admin. Reconstrua o container Docker da IA ou rode localmente com make dev na pasta ecommerce-ia.',
          retryable: true,
        }
      }

      if (error.message.includes('Resposta inválida')) {
        return {
          code: 'SERVER',
          title: 'Resposta inesperada',
          message:
            'O assistente retornou dados inválidos. Tente reformular sua pergunta.',
          retryable: true,
        }
      }

      return {
        code: 'UNKNOWN',
        title: 'Erro no assistente',
        message: error.message || 'Não foi possível obter uma resposta agora.',
        retryable: true,
      }
    }

    return {
      code: 'UNKNOWN',
      title: 'Algo deu errado',
      message: error.message || 'Tente novamente em instantes.',
      retryable: true,
    }
  }

  return {
    code: 'UNKNOWN',
    title: 'Erro inesperado',
    message: 'Ocorreu um problema. Tente novamente.',
    retryable: true,
  }
}

export function parseApiError(
  error: unknown,
  context: ErrorContext = 'api',
): string {
  const details = parseAppError(error, context)
  return `${details.title}. ${details.message}`
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof HttpError)) return {}

  const parsed = apiErrorSchema.safeParse(error.data)
  if (!parsed.success || !Array.isArray(parsed.data.message)) return {}

  const fields: Record<string, string> = {}

  for (const item of parsed.data.message) {
    const match = item.match(/^(\w+)\s/i)
    if (match) {
      fields[match[1].toLowerCase()] = item
    }
  }

  return fields
}

export function getStatusMessage(status: number): string {
  const fallback = statusFallbacks[status]
  return fallback ? `${fallback.title}. ${fallback.message}` : `Erro ${status}`
}
