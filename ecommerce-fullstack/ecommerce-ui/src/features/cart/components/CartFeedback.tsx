import { useCartFeedbackStore } from '@/stores/cart-feedback.store'
import { CheckCircle2, X } from 'lucide-react'

export function CartFeedback() {
  const message = useCartFeedbackStore((s) => s.message)
  const clear = useCartFeedbackStore((s) => s.clear)

  if (!message) return null

  return (
    <output
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 flex max-w-sm -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 shadow-lg"
    >
      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={clear}
        className="ml-1 rounded-full p-1 text-muted-foreground hover:text-foreground"
        aria-label="Fechar aviso"
      >
        <X className="size-3.5" />
      </button>
    </output>
  )
}
