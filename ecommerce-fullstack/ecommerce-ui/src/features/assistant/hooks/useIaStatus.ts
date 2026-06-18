import { getIaStatus } from '@/services/ia.service'
import { useQuery } from '@tanstack/react-query'

export function useIaStatus(enabled = true) {
  return useQuery({
    queryKey: ['ia-status'],
    queryFn: getIaStatus,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export const IMAGE_SEARCH_SUGGESTION = 'Colar print de um produto'

export function buildChatSuggestions(
  capabilities?: {
    product_search?: boolean
    faq_answers?: boolean
    image_search?: boolean
  } | null,
): string[] {
  const suggestions: string[] = []

  if (capabilities?.image_search) {
    suggestions.push(IMAGE_SEARCH_SUGGESTION)
  }

  if (capabilities?.product_search !== false) {
    suggestions.push('Tem tênis Nike?', 'Mostre eletrônicos em estoque')
  }

  if (capabilities?.faq_answers !== false) {
    suggestions.push('Quanto tempo demora o frete?', 'Como funciona a troca?')
  }

  if (suggestions.length === 0) {
    suggestions.push('Quanto tempo demora o frete?', 'Como funciona a troca?')
  }

  return suggestions.slice(0, 3)
}
