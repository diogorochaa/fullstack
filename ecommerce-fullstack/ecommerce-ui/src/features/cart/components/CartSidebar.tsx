import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { CartLineItem } from '@/features/cart/components/CartLineItem'
import { useCart, useCartSummary } from '@/features/cart/hooks/useCart'
import { useCartProducts } from '@/features/cart/hooks/useCartProducts'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useCartUiStore } from '@/stores/cart-ui.store'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CartSidebar() {
  const isOpen = useCartUiStore((s) => s.isOpen)
  const setOpen = useCartUiStore((s) => s.setOpen)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: cart, isLoading } = useCart()
  const { subtotal, itemCount } = useCartSummary()
  const items = cart?.items ?? []
  const { productMap, isLoading: isLoadingProducts } = useCartProducts(items)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="size-5" />
            Carrinho
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Revise seus produtos antes de finalizar a compra.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {!isAuthenticated ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="size-10 text-muted-foreground/40" />
              <p className="mt-4 font-medium">Entre para ver seu carrinho</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Salve produtos e acompanhe o total da compra.
              </p>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants(),
                  'mt-6 rounded-full bg-brand text-white hover:bg-brand/90',
                )}
              >
                Entrar
              </Link>
            </div>
          ) : isLoading || isLoadingProducts ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando carrinho...
            </p>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="size-10 text-muted-foreground/40" />
              <p className="mt-4 font-medium">Seu carrinho está vazio</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione produtos para vê-los aqui.
              </p>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'mt-6 rounded-full',
                )}
              >
                Continuar comprando
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                product={productMap.get(item.productId)}
              />
            ))
          )}
        </div>

        {isAuthenticated && items.length > 0 && (
          <SheetFooter className="border-t border-border">
            <div className="flex w-full items-center justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Button
              className="w-full rounded-full bg-brand text-white hover:bg-brand/90"
              disabled
            >
              Finalizar compra (em breve)
            </Button>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full rounded-full',
              )}
            >
              Continuar comprando
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
