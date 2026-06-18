import { productsService } from '@/services/products.service'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'
import { useQueries } from '@tanstack/react-query'

export function useCartProducts(items: CartItem[]) {
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['product', item.productId],
      queryFn: () => productsService.getById(item.productId),
      staleTime: 60_000,
    })),
  })

  const productMap = new Map<string, Product>()
  for (const query of queries) {
    if (query.data) {
      productMap.set(query.data.id, query.data)
    }
  }

  const isLoading = queries.some((query) => query.isLoading)

  return { productMap, isLoading }
}
