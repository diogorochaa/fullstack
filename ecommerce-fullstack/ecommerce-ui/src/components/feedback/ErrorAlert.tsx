import type { AppErrorDetails } from '@/lib/api-error'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

type ErrorAlertProps = {
  error: AppErrorDetails | string
  className?: string
}

export function ErrorAlert({ error, className }: ErrorAlertProps) {
  const details =
    typeof error === 'string'
      ? { title: 'Erro', message: error, code: 'UNKNOWN' as const }
      : error

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="space-y-1">
        <p className="font-medium text-destructive">{details.title}</p>
        <p className="text-muted-foreground">{details.message}</p>
      </div>
    </div>
  )
}
