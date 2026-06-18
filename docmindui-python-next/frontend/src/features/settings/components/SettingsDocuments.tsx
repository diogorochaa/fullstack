"use client"

import { Loader2, Upload } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import { GradientButton } from "@/components/shared/GradientButton"
import { StatePanel } from "@/components/shared/StatePanel"
import { useAuth } from "@/features/auth/context"
import {
  type KnowledgeBaseItem,
  listKnowledgeBases,
} from "@/features/knowledge-bases/api/knowledge-bases-api"
import {
  deleteDocument,
  listDocuments,
  reindexDocument,
  uploadDocument,
} from "@/features/settings/api/documents-api"
import { CreateKnowledgeBaseForm } from "@/features/settings/components/CreateKnowledgeBaseForm"
import { DocumentsKnowledgeTable } from "@/features/settings/components/DocumentsKnowledgeTable"
import { KnowledgeBasesManager } from "@/features/settings/components/KnowledgeBasesManager"
import { handleApiError } from "@/lib/handle-api-error"
import { usePreferencesStore } from "@/stores/preferences"

type SettingsDocumentsProps = {
  embedded?: boolean
}

export function SettingsDocuments({ embedded = false }: SettingsDocumentsProps) {
  const { session } = useAuth()
  const token = session?.accessToken
  const inputRef = useRef<HTMLInputElement>(null)
  const [bases, setBases] = useState<KnowledgeBaseItem[]>([])
  const [basesLoading, setBasesLoading] = useState(true)
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterBaseId, setFilterBaseId] = useState<string>("")
  const [uploadBaseId, setUploadBaseId] = useState<string>("")
  const activeKnowledgeBaseId = usePreferencesStore((s) => s.activeKnowledgeBaseId)
  const setActiveKnowledgeBaseId = usePreferencesStore((s) => s.setActiveKnowledgeBaseId)
  const bumpKnowledgeBasesRevision = usePreferencesStore((s) => s.bumpKnowledgeBasesRevision)
  const knowledgeBasesRevision = usePreferencesStore((s) => s.knowledgeBasesRevision)
  const [documents, setDocuments] = useState<Awaited<ReturnType<typeof listDocuments>>>([])

  const loadBases = useCallback(async () => {
    if (!token) return
    setBasesLoading(true)
    try {
      const kb = await listKnowledgeBases(token)
      setBases(kb)
      const currentActive = usePreferencesStore.getState().activeKnowledgeBaseId
      if (currentActive && !kb.some((b) => b.id === currentActive)) {
        setActiveKnowledgeBaseId(kb[0]?.id ?? null)
      }
      setFilterBaseId((prev) => {
        if (prev && kb.some((b) => b.id === prev)) return prev
        if (activeKnowledgeBaseId && kb.some((b) => b.id === activeKnowledgeBaseId)) {
          return activeKnowledgeBaseId
        }
        return kb[0]?.id ?? ""
      })
      setUploadBaseId((prev) => {
        if (prev && kb.some((b) => b.id === prev)) return prev
        if (activeKnowledgeBaseId && kb.some((b) => b.id === activeKnowledgeBaseId)) {
          return activeKnowledgeBaseId
        }
        return kb[0]?.id ?? ""
      })
    } catch {
      setBases([])
    } finally {
      setBasesLoading(false)
    }
  }, [token, activeKnowledgeBaseId, setActiveKnowledgeBaseId])

  useEffect(() => {
    void loadBases()
  }, [loadBases, knowledgeBasesRevision])

  const loadDocuments = useCallback(async () => {
    if (!token || !filterBaseId) {
      setDocuments([])
      return
    }
    setDocsLoading(true)
    try {
      setDocuments(await listDocuments(token, filterBaseId))
    } catch (error) {
      handleApiError(error, { fallback: "Falha ao carregar documentos." })
    } finally {
      setDocsLoading(false)
    }
  }, [token, filterBaseId])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  function selectBase(baseId: string) {
    setFilterBaseId(baseId)
    setUploadBaseId(baseId)
    setActiveKnowledgeBaseId(baseId)
  }

  function handleBaseCreated(baseId: string) {
    bumpKnowledgeBasesRevision()
    selectBase(baseId)
    void loadBases()
  }

  function handleBasesChanged() {
    bumpKnowledgeBasesRevision()
    void loadBases()
  }

  async function handleUpload(file: File) {
    if (!token) return
    if (!uploadBaseId) {
      toast.info("Crie ou selecione uma base de conhecimento antes do upload.")
      return
    }
    setUploading(true)
    try {
      const result = await uploadDocument(token, file, uploadBaseId)
      setActiveKnowledgeBaseId(uploadBaseId)
      setFilterBaseId(uploadBaseId)
      const diag =
        result.chars_extracted !== undefined
          ? ` — ${result.pages_extracted ?? "?"} pág., ${result.chars_extracted} caracteres`
          : ""
      toast.success(
        `"${result.document.titulo}" indexado (${result.chunks_indexed} trechos)${diag}.`,
      )
      if (result.chars_extracted !== undefined && result.chars_extracted < 200) {
        toast.warn(
          "Pouco texto extraído do PDF. Se for escaneado, use um arquivo com texto selecionável.",
        )
      }
      bumpKnowledgeBasesRevision()
      await loadBases()
      await loadDocuments()
    } catch (error) {
      handleApiError(error, { fallback: "Falha no upload do PDF." })
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!token) return
    try {
      await deleteDocument(token, id)
      toast.success("Documento removido.")
      bumpKnowledgeBasesRevision()
      await loadBases()
      await loadDocuments()
    } catch (error) {
      handleApiError(error, { fallback: "Falha ao excluir documento." })
    }
  }

  async function handleReindex(id: string) {
    if (!token) return
    try {
      await reindexDocument(token, id)
      toast.success("Documento reindexado.")
      await loadDocuments()
    } catch (error) {
      handleApiError(error, { fallback: "Falha ao reindexar documento." })
    }
  }

  if (!token) return null

  return (
    <div className={embedded ? "space-y-6" : "mx-auto max-w-5xl space-y-6"}>
      {embedded ? (
        <header className="space-y-1 border-b border-border/50 pb-5">
          <h2 className="text-lg font-semibold text-foreground">Base de conhecimento</h2>
          <p className="text-sm text-muted-foreground">
            Envie arquivos PDF para atualizar a base de conhecimento do DocMind. Organize por área
            (ex.: Financeiro, TI) e consulte no chat.
          </p>
        </header>
      ) : null}

      <CreateKnowledgeBaseForm token={token} onCreated={handleBaseCreated} />

      {basesLoading ? (
        <div className="flex justify-center py-6 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : bases.length === 0 ? (
        <StatePanel
          variant="empty"
          title="Nenhuma base ainda"
          description="Use o formulário acima para criar sua primeira base. Depois envie PDFs para ela."
        />
      ) : (
        <>
          <KnowledgeBasesManager
            token={token}
            bases={bases}
            selectedId={filterBaseId}
            onSelect={selectBase}
            onChanged={handleBasesChanged}
          />

          <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-8">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleUpload(file)
                e.target.value = ""
              }}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-center sm:text-left">
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground sm:mx-0" />
                <p className="text-sm text-muted-foreground">
                  Envie PDFs com texto selecionável para a base escolhida. Eles entram na tabela
                  abaixo com preview e exclusão.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <label className="flex w-full flex-col gap-1 text-sm sm:w-64">
                  <span className="text-muted-foreground">Base para upload</span>
                  <select
                    value={uploadBaseId}
                    onChange={(e) => setUploadBaseId(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
                  >
                    {bases.map((base) => (
                      <option key={base.id} value={base.id}>
                        {base.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <GradientButton
                  type="button"
                  disabled={uploading || !uploadBaseId}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Enviar PDF"
                  )}
                </GradientButton>
              </div>
            </div>
          </div>

          <label className="flex max-w-xs flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Documentos da base</span>
            <select
              value={filterBaseId}
              onChange={(e) => selectBase(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            >
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.nome} ({base.document_count} PDF{base.document_count === 1 ? "" : "s"})
                </option>
              ))}
            </select>
          </label>

          {docsLoading ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <StatePanel
              variant="empty"
              title="Nenhum documento nesta base"
              description="Esta base está vazia. Envie um PDF usando o botão acima."
            />
          ) : (
            <DocumentsKnowledgeTable
              documents={documents}
              token={token}
              onDelete={handleDelete}
              onReindex={handleReindex}
            />
          )}
        </>
      )}
    </div>
  )
}
