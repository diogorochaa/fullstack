import { Inject, Injectable } from '@nestjs/common';
import { TOKEN_SERVICE } from 'src/modules/auth/domain/constants/auth.tokens';
import { TokenService } from 'src/modules/auth/domain/services/token.service';
import { CreateUserDto } from 'src/modules/users/application/dto/create-user.dto';
import { CreateUserUseCase } from 'src/modules/users/application/use-cases/create-user/create-user.usecase';
import { User } from 'src/modules/users/domain/entities/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly createUser: CreateUserUseCase,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    input: CreateUserDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.createUser.execute(input);

    const tokenPayload = {
      sub: user.id,
      email: user.email.getValue(),
      role: user.role,
    };

    const accessToken = await this.tokenService.sign(tokenPayload);
    const refreshToken = await this.tokenService.signRefresh(tokenPayload);

    return { user, accessToken, refreshToken };
  }
}
