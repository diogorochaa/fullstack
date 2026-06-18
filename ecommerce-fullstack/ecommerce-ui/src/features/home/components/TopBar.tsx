import { RefreshCw, Truck } from 'lucide-react'

export function TopBar() {
  return (
    <div className="bg-foreground text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2 text-xs sm:justify-between sm:text-sm">
        <span className="flex items-center gap-1.5">
          <Truck className="size-3.5" />
          Frete grátis acima de R$ 199
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <RefreshCw className="size-3.5" />
          Trocas e devoluções em até 30 dias
        </span>
      </div>
    </div>
  )
}
