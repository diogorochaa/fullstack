import { describe, expect, it } from 'vitest'
import { formatItemCount, formatPrice } from './format'

describe('formatPrice', () => {
  it('formats BRL currency', () => {
    expect(formatPrice(199.9)).toContain('199,90')
    expect(formatPrice(199.9)).toMatch(/R\$\s?199,90/)
  })
})

describe('formatItemCount', () => {
  it('uses singular for one item', () => {
    expect(formatItemCount(1)).toBe('1 item')
  })

  it('uses plural for multiple items', () => {
    expect(formatItemCount(2)).toBe('2 itens')
    expect(formatItemCount(10)).toBe('10 itens')
  })
})
