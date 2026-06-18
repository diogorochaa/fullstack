import { PageTransition } from '@/components/layout/PageTransition'
import { buttonVariants } from '@/components/ui/button'
import { useFavoriteProducts } from '@/features/favorites/hooks/useFavorites'
import { ProductCard } from '@/features/products/components/ProductCard'
import { useCategories } from '@/features/products/hooks/useCategories'
import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FavoritesPage() {
  const favorites = useFavoriteProducts()
  const { data: categoriesData } = useCategories()
  const categoryMap = new Map(
    (categoriesData?.data ?? []).map((category) => [
      category.id,
      category.name,
    ]),
  )

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40">
          <Heart className="size-5 fill-rose-500 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Favoritos</h1>
          <p className="text-sm text-muted-foreground">
            {favorites.length === 0
              ? 'Nenhum produto salvo ainda'
              : `${favorites.length} produto(s) salvos`}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Heart className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Sua lista está vazia</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque no coração dos produtos para salvá-los aqui.
          </p>
          <Link
            to="/produtos"
            className={cn(buttonVariants(), 'mt-6 rounded-full')}
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {favorites.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categoryMap.get(product.categoryId)}
              index={index}
            />
          ))}
        </div>
      )}
    </PageTransition>
  )
}
