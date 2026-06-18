import { useCartFeedbackStore } from '@/stores/cart-feedback.store'
import { useFavoritesStore } from '@/stores/favorites.store'
import type { Product } from '@/types/product'

export function useFavoritesCount() {
  return useFavoritesStore((s) => s.items.length)
}

export function useIsFavorite(productId: string) {
  return useFavoritesStore((s) => s.items.some((item) => item.id === productId))
}

export function useToggleFavorite() {
  const toggle = useFavoritesStore((s) => s.toggle)
  const showFeedback = useCartFeedbackStore((s) => s.show)

  return (product: Product) => {
    const added = toggle(product)
    showFeedback(
      added
        ? `${product.name} salvo nos favoritos`
        : `${product.name} removido dos favoritos`,
    )
  }
}

export function useFavoriteProducts() {
  return useFavoritesStore((s) => s.items)
}
