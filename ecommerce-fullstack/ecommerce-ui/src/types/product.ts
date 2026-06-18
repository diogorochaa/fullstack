export type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
  active: boolean
  categoryId: string
}

export type ProductFilters = {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}
