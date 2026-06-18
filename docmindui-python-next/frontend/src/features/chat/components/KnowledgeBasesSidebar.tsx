"use client"

import { ChevronDown, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { useAuth } from "@/features/auth/context"
import {
  type KnowledgeBaseItem,
  knowledgeBasesWithDocuments,
  listKnowledgeBases,
} from "@/features/knowledge-bases/api/knowledge-bases-api"
import { cn } from "@/lib/utils"
import { usePreferencesStore } from "@/stores/preferences"

export function KnowledgeBasesSidebar() {
  const { session } = useAuth()
  const token = session?.accessToken
  const activeId = usePreferencesStore((s) => s.activeKnowledgeBaseId)
  const setActiveId = usePreferencesStore((s) => s.setActiveKnowledgeBaseId)
  const knowledgeBasesRevision = usePreferencesStore((s) => s.knowledgeBasesRevision)
  const [bases, setBases] = useState<KnowledgeBaseItem[]>([])
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    void listKnowledgeBases(token)
      .then((items) => {
        const withDocs = knowledgeBasesWithDocuments(items)
        setBases(withDocs)
        const current = usePreferencesStore.getState().activeKnowledgeBaseId
        if (current && withDocs.some((base) => base.id === current)) {
          return
        }
        setActiveId(withDocs[0]?.id ?? null)
      })
      .catch(() => {
        setBases([])
        setActiveId(null)
      })
      .finally(() => setLoading(false))
  }, [token, setActiveId, knowledgeBasesRevision])

  if (!token) return null

  if (!loading && bases.length === 0) {
    return null
  }

  return (
    <div className="shrink-0 border-b border-border/50 px-3 pb-3">
      <button
        type="button"
        className="flex w-full items-center justify-between px-1 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Bases de conhecimento
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open ? "rotate-0" : "-rotate-90")}
          aria-hidden
        />
      </button>

      {open ? (
        <ul className="mt-1 space-y-0.5" aria-label="Bases de conhecimento">
          {loading ? (
            <li className="px-2 py-2 text-xs text-muted-foreground">Carregando bases…</li>
          ) : (
            bases.map((base) => {
              const isActive = activeId === base.id
              return (
                <li key={base.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(base.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-accent/80 text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Sparkles
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-brand-pink" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{base.nome}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {base.document_count}
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
