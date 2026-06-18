import type { AgentActivityMeta } from "@/features/chat/types/agent-activity"

export function getReasoningText(activity?: AgentActivityMeta): string {
  if (!activity) return ""
  if (activity.reasoning_log?.trim()) {
    return activity.reasoning_log.trim()
  }
  return activity.steps
    .map((step, index) => {
      const parts = [`Etapa ${index + 1}`, step.label]
      if (step.detail) parts.push(step.detail)
      return parts.join("\n")
    })
    .join("\n\n")
}

export function formatMessageTimestamp(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
