import { categoriesService } from '@/services/categories.service'
import { useQuery } from '@tanstack/react-query'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.list(),
    staleTime: 5 * 60_000,
  })
}
