import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedUser } from 'src/modules/auth/domain/types/authenticated-user';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (payload.type === 'refresh') {
      throw new UnauthorizedException(
        'Token de atualização não pode ser usado como acesso',
      );
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      userId: user.id,
      email: user.email.getValue(),
      role: user.role,
    };
  }
}
