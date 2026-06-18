import { Button } from '@/components/ui/button'
import type { AppErrorDetails } from '@/lib/api-error'
import { AlertCircle, RefreshCw } from 'lucide-react'

type ErrorStateProps = {
  error: AppErrorDetails
  onRetry?: () => void
  compact?: boolean
}

export function ErrorState({
  error,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={
        compact
          ? 'rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-4 text-center'
          : 'rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-12 text-center'
      }
    >
      <AlertCircle
        className={
          compact
            ? 'mx-auto mb-2 size-8 text-destructive'
            : 'mx-auto mb-4 size-10 text-destructive'
        }
      />
      <p className={compact ? 'font-medium' : 'text-lg font-medium'}>
        {error.title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {error.message}
      </p>
      {error.retryable && onRetry && (
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className="mt-4 rounded-full"
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 size-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
