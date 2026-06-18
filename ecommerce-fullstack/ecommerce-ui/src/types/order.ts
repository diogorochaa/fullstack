export type OrderItem = {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type Order = {
  id: string
  addressId: string
  status: string
  total: number
  items: OrderItem[]
  createdAt: string
}
