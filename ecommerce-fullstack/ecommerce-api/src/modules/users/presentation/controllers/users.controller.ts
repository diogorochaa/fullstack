import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/auth/domain/types/authenticated-user';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import { UpdateUserDto } from 'src/modules/users/application/dto/update-user.dto';
import { GetUserUseCase } from 'src/modules/users/application/use-cases/get-user/get-user.usecase';
import { UpdateUserUseCase } from 'src/modules/users/application/use-cases/update-user/update-user.usecase';
import { UserResponse } from 'src/modules/users/presentation/responses/user.response';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
  ) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    const found = await this.getUser.execute(user.userId);
    return UserResponse.fromUser(found);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponse> {
    const updated = await this.updateUser.execute(user.userId, body);
    return UserResponse.fromUser(updated);
  }
}
