import { ErrorState } from '@/components/feedback/ErrorState'
import { ProductImage } from '@/components/product/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddToCart } from '@/features/cart/hooks/useCart'
import {
  useIsFavorite,
  useToggleFavorite,
} from '@/features/favorites/hooks/useFavorites'
import { HowToUseSheet } from '@/features/products/components/HowToUseSheet'
import { useCategories } from '@/features/products/hooks/useCategories'
import { useProduct } from '@/features/products/hooks/useProducts'
import { parseAppError } from '@/lib/api-error'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const SIZES = ['P', 'M', 'G', 'GG'] as const

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const { data: product, isLoading, isError, error, refetch } = useProduct(id)
  const { data: categoriesData } = useCategories()
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [quantity, setQuantity] = useState(1)
  const addToCart = useAddToCart()
  const toggleFavorite = useToggleFavorite()
  const isFavorite = useIsFavorite(id)

  const category = categoriesData?.data.find(
    (c) => c.id === product?.categoryId,
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    const details = parseAppError(error, 'api')
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <ErrorState error={details} onRetry={() => void refetch()} />
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-brand hover:underline">
            Voltar para a loja
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg font-medium">Produto não encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Este item pode ter sido removido do catálogo.
        </p>
        <Link to="/" className="mt-4 inline-block text-brand hover:underline">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl px-4 py-8"
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        {category && (
          <>
            <span>{category.name}</span>
            <ChevronRight className="size-4" />
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-border bg-muted"
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full"
            fallbackTextClassName="text-8xl font-bold text-brand/20"
          />
        </motion.div>

        <div className="space-y-6">
          {category && (
            <p className="text-sm font-medium text-muted-foreground">
              {category.name}
            </p>
          )}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full"
              aria-label={
                isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'
              }
              aria-pressed={isFavorite}
              onClick={() => toggleFavorite(product)}
            >
              <Heart
                className={cn(
                  'size-5',
                  isFavorite && 'fill-rose-500 text-rose-500',
                )}
              />
            </Button>
          </div>
          <p className="text-3xl font-bold text-brand">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-2">
            {outOfStock ? (
              <Badge variant="destructive">Esgotado</Badge>
            ) : (
              <Badge className="bg-green-600 text-white hover:bg-green-600">
                {product.stock} em estoque
              </Badge>
            )}
          </div>

          <Separator />

          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              Não sabe por onde começar? Veja o passo a passo de uso deste
              produto.
            </p>
            <div className="mt-3">
              <HowToUseSheet
                productName={product.name}
                description={product.description}
                categorySlug={category?.slug}
              />
            </div>
          </div>

          <div>
            <h2 className="font-semibold">Descrição</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div>
            <h2 className="font-semibold">Tamanho</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Seleção visual — confirmação no checkout
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                    selectedSize === size
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-border">
              <Button
                variant="ghost"
                size="icon"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                disabled={quantity >= product.stock}
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                aria-label="Aumentar quantidade"
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <Button
              disabled={outOfStock || addToCart.isPending}
              className="h-12 flex-1 rounded-full bg-brand text-white hover:bg-brand/90"
              onClick={() =>
                addToCart.mutate({
                  productId: product.id,
                  quantity,
                  productName: product.name,
                })
              }
            >
              {addToCart.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShoppingBag className="size-4" />
              )}
              {addToCart.isPending ? 'Adicionando...' : 'Adicionar ao carrinho'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>SKU</span>
                <span className="text-foreground">{product.slug}</span>
              </div>
              <div className="flex justify-between">
                <span>Categoria</span>
                <span className="text-foreground">{category?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tamanho selecionado</span>
                <span className="text-foreground">{selectedSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Estoque</span>
                <span className="text-foreground">{product.stock} un.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
