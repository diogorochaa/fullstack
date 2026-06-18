export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatItemCount(count: number): string {
  return count === 1 ? '1 item' : `${count} itens`
}
