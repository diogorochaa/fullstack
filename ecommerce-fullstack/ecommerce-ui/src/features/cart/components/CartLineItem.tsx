import { ProductImage } from '@/components/product/ProductImage'
import { Button } from '@/components/ui/button'
import {
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/features/cart/hooks/useCart'
import { formatPrice } from '@/lib/format'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type CartLineItemProps = {
  item: CartItem
  product?: Product
}

export function CartLineItem({ item, product }: CartLineItemProps) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const isUpdating =
    (updateItem.isPending && updateItem.variables?.itemId === item.id) ||
    (removeItem.isPending && removeItem.variables === item.id)

  const maxStock = product?.stock ?? item.quantity
  const name = product?.name ?? 'Produto'

  function handleDecrease() {
    if (isUpdating) return
    if (item.quantity <= 1) {
      removeItem.mutate(item.id)
      return
    }
    updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
  }

  function handleIncrease() {
    if (isUpdating || item.quantity >= maxStock) return
    updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
  }

  function handleRemove() {
    if (isUpdating) return
    removeItem.mutate(item.id)
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-border p-3">
      <Link
        to={`/products/${item.productId}`}
        className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        <ProductImage
          src={product?.imageUrl}
          alt={name}
          className="size-full"
          fallbackTextClassName="text-xl font-bold text-brand/30"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${item.productId}`}
            className="line-clamp-2 text-sm font-medium hover:text-brand"
          >
            {name}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={`Remover ${name} do carrinho`}
            disabled={isUpdating}
            onClick={handleRemove}
          >
            {removeItem.isPending && removeItem.variables === item.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>

        <p className="mt-1 text-sm font-semibold text-brand">
          {formatPrice(item.unitPrice)}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-full border border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Diminuir quantidade"
              disabled={isUpdating}
              onClick={handleDecrease}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Aumentar quantidade"
              disabled={isUpdating || item.quantity >= maxStock}
              onClick={handleIncrease}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          <p className="text-sm font-semibold">{formatPrice(item.subtotal)}</p>
        </div>
      </div>
    </div>
  )
}
