"use client"

import { Loader2, Plus } from "lucide-react"
import { type FormEvent, useState } from "react"
import { toast } from "react-toastify"

import { GradientButton } from "@/components/shared/GradientButton"
import { Input } from "@/components/ui/input"
import { createKnowledgeBase } from "@/features/knowledge-bases/api/knowledge-bases-api"
import { handleApiError } from "@/lib/handle-api-error"

type CreateKnowledgeBaseFormProps = {
  token: string
  onCreated: (baseId: string) => void
}

export function CreateKnowledgeBaseForm({ token, onCreated }: CreateKnowledgeBaseFormProps) {
  const [nome, setNome] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = nome.trim()
    if (!trimmed) {
      toast.info("Digite um nome para a base, por exemplo: Financeiro.")
      return
    }
    setCreating(true)
    try {
      const base = await createKnowledgeBase(token, trimmed)
      setNome("")
      toast.success(`Base "${base.nome}" criada. Agora você pode enviar PDFs para ela.`)
      onCreated(base.id)
    } catch (error) {
      handleApiError(error, { fallback: "Não foi possível criar a base." })
    } finally {
      setCreating(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-border/80 bg-background/40 p-6"
    >
      <h2 className="text-base font-semibold text-foreground">Nova base de conhecimento</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Crie uma base vazia (ex.: Financeiro) e envie PDFs para ela quando quiser.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label htmlFor="knowledge-base-name" className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Nome da base</span>
          <Input
            id="knowledge-base-name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Financeiro"
            maxLength={200}
            disabled={creating}
          />
        </label>
        <GradientButton type="submit" disabled={creating} className="shrink-0 sm:min-w-[140px]">
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Criar base
            </>
          )}
        </GradientButton>
      </div>
    </form>
  )
}
