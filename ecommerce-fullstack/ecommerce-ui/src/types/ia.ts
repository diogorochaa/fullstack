export type ChatSource = {
  type: string
  id: string
}

export type ChatImagePayload = {
  data: string
  mime_type: string
}

export type ChatRequest = {
  message?: string
  session_id?: string
  image?: ChatImagePayload
}

export type ChatResponse = {
  reply: string
  session_id: string
  sources: ChatSource[]
}

export type IaCapabilities = {
  product_search: boolean
  faq_answers: boolean
  live_catalog: boolean
  indexed_catalog: boolean
  image_search?: boolean
}

export type IaStatus = {
  service: string
  status: 'ready' | 'degraded' | string
  api_reachable: boolean
  api_url: string
  catalog_indexed: number
  faq_indexed: number
  capabilities: IaCapabilities
}
