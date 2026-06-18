import { parseAppError } from '@/lib/api-error'
import { cartService } from '@/services/cart.service'
import { useAuthStore } from '@/stores/auth.store'
import { useCartFeedbackStore } from '@/stores/cart-feedback.store'
import { useCartUiStore } from '@/stores/cart-ui.store'
import type { Cart } from '@/types/cart'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

const emptyCart: Cart = { id: null, items: [], subtotal: 0 }

export function useCart() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['cart', accessToken],
    queryFn: () => cartService.get(accessToken ?? ''),
    enabled: isAuthenticated && Boolean(accessToken),
    placeholderData: emptyCart,
  })
}

export function useCartSummary() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data } = useCart()
  const cart = !isAuthenticated ? emptyCart : (data ?? emptyCart)
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  return {
    cart,
    itemCount,
    subtotal: cart.subtotal,
  }
}

type AddToCartInput = {
  productId: string
  quantity?: number
  productName?: string
}

function useCartMutationContext() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const showFeedback = useCartFeedbackStore((s) => s.show)

  function requireAuth() {
    if (!isAuthenticated || !accessToken) {
      throw new Error('AUTH_REQUIRED')
    }
    return accessToken
  }

  function syncCart(cart: Cart) {
    queryClient.setQueryData(['cart', accessToken], cart)
  }

  function handleAuthError() {
    navigate('/login')
  }

  return {
    accessToken,
    showFeedback,
    requireAuth,
    syncCart,
    handleAuthError,
  }
}

export function useAddToCart() {
  const navigate = useNavigate()
  const { showFeedback, requireAuth, syncCart } = useCartMutationContext()
  const openCart = useCartUiStore((s) => s.open)

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: AddToCartInput) => {
      const token = requireAuth()
      return cartService.addItem(token, { productId, quantity })
    },
    onSuccess: (cart, variables) => {
      syncCart(cart)
      const label = variables.productName ? `${variables.productName} ` : ''
      showFeedback(`${label}adicionado ao carrinho`)
      openCart()
    },
    onError: (error, variables) => {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        navigate('/login', {
          state: { from: `/products/${variables.productId}` },
        })
        return
      }

      const details = parseAppError(error, 'api')
      showFeedback(details.message)
    },
  })
}

export function useUpdateCartItem() {
  const { requireAuth, syncCart, handleAuthError, showFeedback } =
    useCartMutationContext()

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string
      quantity: number
    }) => {
      const token = requireAuth()
      return cartService.updateItem(token, itemId, quantity)
    },
    onSuccess: syncCart,
    onError: (error) => {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        handleAuthError()
        return
      }
      showFeedback(parseAppError(error, 'api').message)
    },
  })
}

export function useRemoveCartItem() {
  const { requireAuth, syncCart, handleAuthError, showFeedback } =
    useCartMutationContext()

  return useMutation({
    mutationFn: async (itemId: string) => {
      const token = requireAuth()
      return cartService.removeItem(token, itemId)
    },
    onSuccess: syncCart,
    onError: (error) => {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        handleAuthError()
        return
      }
      showFeedback(parseAppError(error, 'api').message)
    },
  })
}
