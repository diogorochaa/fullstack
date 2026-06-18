"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { fetchDocumentPreviewBlob } from "@/features/settings/api/documents-api"
import { cn } from "@/lib/utils"

type DocumentPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  title: string
  token: string | undefined
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  documentId,
  title,
  token,
}: DocumentPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !documentId || !token) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setError(null)
      return
    }

    let revoked = false
    setLoading(true)
    setError(null)

    void fetchDocumentPreviewBlob(token, documentId)
      .then((blob) => {
        if (revoked) return
        const url = URL.createObjectURL(blob)
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return url
        })
      })
      .catch((err: unknown) => {
        if (revoked) return
        setError(err instanceof Error ? err.message : "Falha ao carregar o PDF.")
      })
      .finally(() => {
        if (!revoked) setLoading(false)
      })

    return () => {
      revoked = true
    }
  }, [open, documentId, token])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex h-[min(90vh,820px)] w-[min(96vw,960px)] -translate-x-1/2 -translate-y-1/2 flex-col",
            "rounded-xl border border-border/60 bg-card shadow-lg outline-none",
          )}
          aria-label={`Visualizar ${title}`}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
            <DialogPrimitive.Title className="truncate text-sm font-semibold text-foreground">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Fechar preview">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="relative min-h-0 flex-1 bg-muted/30">
            {loading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <p className="flex h-full items-center justify-center px-6 text-sm text-destructive">
                {error}
              </p>
            ) : previewUrl ? (
              <iframe src={previewUrl} title={title} className="h-full w-full border-0" />
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
