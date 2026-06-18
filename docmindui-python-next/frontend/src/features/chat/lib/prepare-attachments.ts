import {
  attachmentA11yLabel,
  getFileKind,
  isIndexablePdf,
  isVisionImage,
  MAX_FILE_BYTES,
  MAX_VISION_IMAGES,
} from "@/features/chat/lib/attachments"
import { prepareImageForChat } from "@/features/chat/lib/image-utils"
import { readTextAttachment } from "@/features/chat/lib/read-text-attachment"
import type { ChatAttachment } from "@/features/chat/types"

export type VisionImagePayload = {
  base64: string
  mediaType: string
}

export type PreparedOutgoingAttachments = {
  attachments: ChatAttachment[]
  visionImages: VisionImagePayload[]
  attachmentContext: string
  pdfsToIndex: File[]
}

function buildAttachmentContext(attachments: ChatAttachment[]): string {
  const lines: string[] = []

  const listed = attachments.filter((a) => a.kind !== "image")
  if (listed.length > 0) {
    lines.push("Arquivos anexados pelo usuário:")
    for (const a of listed) {
      const size = a.size !== undefined ? ` (${a.size} bytes)` : ""
      lines.push(`- ${a.name} [${a.kind}]${size}`)
      if (a.textSnippet) {
        lines.push(`  Conteúdo:\n${a.textSnippet}`)
      }
    }
  }

  const imageCount = attachments.filter((a) => a.kind === "image").length
  if (imageCount > 0) {
    lines.push(`${imageCount} imagem(ns) anexada(s) nesta mensagem (analisadas visualmente).`)
  }

  return lines.join("\n").trim()
}

export async function prepareOutgoingAttachments(
  files: File[],
): Promise<PreparedOutgoingAttachments> {
  const attachments: ChatAttachment[] = []
  const visionImages: VisionImagePayload[] = []
  const pdfsToIndex: File[] = []

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(`"${file.name}" excede o limite de 8 MB.`)
    }

    const kind = getFileKind(file)
    const id = crypto.randomUUID()
    const base: ChatAttachment = {
      id,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      kind,
      size: file.size,
    }

    if (isVisionImage(file)) {
      if (visionImages.length >= MAX_VISION_IMAGES) {
        throw new Error(`Máximo de ${MAX_VISION_IMAGES} imagens por mensagem.`)
      }
      const prepared = await prepareImageForChat(file)
      attachments.push({
        ...base,
        dataUrl: prepared.dataUrl,
        previewUrl: prepared.dataUrl,
      })
      visionImages.push({
        base64: prepared.base64,
        mediaType: prepared.mimeType,
      })
      continue
    }

    if (isIndexablePdf(file)) {
      pdfsToIndex.push(file)
      attachments.push({
        ...base,
        previewUrl: undefined,
      })
      continue
    }

    const textSnippet = await readTextAttachment(file)
    attachments.push({
      ...base,
      textSnippet,
    })
  }

  return {
    attachments,
    visionImages,
    attachmentContext: buildAttachmentContext(attachments),
    pdfsToIndex,
  }
}

export function pendingFilesFromAttachments(
  attachments: ChatAttachment[],
  fileMap: Map<string, File>,
): File[] {
  return attachments.map((a) => fileMap.get(a.id)).filter((f): f is File => Boolean(f))
}

export { attachmentA11yLabel }
