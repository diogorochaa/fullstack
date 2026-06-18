import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY } from 'src/modules/orders/domain/constants/order.tokens';
import { OrderNotFoundException } from 'src/modules/orders/domain/exceptions/order-not-found.exception';
import { OrderRepository } from 'src/modules/orders/domain/repositories/order.repository';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: OrderRepository,
  ) {}

  async execute(userId: string) {
    return this.repository.findByUserId(userId);
  }
}

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: OrderRepository,
  ) {}

  async execute(userId: string, id: string) {
    const order = await this.repository.findByUserIdAndId(userId, id);

    if (!order) {
      throw new OrderNotFoundException(id);
    }

    return order;
  }
}
