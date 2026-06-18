import { User } from 'src/modules/users/domain/entities/user.entity';
import { UserResponse } from 'src/modules/users/presentation/responses/user.response';

export class AuthResponse {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly tokenType: 'Bearer',
    public readonly expiresIn: string,
    public readonly refreshExpiresIn: string,
    public readonly user: UserResponse,
  ) {}

  static fromSession(
    user: User,
    accessToken: string,
    refreshToken: string,
    expiresIn: string,
    refreshExpiresIn: string,
  ): AuthResponse {
    return new AuthResponse(
      accessToken,
      refreshToken,
      'Bearer',
      expiresIn,
      refreshExpiresIn,
      UserResponse.fromUser(user),
    );
  }
}
