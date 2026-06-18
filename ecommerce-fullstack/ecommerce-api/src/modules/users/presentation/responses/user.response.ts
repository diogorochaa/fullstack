import { User } from 'src/modules/users/domain/entities/user.entity';

export class UserResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: string,
  ) {}

  static fromUser(user: User): UserResponse {
    return new UserResponse(
      user.id,
      user.name,
      user.email.getValue(),
      user.role,
    );
  }
}
