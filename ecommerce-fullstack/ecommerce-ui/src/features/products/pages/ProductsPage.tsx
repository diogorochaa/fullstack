import { PageTransition } from '@/components/layout/PageTransition'
import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { useCategories } from '@/features/products/hooks/useCategories'
import { useProducts } from '@/features/products/hooks/useProducts'
import { parseProductFilters } from '@/features/products/schemas/product-filters.schema'
import { parseAppError } from '@/lib/api-error'
import { Link, useSearchParams } from 'react-router-dom'

const PAGE_SIZE = 12

export function ProductsPage() {
  const [searchParams] = useSearchParams()
  const { page, search, categoryId } = parseProductFilters(searchParams)

  const { data: categoriesData } = useCategories()
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    page,
    limit: PAGE_SIZE,
    search,
    categoryId,
  })

  const categories = categoriesData?.data ?? []
  const products = productsData?.data ?? []
  const productsError = isError ? parseAppError(error, 'api') : null
  const selectedCategory = categories.find((c) => c.id === categoryId)

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-10">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para a loja
      </Link>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Todos os produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? `Resultados para "${search}"`
              : selectedCategory
                ? `Categoria: ${selectedCategory.name}`
                : 'Explore o catálogo completo da Shopmax'}
            {productsData ? ` · ${productsData.total} produto(s)` : ''}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ProductFilters
          categories={categories}
          totalPages={productsData?.totalPages ?? 1}
          currentPage={productsData?.page ?? 1}
          total={productsData?.total}
        />
      </div>

      <div className="mt-6">
        <ProductGrid
          products={products}
          categories={categories}
          isLoading={isLoading}
          error={productsError}
          onRetry={() => void refetch()}
        />
      </div>
    </PageTransition>
  )
}
