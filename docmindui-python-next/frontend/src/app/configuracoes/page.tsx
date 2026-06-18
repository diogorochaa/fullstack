"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useSettingsStore } from "@/stores/settings"

/** Mantém o link /configuracoes abrindo o modal no chat (compatibilidade). */
export default function ConfiguracoesPage() {
  const router = useRouter()
  const openSettings = useSettingsStore((s) => s.openSettings)

  useEffect(() => {
    openSettings("knowledge")
    router.replace("/")
  }, [openSettings, router])

  return null
}
