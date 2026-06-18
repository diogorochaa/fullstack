import type { Product } from '@/types/product'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FavoritesState = {
  items: Product[]
  toggle: (product: Product) => boolean
  remove: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.some((item) => item.id === product.id)

        if (exists) {
          set({
            items: get().items.filter((item) => item.id !== product.id),
          })
          return false
        }

        set({ items: [product, ...get().items] })
        return true
      },

      remove: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        })
      },

      isFavorite: (productId) =>
        get().items.some((item) => item.id === productId),
    }),
    { name: 'shopmax-favorites' },
  ),
)
