import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateOrderStatusDto } from 'src/modules/admin/application/dto/update-order-status.dto';
import { UpdateUserRoleDto } from 'src/modules/admin/application/dto/update-user-role.dto';
import {
  DeleteUserUseCase,
  GetAdminStatsUseCase,
  ListAllOrdersUseCase,
  ListAllUsersUseCase,
  UpdateOrderStatusUseCase,
  UpdateUserRoleUseCase,
} from 'src/modules/admin/application/use-cases/admin/admin.usecase';
import { AdminStatsResponse } from 'src/modules/admin/presentation/responses/admin-stats.response';
import {
  AdminUserResponse,
  PaginatedAdminUserResponse,
} from 'src/modules/admin/presentation/responses/admin-user.response';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import {
  OrderResponse,
  PaginatedOrderResponse,
} from 'src/modules/orders/presentation/responses/order.response';
import { Roles } from 'src/shared/auth/roles.decorator';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly listAllOrders: ListAllOrdersUseCase,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase,
    private readonly listAllUsers: ListAllUsersUseCase,
    private readonly getAdminStats: GetAdminStatsUseCase,
    private readonly updateUserRole: UpdateUserRoleUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Get('stats')
  async stats(): Promise<AdminStatsResponse> {
    return this.getAdminStats.execute();
  }

  @Get('orders')
  async listOrders(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedOrderResponse> {
    const result = await this.listAllOrders.execute(
      query.page ?? 1,
      query.limit ?? 20,
    );

    return PaginatedOrderResponse.fromResult(result);
  }

  @Patch('orders/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    const order = await this.updateOrderStatus.execute(id, body);
    return OrderResponse.fromEntity(order);
  }

  @Get('users')
  async listUsers(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedAdminUserResponse> {
    const result = await this.listAllUsers.execute(
      query.page ?? 1,
      query.limit ?? 20,
      query.search,
    );

    return PaginatedAdminUserResponse.fromResult(result);
  }

  @Patch('users/:id/role')
  async changeUserRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
  ): Promise<AdminUserResponse> {
    const user = await this.updateUserRole.execute(id, body);
    return AdminUserResponse.fromRecord(user);
  }

  @Delete('users/:id')
  async removeUser(@Param('id') id: string): Promise<{ success: true }> {
    await this.deleteUser.execute(id);
    return { success: true };
  }
}
