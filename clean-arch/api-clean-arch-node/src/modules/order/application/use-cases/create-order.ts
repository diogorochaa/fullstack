import { randomUUID } from "node:crypto";
import { ProductNotFoundError } from "../../../product/application/errors/product-not-found-error";
import type { ProductsRepository } from "../../../product/domain/repository/products-repository";
import { UserNotFoundError } from "../../../user/application/errors/user-not-found-error";
import type { UsersRepository } from "../../../user/domain/repository/users-repository";
import { Order } from "../../domain/entity/order";
import type { OrdersRepository } from "../../domain/repository/orders-repository";
import type { CreateOrderInputDto } from "../dtos/create-order-dto";
import type { OrderResponseDto } from "../dtos/order-response-dto";
import { orderToResponseDto } from "../mappers/order-to-response-dto";

export class CreateOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute(input: CreateOrderInputDto): Promise<OrderResponseDto> {
    const user = await this.usersRepository.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    const product = await this.productsRepository.findById(input.productId);

    if (!product) {
      throw new ProductNotFoundError(input.productId);
    }

    const now = new Date();
    const order = Order.create({
      id: randomUUID(),
      userId: user.id,
      productId: product.id,
      quantity: input.quantity,
      price: product.price,
      createdAt: now,
      updatedAt: now,
    });

    const createdOrder = await this.ordersRepository.create(order);

    return orderToResponseDto(createdOrder);
  }
}
