"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type PreferencesState = {
  sidebarCollapsed: boolean
  activeKnowledgeBaseId: string | null
  knowledgeBasesRevision: number
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setActiveKnowledgeBaseId: (id: string | null) => void
  bumpKnowledgeBasesRevision: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeKnowledgeBaseId: null,
      knowledgeBasesRevision: 0,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveKnowledgeBaseId: (activeKnowledgeBaseId) => set({ activeKnowledgeBaseId }),
      bumpKnowledgeBasesRevision: () =>
        set((state) => ({ knowledgeBasesRevision: state.knowledgeBasesRevision + 1 })),
    }),
    { name: "docmind:preferences" },
  ),
)
