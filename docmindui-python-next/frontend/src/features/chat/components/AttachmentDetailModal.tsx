"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, ZoomIn } from "lucide-react"

import { ButtonWithTooltip } from "@/components/shared/ButtonWithTooltip"
import {
  type AttachmentKind,
  attachmentA11yLabel,
  formatFileSize,
  getAttachmentMeta,
} from "@/features/chat/lib/attachments"
import { cn } from "@/lib/utils"

type AttachmentDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  kind: AttachmentKind
  size?: number
  imageSrc?: string | null
  textSnippet?: string
}

export function AttachmentDetailModal({
  open,
  onOpenChange,
  name,
  kind,
  size,
  imageSrc,
  textSnippet,
}: AttachmentDetailModalProps) {
  const meta = getAttachmentMeta(kind)
  const Icon = meta.icon
  const title = attachmentA11yLabel(name, kind, size)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 p-4 pt-safe pb-safe outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
          aria-label={title}
        >
          <ButtonWithTooltip tooltip="Fechar visualização" side="left">
            <DialogPrimitive.Close
              type="button"
              className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/20 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Fechar visualização do anexo"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </ButtonWithTooltip>

          {imageSrc ? (
            <figure className="flex max-h-[min(88dvh,900px)] w-full max-w-4xl flex-col items-center gap-3">
              {/* biome-ignore lint/performance/noImgElement: data/blob URL */}
              <img
                src={imageSrc}
                alt={name}
                className="max-h-[min(80dvh,860px)] w-auto max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/15"
              />
              <figcaption className="flex items-center gap-2 text-sm text-white/85">
                <ZoomIn className="h-4 w-4" aria-hidden />
                <span className="truncate">{name}</span>
                {size !== undefined ? (
                  <span className="text-white/60">({formatFileSize(size)})</span>
                ) : null}
              </figcaption>
            </figure>
          ) : (
            <div className="w-full max-w-lg rounded-2xl glass-panel p-6 text-foreground">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    meta.iconWrapClass,
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {meta.label}
                    {size !== undefined ? ` · ${formatFileSize(size)}` : ""}
                  </p>
                </div>
              </div>
              {textSnippet ? (
                <pre className="custom-scrollbar max-h-[50dvh] overflow-auto rounded-lg bg-background/60 p-3 text-xs leading-relaxed whitespace-pre-wrap">
                  {textSnippet}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pré-visualização não disponível para este tipo de arquivo. O nome e o tipo foram
                  enviados à IA no contexto da mensagem.
                </p>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
