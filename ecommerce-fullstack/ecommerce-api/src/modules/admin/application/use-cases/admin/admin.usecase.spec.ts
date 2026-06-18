import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderItem } from 'src/modules/orders/domain/entities/order-item.entity';
import { Order } from 'src/modules/orders/domain/entities/order.entity';
import { InvalidOrderStatusException } from 'src/modules/orders/domain/exceptions/invalid-order-status.exception';
import { OrderNotFoundException } from 'src/modules/orders/domain/exceptions/order-not-found.exception';
import { OrderRepository } from 'src/modules/orders/domain/repositories/order.repository';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';
import { EmailValueObject } from 'src/modules/users/domain/value-objects/email.vo';
import { PasswordValueObject } from 'src/modules/users/domain/value-objects/password.vo';
import { DomainEventsService } from 'src/shared/messaging/events/domain-events.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  DeleteUserUseCase,
  GetAdminStatsUseCase,
  UpdateOrderStatusUseCase,
  UpdateUserRoleUseCase,
} from './admin.usecase';

function buildUser(role: string, id = 'user-1') {
  return User.create({
    id,
    name: 'Usuário Teste',
    email: EmailValueObject.fromPersistence('teste@shopmax.com'),
    password: PasswordValueObject.fromPersistence('hash'),
    role,
  });
}

describe('Admin use cases', () => {
  describe('DeleteUserUseCase', () => {
    const userRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as UserRepository;

    const prisma = {
      user: { count: jest.fn() },
      order: { count: jest.fn() },
    } as unknown as PrismaService;

    const useCase = new DeleteUserUseCase(userRepository, prisma);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deletes customer without orders', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue(buildUser('CUSTOMER'));
      jest.spyOn(prisma.order, 'count').mockResolvedValue(0);
      jest.spyOn(userRepository, 'delete').mockResolvedValue(undefined);

      await expect(useCase.execute('user-1')).resolves.toBeUndefined();
      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });

    it('throws when user has orders', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue(buildUser('CUSTOMER'));
      jest.spyOn(prisma.order, 'count').mockResolvedValue(2);

      await expect(useCase.execute('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when trying to delete the last admin', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue(buildUser('ADMIN'));
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);

      await expect(useCase.execute('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when user is not found', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(useCase.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UpdateOrderStatusUseCase', () => {
    const orderRepository = {
      findById: jest.fn(),
      transitionStatus: jest.fn(),
    } as unknown as OrderRepository;

    const events = {
      orderStatusChanged: jest.fn(),
    } as unknown as DomainEventsService;

    const useCase = new UpdateOrderStatusUseCase(orderRepository, events);

    const pendingOrder = Order.create({
      id: 'order-1',
      userId: 'user-1',
      addressId: 'addr-1',
      status: 'PENDING',
      total: 100,
      items: [new OrderItem('item-1', 'order-1', 'prod-1', 'Tênis', 1, 100)],
      createdAt: new Date(),
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('transitions PENDING to PAID', async () => {
      jest.spyOn(orderRepository, 'findById').mockResolvedValue(pendingOrder);
      jest.spyOn(orderRepository, 'transitionStatus').mockResolvedValue(
        Order.create({
          id: pendingOrder.id,
          userId: pendingOrder.userId,
          addressId: pendingOrder.addressId,
          status: 'PAID',
          total: pendingOrder.total,
          items: pendingOrder.items,
          createdAt: pendingOrder.createdAt,
        }),
      );

      await useCase.execute('order-1', { status: 'PAID' });

      expect(orderRepository.transitionStatus).toHaveBeenCalledWith(
        'order-1',
        'PENDING',
        'PAID',
      );
      expect(events.orderStatusChanged).toHaveBeenCalled();
    });

    it('rejects invalid transition PENDING → DELIVERED', async () => {
      jest.spyOn(orderRepository, 'findById').mockResolvedValue(pendingOrder);

      await expect(
        useCase.execute('order-1', { status: 'DELIVERED' }),
      ).rejects.toThrow(InvalidOrderStatusException);
    });

    it('throws when order is not found', async () => {
      jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);

      await expect(
        useCase.execute('missing', { status: 'PAID' }),
      ).rejects.toThrow(OrderNotFoundException);
    });
  });

  describe('UpdateUserRoleUseCase', () => {
    const userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as UserRepository;

    const prisma = {
      user: {
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    const useCase = new UpdateUserRoleUseCase(userRepository, prisma);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('promotes customer to admin', async () => {
      const customer = buildUser('CUSTOMER');
      jest.spyOn(userRepository, 'findById').mockResolvedValue(customer);
      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'teste@shopmax.com',
        role: 'ADMIN',
        createdAt: new Date(),
      });

      const result = await useCase.execute('user-1', { role: 'ADMIN' });

      expect(result.role).toBe('ADMIN');
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('blocks demoting the last admin', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue(buildUser('ADMIN'));
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);

      await expect(
        useCase.execute('user-1', { role: 'CUSTOMER' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GetAdminStatsUseCase', () => {
    const prisma = {
      order: {
        aggregate: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      user: { count: jest.fn() },
      product: { count: jest.fn() },
      orderItem: { findMany: jest.fn() },
    } as unknown as PrismaService;

    const useCase = new GetAdminStatsUseCase(prisma);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('aggregates dashboard metrics', async () => {
      jest
        .spyOn(prisma.order, 'aggregate')
        .mockResolvedValue({ _sum: { total: 1500 } });
      jest.spyOn(prisma.order, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.order, 'groupBy').mockResolvedValue([
        { status: 'PAID', _count: { _all: 4 } },
        { status: 'DELIVERED', _count: { _all: 6 } },
      ]);
      jest
        .spyOn(prisma.user, 'count')
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2);
      jest.spyOn(prisma.product, 'count').mockResolvedValue(32);
      jest.spyOn(prisma.order, 'findMany').mockImplementation(async (args) => {
        if (args?.select?.status) {
          return [
            {
              status: 'PAID',
              createdAt: new Date(),
            },
          ];
        }

        if (args?.select?.total) {
          return [{ total: 100, createdAt: new Date() }];
        }

        return [
          {
            id: 'order-1',
            total: 100,
            status: 'PAID',
            createdAt: new Date(),
            userId: 'user-1',
          },
        ];
      });
      jest.spyOn(prisma.orderItem, 'findMany').mockResolvedValue([
        {
          productName: 'Tênis Nike',
          quantity: 2,
          unitPrice: 100,
        },
      ]);

      const stats = await useCase.execute();

      expect(stats.totalRevenue).toBe(1500);
      expect(stats.totalOrders).toBe(10);
      expect(stats.totalUsers).toBe(8);
      expect(stats.totalProducts).toBe(32);
      expect(stats.topProducts[0].productName).toBe('Tênis Nike');
      expect(stats.ordersByStatus.PAID).toBe(4);
    });
  });
});
