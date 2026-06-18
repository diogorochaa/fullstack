"use client"

import { StatePanel } from "@/components/shared/StatePanel"

type SettingsSectionPlaceholderProps = {
  title: string
  description: string
}

export function SettingsSectionPlaceholder({
  title,
  description,
}: SettingsSectionPlaceholderProps) {
  return <StatePanel variant="empty" title={title} description={description} className="py-16" />
}
