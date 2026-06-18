"use client"

import { create } from "zustand"

export type SettingsSection = "knowledge" | "agents" | "runtime"

type SettingsState = {
  open: boolean
  section: SettingsSection
  openSettings: (section?: SettingsSection) => void
  closeSettings: () => void
  setSection: (section: SettingsSection) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  section: "knowledge",
  openSettings: (section = "knowledge") => set({ open: true, section }),
  closeSettings: () => set({ open: false }),
  setSection: (section) => set({ section }),
}))
