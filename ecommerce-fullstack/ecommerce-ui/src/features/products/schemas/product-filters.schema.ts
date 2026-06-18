import { z } from 'zod'

export const productFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  search: z
    .string()
    .trim()
    .max(100, 'Busca muito longa')
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  categoryId: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.string().uuid('Categoria inválida').optional(),
  ),
})

export type ProductFilters = z.infer<typeof productFiltersSchema>

export function parseProductFilters(params: URLSearchParams): ProductFilters {
  const result = productFiltersSchema.safeParse({
    page: params.get('page') ?? '1',
    search: params.get('search') ?? undefined,
    categoryId: params.get('categoryId') ?? undefined,
  })

  if (result.success) {
    return result.data
  }

  return { page: 1 }
}
