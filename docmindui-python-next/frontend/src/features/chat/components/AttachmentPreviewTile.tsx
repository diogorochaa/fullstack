"use client"

import { X } from "lucide-react"
import { useState } from "react"

import { ButtonWithTooltip } from "@/components/shared/ButtonWithTooltip"
import { AttachmentDetailModal } from "@/features/chat/components/AttachmentDetailModal"
import {
  type AttachmentKind,
  attachmentA11yLabel,
  formatFileSize,
  getAttachmentMeta,
} from "@/features/chat/lib/attachments"
import type { ChatAttachment } from "@/features/chat/types"
import { cn } from "@/lib/utils"

type AttachmentPreviewTileProps = {
  name: string
  kind: AttachmentKind
  size?: number
  previewUrl?: string
  dataUrl?: string
  textSnippet?: string
  variant: "composer" | "message"
  onRemove?: () => void
}

export function attachmentFromChat(
  a: ChatAttachment,
): Omit<AttachmentPreviewTileProps, "variant" | "onRemove"> {
  return {
    name: a.name,
    kind: a.kind,
    size: a.size,
    previewUrl: a.previewUrl,
    dataUrl: a.dataUrl,
    textSnippet: a.textSnippet,
  }
}

export function AttachmentPreviewTile({
  name,
  kind,
  size,
  previewUrl,
  dataUrl,
  textSnippet,
  variant,
  onRemove,
}: AttachmentPreviewTileProps) {
  const [open, setOpen] = useState(false)
  const meta = getAttachmentMeta(kind)
  const Icon = meta.icon
  const imageSrc = kind === "image" ? (dataUrl ?? previewUrl) : undefined
  const label = attachmentA11yLabel(name, kind, size)
  const isMessage = variant === "message"
  const canOpen = Boolean(imageSrc || textSnippet || kind !== "image")

  const tile = (
    <button
      type="button"
      disabled={!canOpen}
      onClick={() => canOpen && setOpen(true)}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        canOpen && "cursor-pointer hover:ring-2 hover:ring-brand-pink/40",
        !canOpen && "cursor-default",
        kind === "image"
          ? isMessage
            ? "h-20 w-20 ring-1 ring-white/20 sm:h-24 sm:w-24"
            : "h-24 w-24 ring-1 ring-border/60"
          : cn(
              "flex min-w-[9rem] max-w-[11rem] flex-col gap-1.5 p-2.5 ring-1",
              meta.chipClass,
              isMessage ? "min-w-[8.5rem]" : "",
            ),
      )}
      aria-label={canOpen ? `${label}. Ampliar` : label}
    >
      {kind === "image" && imageSrc ? (
        <>
          {/* biome-ignore lint/performance/noImgElement: preview dinâmico */}
          <img
            src={imageSrc}
            alt=""
            className={cn(
              "h-full w-full object-cover",
              isMessage && "brightness-110 contrast-105 saturate-110",
            )}
          />
          <span className="sr-only">{name}</span>
        </>
      ) : (
        <>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              meta.iconWrapClass,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="line-clamp-2 text-xs font-medium leading-tight">{name}</span>
          {size !== undefined ? (
            <span className="text-[10px] text-muted-foreground">{formatFileSize(size)}</span>
          ) : null}
        </>
      )}
    </button>
  )

  const previewTooltip = canOpen ? `Ver anexo: ${name}` : name

  return (
    <li className="relative shrink-0 list-none">
      {canOpen ? (
        <ButtonWithTooltip tooltip={previewTooltip} side="top">
          {tile}
        </ButtonWithTooltip>
      ) : (
        tile
      )}
      {onRemove ? (
        <ButtonWithTooltip tooltip={`Remover ${name}`} side="top">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border shadow hover:bg-accent"
            aria-label={`Remover anexo ${name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </ButtonWithTooltip>
      ) : null}
      <AttachmentDetailModal
        open={open}
        onOpenChange={setOpen}
        name={name}
        kind={kind}
        size={size}
        imageSrc={imageSrc}
        textSnippet={textSnippet}
      />
    </li>
  )
}
