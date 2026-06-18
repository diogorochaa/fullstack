import { describe, expect, it } from 'vitest'
import {
  getOrderStatusLabel,
  isActiveOrder,
  isHistoryOrder,
} from './order-status'

describe('order status helpers', () => {
  it('returns Portuguese labels', () => {
    expect(getOrderStatusLabel('PAID')).toBe('Pago')
    expect(getOrderStatusLabel('DELIVERED')).toBe('Entregue')
    expect(getOrderStatusLabel('UNKNOWN')).toBe('UNKNOWN')
  })

  it('classifies active orders', () => {
    expect(isActiveOrder('PENDING')).toBe(true)
    expect(isActiveOrder('SHIPPED')).toBe(true)
    expect(isActiveOrder('DELIVERED')).toBe(false)
  })

  it('classifies history orders', () => {
    expect(isHistoryOrder('DELIVERED')).toBe(true)
    expect(isHistoryOrder('CANCELLED')).toBe(true)
    expect(isHistoryOrder('PAID')).toBe(false)
  })
})
