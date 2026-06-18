import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { LoginUseCase } from 'src/modules/auth/application/use-cases/login/login.usecase';
import { RefreshTokenUseCase } from 'src/modules/auth/application/use-cases/refresh-token/refresh-token.usecase';
import { RegisterUseCase } from 'src/modules/auth/application/use-cases/register/register.usecase';
import { TOKEN_SERVICE } from 'src/modules/auth/domain/constants/auth.tokens';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { JwtTokenService } from 'src/modules/auth/infrastructure/jwt/jwt-token.service';
import jwtConfig from 'src/modules/auth/infrastructure/jwt/jwt.config';
import { JwtStrategy } from 'src/modules/auth/infrastructure/passport/jwt.strategy';
import { AuthController } from 'src/modules/auth/presentation/controllers/auth.controller';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('jwt.expiresIn') as StringValue,
        },
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
  ],
  exports: [JwtAuthGuard, TOKEN_SERVICE],
})
export class AuthModule {}
