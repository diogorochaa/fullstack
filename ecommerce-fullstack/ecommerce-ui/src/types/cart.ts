export type CartItem = {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type Cart = {
  id: string | null
  items: CartItem[]
  subtotal: number
}

export type AddCartItemPayload = {
  productId: string
  quantity: number
}
