import { isTextExtractable, MAX_TEXT_EXTRACT_BYTES } from "@/features/chat/lib/attachments"

export async function readTextAttachment(file: File): Promise<string | undefined> {
  if (!isTextExtractable(file)) return undefined
  if (file.size > MAX_TEXT_EXTRACT_BYTES) {
    return `[Arquivo ${file.name} muito grande para extrair texto (${file.size} bytes)]`
  }
  try {
    const text = await file.text()
    const trimmed = text.trim()
    if (!trimmed) return undefined
    const maxChars = 12_000
    if (trimmed.length <= maxChars) return trimmed
    return `${trimmed.slice(0, maxChars)}\n… [texto truncado]`
  } catch {
    return undefined
  }
}
