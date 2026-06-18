import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenDto } from 'src/modules/auth/application/dto/refresh-token.dto';
import { TOKEN_SERVICE } from 'src/modules/auth/domain/constants/auth.tokens';
import { InvalidRefreshTokenException } from 'src/modules/auth/domain/exceptions/invalid-refresh-token.exception';
import { TokenService } from 'src/modules/auth/domain/services/token.service';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    input: RefreshTokenDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const payload = await this.tokenService.verifyRefresh(input.refreshToken);

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new InvalidRefreshTokenException();
    }

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
