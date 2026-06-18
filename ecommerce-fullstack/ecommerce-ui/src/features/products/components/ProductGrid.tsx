import { ErrorState } from '@/components/feedback/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/features/products/components/ProductCard'
import type { AppErrorDetails } from '@/lib/api-error'
import type { Category } from '@/types/category'
import type { Product } from '@/types/product'

type ProductGridProps = {
  products: Product[]
  categories: Category[]
  isLoading?: boolean
  error?: AppErrorDetails | null
  onRetry?: () => void
}

export function ProductGrid({
  products,
  categories,
  isLoading,
  error,
  onRetry,
}: ProductGridProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div
            key={key}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-border"
          >
            <Skeleton className="aspect-square rounded-none" />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="mt-auto h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-lg font-medium">Nenhum produto encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente outro filtro ou busca.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap.get(product.categoryId)}
          index={index}
        />
      ))}
    </div>
  )
}
