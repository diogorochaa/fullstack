export class AdminStatsResponse {
  constructor(
    public readonly totalRevenue: number,
    public readonly revenueThisMonth: number,
    public readonly totalOrders: number,
    public readonly ordersByStatus: Record<string, number>,
    public readonly totalUsers: number,
    public readonly totalAdmins: number,
    public readonly totalProducts: number,
    public readonly revenueByMonth: {
      month: string;
      revenue: number;
      orders: number;
    }[],
    public readonly ordersByMonthStatus: {
      month: string;
      PENDING: number;
      PAID: number;
      SHIPPED: number;
      DELIVERED: number;
      CANCELLED: number;
    }[],
    public readonly topProducts: {
      productName: string;
      quantity: number;
      revenue: number;
    }[],
    public readonly recentOrders: {
      id: string;
      total: number;
      status: string;
      createdAt: string;
      userId: string;
    }[],
  ) {}
}
