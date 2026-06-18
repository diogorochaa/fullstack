export type ChatLoadingPhase =
  | "idle"
  | "uploading"
  | "saving"
  | "analyzing"
  | "thinking"
  | "streaming"

export function chatLoadingLabel(phase: ChatLoadingPhase): string {
  switch (phase) {
    case "uploading":
      return "Enviando e indexando PDF(s)…"
    case "saving":
      return "Salvando sua mensagem…"
    case "analyzing":
      return "Preparando anexos para análise…"
    case "thinking":
      return "Analisando intenção e consultando bases…"
    case "streaming":
      return "Gerando resposta…"
    default:
      return ""
  }
}

export function chatComposerPlaceholder(phase: ChatLoadingPhase): string {
  if (phase !== "idle") {
    return "Aguarde a resposta do DocMind…"
  }
  return "Pergunte alguma coisa…"
}
