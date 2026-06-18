import { BenefitsBar } from '@/features/home/components/BenefitsBar'
import { CategoryStrip } from '@/features/home/components/CategoryStrip'
import { HeroSection } from '@/features/home/components/HeroSection'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { useCategories } from '@/features/products/hooks/useCategories'
import { useProducts } from '@/features/products/hooks/useProducts'
import { parseAppError } from '@/lib/api-error'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const FEATURED_LIMIT = 8

export function HomePage() {
  const { data: categoriesData } = useCategories()
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    page: 1,
    limit: FEATURED_LIMIT,
  })

  const productsError = isError ? parseAppError(error, 'api') : null

  const categories = categoriesData?.data ?? []
  const products = productsData?.data ?? []

  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <BenefitsBar />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Produtos em destaque</h2>
          <Link
            to="/produtos"
            className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Ver todos
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ProductGrid
          products={products}
          categories={categories}
          isLoading={isLoading}
          error={productsError}
          onRetry={() => void refetch()}
        />
      </section>
    </>
  )
}
