import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY } from 'src/modules/addresses/domain/constants/address.tokens';
import { AddressForbiddenException } from 'src/modules/addresses/domain/exceptions/address-forbidden.exception';
import { AddressNotFoundException } from 'src/modules/addresses/domain/exceptions/address-not-found.exception';
import { AddressRepository } from 'src/modules/addresses/domain/repositories/address.repository';
import { CART_REPOSITORY } from 'src/modules/cart/domain/constants/cart.tokens';
import { EmptyCartException } from 'src/modules/cart/domain/exceptions/empty-cart.exception';
import { CartRepository } from 'src/modules/cart/domain/repositories/cart.repository';
import { CreateOrderDto } from 'src/modules/orders/application/dto/create-order.dto';
import { ORDER_REPOSITORY } from 'src/modules/orders/domain/constants/order.tokens';
import {
  CreateOrderItemInput,
  OrderRepository,
} from 'src/modules/orders/domain/repositories/order.repository';
import { PRODUCT_REPOSITORY } from 'src/modules/products/domain/constants/product.tokens';
import { InsufficientStockException } from 'src/modules/products/domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from 'src/modules/products/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { DomainEventsService } from 'src/shared/messaging/events/domain-events.service';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly events: DomainEventsService,
  ) {}

  async execute(userId: string, input: CreateOrderDto) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart || cart.items.length === 0) {
      throw new EmptyCartException();
    }

    const address = await this.addressRepository.findById(input.addressId);

    if (!address) {
      throw new AddressNotFoundException(input.addressId);
    }

    if (address.userId !== userId) {
      throw new AddressForbiddenException();
    }

    const orderItems: CreateOrderItemInput[] = [];

    for (const item of cart.items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product || !product.active) {
        throw new ProductNotFoundException(item.productId);
      }

      if (product.stock < item.quantity) {
        throw new InsufficientStockException(product.name, product.stock);
      }

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    const total = cart.calculateSubtotal();

    const order = await this.orderRepository.createFromCart({
      userId,
      addressId: input.addressId,
      cartId: cart.id,
      items: orderItems,
      total,
    });

    await this.events.orderCreated({
      orderId: order.id,
      userId: order.userId,
      addressId: order.addressId,
      total: order.total,
      itemCount: order.items.length,
      status: order.status,
    });

    return order;
  }
}
