import { productsService } from '@/services/products.service'
import type { ProductFilters } from '@/types/product'
import { useQuery } from '@tanstack/react-query'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.list(filters),
    staleTime: 60_000,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}
