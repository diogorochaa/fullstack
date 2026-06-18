export type AgentActivityStep = {
  phase: string
  label: string
  detail?: string | null
}

export type KnowledgeSourceTag = {
  document_id: string
  titulo: string
  palavras_chave?: string
  snippet?: string
}

export type AgentActivityMeta = {
  intent: string
  steps: AgentActivityStep[]
  tools: string[]
  sources: KnowledgeSourceTag[]
  documents_in_base: number
  knowledge_base_id?: string | null
  knowledge_base_name?: string | null
  search_label?: string | null
  status_message?: string | null
  reasoning_log?: string | null
}

export const INTENT_LABELS: Record<string, string> = {
  profile: "Perfil do usuário",
  address: "Endereço",
  knowledge: "Base de conhecimento",
  rag: "Documentos (RAG)",
  vision: "Visão + documentos",
  general: "Conversa geral",
}
