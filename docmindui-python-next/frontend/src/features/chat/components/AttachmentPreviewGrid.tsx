"use client"

import { useEffect, useMemo, useState } from "react"

import {
  AttachmentPreviewTile,
  attachmentFromChat,
} from "@/features/chat/components/AttachmentPreviewTile"
import { getFileKind } from "@/features/chat/lib/attachments"
import type { ChatAttachment } from "@/features/chat/types"

export type PendingAttachmentFile = {
  id: string
  file: File
}

type AttachmentPreviewGridProps = {
  variant: "composer" | "message"
  /** Arquivos pendentes no composer. */
  pending?: PendingAttachmentFile[]
  /** Anexos já na mensagem. */
  attachments?: ChatAttachment[]
  onRemovePending?: (id: string) => void
  className?: string
}

export function AttachmentPreviewGrid({
  variant,
  pending = [],
  attachments = [],
  onRemovePending,
  className,
}: AttachmentPreviewGridProps) {
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const next: Record<string, string> = {}
    const urls: string[] = []
    for (const item of pending) {
      if (getFileKind(item.file) === "image") {
        const url = URL.createObjectURL(item.file)
        next[item.id] = url
        urls.push(url)
      }
    }
    setPreviewUrls(next)
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [pending])

  const items = useMemo(() => {
    const fromPending = pending.map((p) => ({
      key: p.id,
      props: {
        name: p.file.name,
        kind: getFileKind(p.file),
        size: p.file.size,
        previewUrl: previewUrls[p.id],
        variant,
        onRemove: onRemovePending ? () => onRemovePending(p.id) : undefined,
      },
    }))
    const fromMessages = attachments.map((a) => ({
      key: a.id,
      props: {
        ...attachmentFromChat(a),
        variant,
      },
    }))
    return [...fromPending, ...fromMessages]
  }, [pending, attachments, previewUrls, variant, onRemovePending])

  if (items.length === 0) return null

  const listLabel =
    variant === "composer"
      ? `${items.length} anexo(s) selecionado(s)`
      : `${items.length} anexo(s) na mensagem`

  return (
    <ul className={`flex flex-wrap gap-2 ${className ?? ""}`} aria-label={listLabel}>
      {items.map(({ key, props }) => (
        <AttachmentPreviewTile key={key} {...props} />
      ))}
    </ul>
  )
}
