/**
 * Converte falhas de fetch (API parada, DNS, timeout) em mensagens legíveis para o usuário.
 */

const MSG_API_INDISPONIVEL =
  "Não foi possível conectar ao servidor. Confira se a API está em execução (por exemplo na porta 8001) e se o endereço no .env está correto."

function walkCauseChain(error: unknown, maxDepth: number): unknown[] {
  const chain: unknown[] = []
  let current: unknown = error
  for (let i = 0; i < maxDepth && current; i++) {
    chain.push(current)
    if (current instanceof Error && current.cause !== undefined && current.cause !== null) {
      current = current.cause
      continue
    }
    break
  }
  return chain
}

function errnoFromChain(chain: unknown[]): string | undefined {
  for (const item of chain) {
    if (typeof item === "object" && item !== null && "code" in item) {
      const code = (item as { code?: unknown }).code
      if (typeof code === "string") return code
    }
  }
  return undefined
}

/** Mensagem amigável para erros de rede / fetch (Node e navegadores). */
export function mapFetchErrorToUserMessage(error: unknown): string {
  const chain = walkCauseChain(error, 6)
  const code = errnoFromChain(chain)

  if (code === "ECONNREFUSED") {
    return `${MSG_API_INDISPONIVEL} Detalhe: conexão recusada — o serviço pode estar desligado.`
  }
  if (code === "ENOTFOUND") {
    return "O endereço do servidor não foi encontrado. Verifique API_URL / NEXT_PUBLIC_API_URL no .env."
  }
  if (code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT") {
    return "O servidor demorou muito para responder. Tente de novo ou verifique a rede."
  }
  if (code === "ECONNRESET" || code === "EPIPE") {
    return "A conexão com o servidor foi interrompida. Tente de novo."
  }

  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase()
    if (msg.includes("fetch") || msg.includes("failed to fetch") || msg === "fetch failed") {
      return MSG_API_INDISPONIVEL
    }
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "O pedido foi cancelado ou o tempo limite foi atingido."
    }
    if (error.message === "fetch failed") {
      return MSG_API_INDISPONIVEL
    }
  }

  return MSG_API_INDISPONIVEL
}

export function mapHttpStatusToUserMessage(status: number, fallback: string): string {
  if (status === 502 || status === 503 || status === 504) {
    return "O servidor está temporariamente indisponível. Tente de novo em instantes."
  }
  if (status === 408) {
    return "O pedido expirou. Tente de novo."
  }
  if (status >= 500) {
    return "Erro no servidor. Se persistir, entre em contato com o suporte."
  }
  return fallback
}
