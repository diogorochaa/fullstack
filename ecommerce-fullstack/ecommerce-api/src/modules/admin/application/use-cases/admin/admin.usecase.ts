import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrderStatusDto } from 'src/modules/admin/application/dto/update-order-status.dto';
import { UpdateUserRoleDto } from 'src/modules/admin/application/dto/update-user-role.dto';
import { AdminStatsResponse } from 'src/modules/admin/presentation/responses/admin-stats.response';
import { ORDER_REPOSITORY } from 'src/modules/orders/domain/constants/order.tokens';
import { OrderNotFoundException } from 'src/modules/orders/domain/exceptions/order-not-found.exception';
import { assertValidOrderStatusTransition } from 'src/modules/orders/domain/policies/order-status.policy';
import { OrderRepository } from 'src/modules/orders/domain/repositories/order.repository';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';
import { DomainEventsService } from 'src/shared/messaging/events/domain-events.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

const REVENUE_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'] as const;

@Injectable()
export class ListAllOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(page: number, limit: number) {
    return this.orderRepository.findAllPaginated(page, limit);
  }
}

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly events: DomainEventsService,
  ) {}

  async execute(id: string, input: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new OrderNotFoundException(id);
    }

    const previousStatus = order.status;
    assertValidOrderStatusTransition(previousStatus, input.status);
    const updated = await this.orderRepository.transitionStatus(
      id,
      previousStatus,
      input.status,
    );

    await this.events.orderStatusChanged({
      orderId: updated.id,
      userId: updated.userId,
      previousStatus,
      status: updated.status,
    });

    return updated;
  }
}

@Injectable()
export class ListAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(page: number, limit: number, search?: string) {
    return this.userRepository.findAllPaginatedAdmin(page, limit, search);
  }
}

@Injectable()
export class GetAdminStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<AdminStatsResponse> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      revenueAgg,
      revenueMonthAgg,
      totalOrders,
      statusGroups,
      totalUsers,
      totalAdmins,
      totalProducts,
      recentOrders,
      orderItems,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: [...REVENUE_STATUSES] } },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: [...REVENUE_STATUSES] },
          createdAt: { gte: monthStart },
        },
      }),
      this.prisma.order.count(),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.product.count({ where: { active: true } }),
      this.prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          userId: true,
        },
      }),
      this.prisma.orderItem.findMany({
        where: {
          order: { status: { in: [...REVENUE_STATUSES] } },
        },
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
        },
      }),
    ]);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const [monthlyOrders, allRecentOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: { in: [...REVENUE_STATUSES] },
          createdAt: { gte: sixMonthsAgo },
        },
        select: { total: true, createdAt: true },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { status: true, createdAt: true },
      }),
    ]);

    const revenueByMonthMap = new Map<
      string,
      { revenue: number; orders: number }
    >();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonthMap.set(key, { revenue: 0, orders: 0 });
    }

    for (const order of monthlyOrders) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const bucket = revenueByMonthMap.get(key);
      if (!bucket) continue;
      bucket.revenue += Number(order.total);
      bucket.orders += 1;
    }

    const productMap = new Map<string, { quantity: number; revenue: number }>();

    for (const item of orderItems) {
      const current = productMap.get(item.productName) ?? {
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += Number(item.unitPrice) * item.quantity;
      productMap.set(item.productName, current);
    }

    const topProducts = [...productMap.entries()]
      .map(([productName, stats]) => ({
        productName,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const ordersByStatus = statusGroups.reduce<Record<string, number>>(
      (acc, group) => {
        acc[group.status] = group._count._all;
        return acc;
      },
      {},
    );

    const statusMonthMap = new Map<
      string,
      {
        PENDING: number;
        PAID: number;
        SHIPPED: number;
        DELIVERED: number;
        CANCELLED: number;
      }
    >();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      statusMonthMap.set(key, {
        PENDING: 0,
        PAID: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      });
    }

    for (const order of allRecentOrders) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const bucket = statusMonthMap.get(key);
      if (!bucket) continue;
      const status = order.status as keyof typeof bucket;
      if (status in bucket) {
        bucket[status] += 1;
      }
    }

    return new AdminStatsResponse(
      Number(revenueAgg._sum.total ?? 0),
      Number(revenueMonthAgg._sum.total ?? 0),
      totalOrders,
      ordersByStatus,
      totalUsers,
      totalAdmins,
      totalProducts,
      [...revenueByMonthMap.entries()].map(([month, stats]) => ({
        month,
        revenue: stats.revenue,
        orders: stats.orders,
      })),
      [...statusMonthMap.entries()].map(([month, stats]) => ({
        month,
        ...stats,
      })),
      topProducts,
      recentOrders.map((order) => ({
        id: order.id,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        userId: order.userId,
      })),
    );
  }
}

@Injectable()
export class UpdateUserRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string, input: UpdateUserRoleDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role === 'ADMIN' && input.role === 'CUSTOMER') {
      const adminCount = await this.prisma.user.count({
        where: { role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Não é possível remover o último administrador da plataforma',
        );
      }
    }

    const updated = user.update({ role: input.role });
    await this.userRepository.update(updated);

    const record = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!record) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return record;
  }
}

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Não é possível excluir o último administrador da plataforma',
        );
      }
    }

    const ordersCount = await this.prisma.order.count({
      where: { userId },
    });

    if (ordersCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir usuário com pedidos na plataforma',
      );
    }

    await this.userRepository.delete(userId);
  }
}
