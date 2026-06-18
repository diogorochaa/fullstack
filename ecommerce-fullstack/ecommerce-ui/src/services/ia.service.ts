import { chatResponseSchema } from '@/features/assistant/schemas/chat.schema'
import { env } from '@/lib/env'
import type { AdminStats } from '@/types/admin'
import type { ChatRequest, ChatResponse, IaStatus } from '@/types/ia'

type AdminChatRequest = ChatRequest & {
  context: AdminStats
}

export async function getIaStatus(): Promise<IaStatus | null> {
  try {
    const response = await fetch(`${env.VITE_IA_API_URL}/status`)
    if (!response.ok) return null
    return (await response.json()) as IaStatus
  } catch {
    return null
  }
}

export async function sendChatMessage(
  payload: ChatRequest,
): Promise<ChatResponse> {
  let response: Response

  try {
    response = await fetch(`${env.VITE_IA_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new TypeError('Failed to fetch')
  }

  if (!response.ok) {
    let message = 'Erro ao conversar com o assistente'
    try {
      const body = (await response.json()) as { detail?: string | unknown }
      if (typeof body.detail === 'string') {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        message = body.detail
          .map((item) =>
            typeof item === 'object' && item && 'msg' in item
              ? String((item as { msg: string }).msg)
              : String(item),
          )
          .join('. ')
      }
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('Resposta inválida do assistente')
  }

  const parsed = chatResponseSchema.safeParse(data)

  if (!parsed.success) {
    throw new Error('Resposta inválida do assistente')
  }

  const { reply, session_id, sources } = parsed.data

  return { reply, session_id, sources: sources as ChatResponse['sources'] }
}

export async function sendAdminChatMessage(
  payload: AdminChatRequest,
  accessToken: string,
): Promise<ChatResponse> {
  let response: Response

  try {
    response = await fetch(`${env.VITE_IA_API_URL}/chat/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new TypeError('Failed to fetch')
  }

  if (!response.ok) {
    let message = 'Erro ao conversar com o assistente admin'
    try {
      const body = (await response.json()) as { detail?: string | unknown }
      if (typeof body.detail === 'string') {
        message = body.detail
      }
    } catch {
      const text = await response.text()
      if (text) message = text
    }

    if (response.status === 404) {
      message =
        'Endpoint /chat/admin não encontrado no serviço de IA. Reconstrua o container (docker compose build ecommerce-ia && docker compose up -d ecommerce-ia) ou rode localmente com make dev na pasta ecommerce-ia.'
    }

    const err = new Error(message) as Error & { status?: number }
    err.status = response.status
    throw err
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('Resposta inválida do assistente admin')
  }

  const parsed = chatResponseSchema.safeParse(data)

  if (!parsed.success) {
    throw new Error('Resposta inválida do assistente admin')
  }

  const { reply, session_id, sources } = parsed.data

  return { reply, session_id, sources: sources as ChatResponse['sources'] }
}
