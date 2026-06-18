import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InsufficientStockException } from 'src/modules/products/domain/exceptions/insufficient-stock.exception';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { buildPaginatedResult } from 'src/shared/types/paginated-result';
import { Order } from '../../domain/entities/order.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFromCart(params: {
    userId: string;
    addressId: string;
    cartId: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }[];
    total: number;
  }): Promise<Order> {
    const orderId = randomUUID();

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          id: orderId,
          userId: params.userId,
          addressId: params.addressId,
          status: 'PENDING',
          total: params.total,
          items: {
            create: params.items.map((item) => ({
              id: randomUUID(),
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of params.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true, stock: true },
          });
          throw new InsufficientStockException(
            product?.name ?? item.productName,
            product?.stock ?? 0,
          );
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: params.cartId } });

      return created;
    });

    return OrderMapper.toDomain(order);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    return OrderMapper.toDomain(order);
  }

  async findByUserIdAndId(userId: string, id: string): Promise<Order | null> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    return OrderMapper.toDomain(order);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => OrderMapper.toDomain(order));
  }

  async findAllPaginated(page: number, limit: number) {
    const [records, total] = await Promise.all([
      this.prisma.order.findMany({
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return buildPaginatedResult(
      records.map((order) => OrderMapper.toDomain(order)),
      total,
      page,
      limit,
    );
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: status as
          | 'PENDING'
          | 'PAID'
          | 'SHIPPED'
          | 'DELIVERED'
          | 'CANCELLED',
      },
      include: { items: true },
    });

    return OrderMapper.toDomain(order);
  }

  async transitionStatus(
    id: string,
    fromStatus: string,
    toStatus: string,
  ): Promise<Order> {
    const order = await this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!current) {
        return null;
      }

      if (toStatus === 'CANCELLED' && fromStatus !== 'CANCELLED') {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status: toStatus as
            | 'PENDING'
            | 'PAID'
            | 'SHIPPED'
            | 'DELIVERED'
            | 'CANCELLED',
        },
        include: { items: true },
      });
    });

    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    return OrderMapper.toDomain(order);
  }
}
