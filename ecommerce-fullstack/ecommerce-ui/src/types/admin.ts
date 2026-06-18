import type { Order } from '@/types/order'

export type AdminStats = {
  totalRevenue: number
  revenueThisMonth: number
  totalOrders: number
  ordersByStatus: Record<string, number>
  totalUsers: number
  totalAdmins: number
  totalProducts: number
  revenueByMonth: { month: string; revenue: number; orders: number }[]
  ordersByMonthStatus: {
    month: string
    PENDING: number
    PAID: number
    SHIPPED: number
    DELIVERED: number
    CANCELLED: number
  }[]
  topProducts: {
    productName: string
    quantity: number
    revenue: number
  }[]
  recentOrders: {
    id: string
    total: number
    status: string
    createdAt: string
    userId: string
  }[]
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export type CreateProductPayload = {
  name: string
  description: string
  price: number
  stock: number
  imageUrl?: string
  categoryId: string
}

export type UpdateProductPayload = Partial<
  CreateProductPayload & { active: boolean }
>

export type AdminOrder = Order & { userId?: string }
