"use client"

import type { LucideIcon } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SidebarNavItemProps = {
  icon: LucideIcon
  label: string
  disabled?: boolean
  comingSoon?: boolean
  onClick?: () => void
}

export function SidebarNavItem({
  icon: Icon,
  label,
  disabled,
  comingSoon,
  onClick,
}: SidebarNavItemProps) {
  const button = (
    <button
      type="button"
      disabled={disabled || comingSoon}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors",
        !disabled && !comingSoon && "hover:bg-accent hover:text-foreground",
        (disabled || comingSoon) && "cursor-not-allowed opacity-50",
      )}
      aria-label={comingSoon ? `${label} — em breve` : label}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
      {comingSoon ? (
        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground/80">
          Em breve
        </span>
      ) : null}
    </button>
  )

  if (comingSoon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{label} — em breve</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
