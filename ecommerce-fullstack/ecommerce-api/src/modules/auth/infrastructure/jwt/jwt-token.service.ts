import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { InvalidRefreshTokenException } from 'src/modules/auth/domain/exceptions/invalid-refresh-token.exception';
import {
  TokenPayload,
  TokenService,
} from 'src/modules/auth/domain/services/token.service';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async sign(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, type: 'access' },
      {
        secret: this.config.getOrThrow<string>('jwt.secret'),
        expiresIn: this.config.getOrThrow<string>(
          'jwt.expiresIn',
        ) as StringValue,
      },
    );
  }

  async signRefresh(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      {
        secret: this.config.getOrThrow<string>('jwt.secret'),
        expiresIn: this.config.getOrThrow<string>(
          'jwt.refreshExpiresIn',
        ) as StringValue,
      },
    );
  }

  async verifyRefresh(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.config.getOrThrow<string>('jwt.secret'),
      });

      if (payload.type !== 'refresh') {
        throw new InvalidRefreshTokenException();
      }

      return payload;
    } catch {
      throw new InvalidRefreshTokenException();
    }
  }
}
