"use client"

import { CheckCircle2, Eye, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { useState } from "react"

import { ButtonWithTooltip } from "@/components/shared/ButtonWithTooltip"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DocumentItem } from "@/features/settings/api/documents-api"
import { DocumentPreviewDialog } from "@/features/settings/components/DocumentPreviewDialog"
import { cn } from "@/lib/utils"

type DocumentsKnowledgeTableProps = {
  documents: DocumentItem[]
  token: string | undefined
  onDelete: (id: string) => Promise<void>
  onReindex: (id: string) => Promise<void>
}

function displayFileName(doc: DocumentItem): string {
  const raw = doc.arquivo_original || doc.titulo
  const idx = raw.indexOf("_")
  if (idx > 0 && idx < 40) {
    return raw.slice(idx + 1)
  }
  return doc.titulo || raw
}

function formatVigencia(iso: string | null | undefined): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function DocumentsKnowledgeTable({
  documents,
  token,
  onDelete,
  onReindex,
}: DocumentsKnowledgeTableProps) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null)

  function openPreview(doc: DocumentItem) {
    setPreviewId(doc.id)
    setPreviewTitle(displayFileName(doc))
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setBusyId(id)
    try {
      await onDelete(id)
      setPendingDelete(null)
    } finally {
      setBusyId(null)
    }
  }

  async function handleReindex(id: string) {
    setBusyId(id)
    try {
      await onReindex(id)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Documento</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-center">OpenAI</th>
                <th className="px-3 py-3">Vigência</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const isAtivo = doc.status === "ativo"
                const isBusy = busyId === doc.id
                const name = displayFileName(doc)

                return (
                  <tr
                    key={doc.id}
                    className="border-b border-border/40 last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="max-w-[280px] px-4 py-3">
                      <p className="truncate font-medium text-foreground" title={name}>
                        {name}
                      </p>
                      {doc.knowledge_base_nome ? (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {doc.knowledge_base_nome}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
                          isAtivo
                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                            : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {isAtivo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {isBusy ? (
                        <Loader2
                          className="mx-auto h-5 w-5 animate-spin text-teal-400"
                          aria-label="Processando"
                        />
                      ) : doc.index_ready ? (
                        <CheckCircle2
                          className="mx-auto h-5 w-5 text-emerald-500"
                          aria-label="Indexado"
                        />
                      ) : (
                        <Loader2
                          className="mx-auto h-5 w-5 animate-spin text-teal-400/80"
                          aria-label="Indexação pendente"
                        />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                      {formatVigencia(doc.vigencia)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ButtonWithTooltip tooltip="Visualizar PDF" side="top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            aria-label={`Visualizar ${name}`}
                            disabled={isBusy}
                            onClick={() => openPreview(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </ButtonWithTooltip>

                        {!isAtivo ? (
                          <ButtonWithTooltip tooltip="Reindexar documento" side="top">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              aria-label={`Reindexar ${name}`}
                              disabled={isBusy}
                              onClick={() => void handleReindex(doc.id)}
                            >
                              <RefreshCw className={cn("h-4 w-4", isBusy && "animate-spin")} />
                            </Button>
                          </ButtonWithTooltip>
                        ) : null}

                        <ButtonWithTooltip tooltip="Excluir documento" side="top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              isAtivo
                                ? "text-destructive hover:text-destructive"
                                : "text-muted-foreground",
                            )}
                            aria-label={`Excluir ${name}`}
                            disabled={isBusy}
                            onClick={() => setPendingDelete(doc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ButtonWithTooltip>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DocumentPreviewDialog
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewId(null)
            setPreviewTitle("")
          }
        }}
        documentId={previewId}
        title={previewTitle}
        token={token}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && busyId !== pendingDelete?.id) setPendingDelete(null)
        }}
        title="Excluir documento?"
        description={
          pendingDelete
            ? `O arquivo "${displayFileName(pendingDelete)}" será removido desta base de conhecimento. Os trechos indexados também serão apagados.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive
        loading={pendingDelete !== null && busyId === pendingDelete.id}
        onConfirm={confirmDelete}
      />
    </>
  )
}
