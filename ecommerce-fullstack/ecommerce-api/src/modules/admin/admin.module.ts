import { Module } from '@nestjs/common';
import {
  DeleteUserUseCase,
  GetAdminStatsUseCase,
  ListAllOrdersUseCase,
  ListAllUsersUseCase,
  UpdateOrderStatusUseCase,
  UpdateUserRoleUseCase,
} from 'src/modules/admin/application/use-cases/admin/admin.usecase';
import { AdminController } from 'src/modules/admin/presentation/controllers/admin.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { UsersModule } from 'src/modules/users/users.module';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { EventsModule } from 'src/shared/messaging/events/events.module';

@Module({
  imports: [AuthModule, OrdersModule, UsersModule, EventsModule],
  controllers: [AdminController],
  providers: [
    ListAllOrdersUseCase,
    UpdateOrderStatusUseCase,
    ListAllUsersUseCase,
    GetAdminStatsUseCase,
    UpdateUserRoleUseCase,
    DeleteUserUseCase,
    RolesGuard,
  ],
})
export class AdminModule {}
