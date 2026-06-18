"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { BookOpen, CircleHelp, Cpu, Users, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SettingsDocuments } from "@/features/settings/components/SettingsDocuments"
import { SettingsSectionPlaceholder } from "@/features/settings/components/SettingsSectionPlaceholder"
import { cn } from "@/lib/utils"
import type { SettingsSection } from "@/stores/settings"
import { useSettingsStore } from "@/stores/settings"

type NavItem = {
  id: SettingsSection
  label: string
  icon: typeof BookOpen
  available: boolean
}

const DOCMIND_NAV: NavItem[] = [
  { id: "knowledge", label: "Conhecimento", icon: BookOpen, available: true },
  { id: "agents", label: "Agentes", icon: Users, available: false },
  { id: "runtime", label: "Runtime", icon: Cpu, available: false },
]

function SettingsNavButton({
  item,
  active,
  onSelect,
}: {
  item: NavItem
  active: boolean
  onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      disabled={!item.available}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        active && item.available
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        !item.available && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{item.label}</span>
      {!item.available ? (
        <span className="ml-auto text-[10px] uppercase tracking-wide">Em breve</span>
      ) : null}
    </button>
  )
}

function SettingsContent({ section }: { section: SettingsSection }) {
  switch (section) {
    case "knowledge":
      return <SettingsDocuments embedded />
    case "agents":
      return (
        <SettingsSectionPlaceholder
          title="Agentes"
          description="Configure especialistas e comportamento dos agentes. Disponível em breve."
        />
      )
    case "runtime":
      return (
        <SettingsSectionPlaceholder
          title="Runtime"
          description="Parâmetros de execução, modelos e limites do sistema. Disponível em breve."
        />
      )
    default:
      return null
  }
}

export function SettingsModal() {
  const open = useSettingsStore((s) => s.open)
  const section = useSettingsStore((s) => s.section)
  const closeSettings = useSettingsStore((s) => s.closeSettings)
  const setSection = useSettingsStore((s) => s.setSection)

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closeSettings()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[60] flex h-[min(90vh,820px)] w-[min(96vw,1080px)] -translate-x-1/2 -translate-y-1/2",
            "flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          aria-describedby={undefined}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-4">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              Configurações
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Fechar configurações">
                <X className="h-5 w-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="flex min-h-0 flex-1">
            <aside className="flex w-[220px] shrink-0 flex-col border-r border-border/50 bg-muted/20 px-3 py-4">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                DocMind
              </p>
              <nav className="space-y-0.5" aria-label="Seções de configuração">
                {DOCMIND_NAV.map((item) => (
                  <SettingsNavButton
                    key={item.id}
                    item={item}
                    active={section === item.id}
                    onSelect={() => {
                      if (item.available) setSection(item.id)
                    }}
                  />
                ))}
              </nav>

              <div className="mt-auto pt-4">
                <button
                  type="button"
                  disabled
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground opacity-50"
                >
                  <CircleHelp className="h-4 w-4" aria-hidden />
                  Como usar
                </button>
              </div>
            </aside>

            <div className="custom-scrollbar min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <SettingsContent section={section} />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
