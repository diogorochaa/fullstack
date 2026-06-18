import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/auth/domain/types/authenticated-user';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import { AddCartItemDto } from 'src/modules/cart/application/dto/add-cart-item.dto';
import { UpdateCartItemDto } from 'src/modules/cart/application/dto/update-cart-item.dto';
import {
  AddCartItemUseCase,
  GetCartUseCase,
} from 'src/modules/cart/application/use-cases/cart/cart.usecase';
import {
  RemoveCartItemUseCase,
  UpdateCartItemUseCase,
} from 'src/modules/cart/application/use-cases/update-cart-item/update-cart-item.usecase';
import { CartResponse } from 'src/modules/cart/presentation/responses/cart.response';

@ApiTags('cart')
@ApiBearerAuth('access-token')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly getCart: GetCartUseCase,
    private readonly addCartItem: AddCartItemUseCase,
    private readonly updateCartItem: UpdateCartItemUseCase,
    private readonly removeCartItem: RemoveCartItemUseCase,
  ) {}

  @Get()
  async show(@CurrentUser() user: AuthenticatedUser): Promise<CartResponse> {
    const cart = await this.getCart.execute(user.userId);
    return CartResponse.fromEntity(cart);
  }

  @Post('items')
  async addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AddCartItemDto,
  ): Promise<CartResponse> {
    const cart = await this.addCartItem.execute(user.userId, body);
    return CartResponse.fromEntity(
      cart ?? (await this.getCart.execute(user.userId)),
    );
  }

  @Patch('items/:id')
  async updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const cart = await this.updateCartItem.execute(user.userId, id, body);
    return CartResponse.fromEntity(
      cart ?? (await this.getCart.execute(user.userId)),
    );
  }

  @Delete('items/:id')
  async removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<CartResponse> {
    const cart = await this.removeCartItem.execute(user.userId, id);
    return CartResponse.fromEntity(
      cart ?? (await this.getCart.execute(user.userId)),
    );
  }
}
