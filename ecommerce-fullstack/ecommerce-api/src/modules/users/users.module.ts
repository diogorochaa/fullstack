import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CreateUserUseCase } from 'src/modules/users/application/use-cases/create-user/create-user.usecase';
import { GetUserUseCase } from 'src/modules/users/application/use-cases/get-user/get-user.usecase';
import { UpdateUserUseCase } from 'src/modules/users/application/use-cases/update-user/update-user.usecase';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { PrismaUserRepository } from 'src/modules/users/infrastructure/repositories/prisma-user.repository';
import { UsersController } from 'src/modules/users/presentation/controllers/users.controller';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    USER_REPOSITORY,
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
  ],
})
export class UsersModule {}
