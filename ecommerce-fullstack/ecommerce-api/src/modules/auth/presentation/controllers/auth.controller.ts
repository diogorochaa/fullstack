import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from 'src/modules/auth/application/dto/login.dto';
import { RefreshTokenDto } from 'src/modules/auth/application/dto/refresh-token.dto';
import { LoginUseCase } from 'src/modules/auth/application/use-cases/login/login.usecase';
import { RefreshTokenUseCase } from 'src/modules/auth/application/use-cases/refresh-token/refresh-token.usecase';
import { RegisterUseCase } from 'src/modules/auth/application/use-cases/register/register.usecase';
import { AuthResponse } from 'src/modules/auth/presentation/responses/auth.response';
import { CreateUserDto } from 'src/modules/users/application/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() body: CreateUserDto): Promise<AuthResponse> {
    const { user, accessToken, refreshToken } =
      await this.registerUseCase.execute(body);

    return AuthResponse.fromSession(
      user,
      accessToken,
      refreshToken,
      this.getExpiresIn(),
      this.getRefreshExpiresIn(),
    );
  }

  @Post('login')
  @Throttle({
    default: {
      limit: Number(process.env.THROTTLE_LOGIN_LIMIT ?? 5),
      ttl: Number(process.env.THROTTLE_TTL ?? 60_000),
    },
  })
  async login(@Body() body: LoginDto): Promise<AuthResponse> {
    const { user, accessToken, refreshToken } =
      await this.loginUseCase.execute(body);

    return AuthResponse.fromSession(
      user,
      accessToken,
      refreshToken,
      this.getExpiresIn(),
      this.getRefreshExpiresIn(),
    );
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthResponse> {
    const { user, accessToken, refreshToken } =
      await this.refreshTokenUseCase.execute(body);

    return AuthResponse.fromSession(
      user,
      accessToken,
      refreshToken,
      this.getExpiresIn(),
      this.getRefreshExpiresIn(),
    );
  }

  private getExpiresIn(): string {
    return this.config.get<string>('jwt.expiresIn') ?? '1d';
  }

  private getRefreshExpiresIn(): string {
    return this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';
  }
}
