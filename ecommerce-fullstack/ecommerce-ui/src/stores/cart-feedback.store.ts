import { create } from 'zustand'

type CartFeedbackState = {
  message: string | null
  show: (message: string) => void
  clear: () => void
}

let hideTimer: ReturnType<typeof setTimeout> | null = null

export const useCartFeedbackStore = create<CartFeedbackState>((set) => ({
  message: null,
  show: (message) => {
    if (hideTimer) clearTimeout(hideTimer)
    set({ message })
    hideTimer = setTimeout(() => {
      set({ message: null })
      hideTimer = null
    }, 3000)
  },
  clear: () => {
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = null
    set({ message: null })
  },
}))
