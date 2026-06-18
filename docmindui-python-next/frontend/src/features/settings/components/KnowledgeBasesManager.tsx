"use client"

import { Check, Loader2, Pencil, Trash2, X } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"
import { ButtonWithTooltip } from "@/components/shared/ButtonWithTooltip"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deleteKnowledgeBase,
  type KnowledgeBaseItem,
  updateKnowledgeBase,
} from "@/features/knowledge-bases/api/knowledge-bases-api"
import { handleApiError } from "@/lib/handle-api-error"
import { cn } from "@/lib/utils"

type KnowledgeBasesManagerProps = {
  token: string
  bases: KnowledgeBaseItem[]
  selectedId: string
  onSelect: (baseId: string) => void
  onChanged: () => void
}

export function KnowledgeBasesManager({
  token,
  bases,
  selectedId,
  onSelect,
  onChanged,
}: KnowledgeBasesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<KnowledgeBaseItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  function startEdit(base: KnowledgeBaseItem) {
    setEditingId(base.id)
    setEditName(base.nome)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName("")
  }

  async function saveEdit(baseId: string) {
    const trimmed = editName.trim()
    if (!trimmed) {
      toast.info("O nome da base não pode ficar vazio.")
      return
    }
    setSavingId(baseId)
    try {
      await updateKnowledgeBase(token, baseId, trimmed)
      toast.success("Nome da base atualizado.")
      cancelEdit()
      onChanged()
    } catch (error) {
      handleApiError(error, { fallback: "Não foi possível renomear a base." })
    } finally {
      setSavingId(null)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteKnowledgeBase(token, pendingDelete.id)
      toast.success(`Base "${pendingDelete.nome}" excluída.`)
      setPendingDelete(null)
      onChanged()
    } catch (error) {
      handleApiError(error, { fallback: "Não foi possível excluir a base." })
    } finally {
      setDeleting(false)
    }
  }

  if (bases.length === 0) return null

  return (
    <>
      <div className="rounded-xl border border-border/80 bg-background/40 p-4">
        <h2 className="text-base font-semibold text-foreground">Suas bases</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Renomeie ou exclua bases. Ao excluir, todos os PDFs vinculados também são removidos.
        </p>
        <ul className="mt-4 space-y-2">
          {bases.map((base) => {
            const isSelected = selectedId === base.id
            const isEditing = editingId === base.id
            const isSaving = savingId === base.id

            return (
              <li
                key={base.id}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center",
                  isSelected ? "border-teal-500/40 bg-teal-500/5" : "border-border/60 bg-card/30",
                )}
              >
                {isEditing ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={200}
                      disabled={isSaving}
                      className="h-9"
                      aria-label="Novo nome da base"
                    />
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => void saveEdit(base.id)}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <span className="sr-only sm:not-sr-only sm:ml-1">Salvar</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">Cancelar</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => onSelect(base.id)}
                    >
                      <p className="truncate font-medium text-foreground">{base.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {base.document_count} PDF{base.document_count === 1 ? "" : "s"}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                      <ButtonWithTooltip tooltip="Renomear base" side="top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Renomear ${base.nome}`}
                          onClick={() => startEdit(base)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </ButtonWithTooltip>
                      <ButtonWithTooltip tooltip="Excluir base" side="top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label={`Excluir ${base.nome}`}
                          onClick={() => setPendingDelete(base)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ButtonWithTooltip>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null)
        }}
        title="Excluir base de conhecimento?"
        description={
          pendingDelete
            ? pendingDelete.document_count > 0
              ? `A base "${pendingDelete.nome}" e seus ${pendingDelete.document_count} PDF(s) serão removidos permanentemente.`
              : `A base "${pendingDelete.nome}" será removida. Não há PDFs vinculados.`
            : ""
        }
        confirmLabel="Excluir base"
        cancelLabel="Cancelar"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  )
}
