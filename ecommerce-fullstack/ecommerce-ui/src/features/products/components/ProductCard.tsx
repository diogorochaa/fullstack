import { ProductImage } from '@/components/product/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAddToCart } from '@/features/cart/hooks/useCart'
import {
  useIsFavorite,
  useToggleFavorite,
} from '@/features/favorites/hooks/useFavorites'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { motion } from 'framer-motion'
import { Heart, Loader2, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

type ProductCardProps = {
  product: Product
  categoryName?: string
  index?: number
}

export function ProductCard({
  product,
  categoryName,
  index = 0,
}: ProductCardProps) {
  const addToCart = useAddToCart()
  const toggleFavorite = useToggleFavorite()
  const isFavorite = useIsFavorite(product.id)
  const outOfStock = product.stock === 0
  const isAdding =
    addToCart.isPending && addToCart.variables?.productId === product.id

  function handleAddToCart() {
    if (outOfStock || isAdding) return

    addToCart.mutate({
      productId: product.id,
      quantity: 1,
      productName: product.name,
    })
  }

  function handleToggleFavorite(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(product)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute top-3 left-3 z-10">
          {product.stock > 0 && product.stock < 10 && (
            <Badge className="bg-brand text-white hover:bg-brand">
              Últimas unidades
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={
            isFavorite
              ? `Remover ${product.name} dos favoritos`
              : `Salvar ${product.name} nos favoritos`
          }
          aria-pressed={isFavorite}
          className={cn(
            'absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-all',
            isFavorite
              ? 'opacity-100'
              : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
          )}
        >
          <Heart
            className={cn(
              'size-4 transition-colors',
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-foreground',
            )}
          />
        </button>

        <Link to={`/products/${product.id}`} className="block">
          <div className="aspect-square overflow-hidden bg-muted">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="size-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <p className="min-h-4 text-xs text-muted-foreground">
            {categoryName ?? '\u00A0'}
          </p>
          <div className="mt-1 min-h-10 flex-1">
            <Link to={`/products/${product.id}`}>
              <h3 className="line-clamp-2 font-semibold leading-5 hover:text-brand">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="mt-3 flex shrink-0 items-center justify-between gap-2">
            <p className="min-w-0 truncate text-lg font-bold">
              {formatPrice(product.price)}
            </p>
            <Button
              type="button"
              size="icon-sm"
              disabled={outOfStock || isAdding}
              aria-label={`Adicionar ${product.name} ao carrinho`}
              className={cn(
                'shrink-0 rounded-full bg-foreground text-background',
                'opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100',
              )}
              onClick={handleAddToCart}
            >
              {isAdding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShoppingBag className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
