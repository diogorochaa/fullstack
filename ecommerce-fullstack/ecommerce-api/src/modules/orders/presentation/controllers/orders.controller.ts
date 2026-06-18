import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/auth/domain/types/authenticated-user';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import { CreateOrderDto } from 'src/modules/orders/application/dto/create-order.dto';
import { CreateOrderUseCase } from 'src/modules/orders/application/use-cases/create-order/create-order.usecase';
import {
  GetOrderUseCase,
  ListOrdersUseCase,
} from 'src/modules/orders/application/use-cases/get-order/get-order.usecase';
import { OrderResponse } from 'src/modules/orders/presentation/responses/order.response';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly listOrders: ListOrdersUseCase,
    private readonly getOrder: GetOrderUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateOrderDto,
  ): Promise<OrderResponse> {
    const order = await this.createOrder.execute(user.userId, body);
    return OrderResponse.fromEntity(order);
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<OrderResponse[]> {
    const orders = await this.listOrders.execute(user.userId);
    return orders.map((order) => OrderResponse.fromEntity(order));
  }

  @Get(':id')
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    const order = await this.getOrder.execute(user.userId, id);
    return OrderResponse.fromEntity(order);
  }
}
