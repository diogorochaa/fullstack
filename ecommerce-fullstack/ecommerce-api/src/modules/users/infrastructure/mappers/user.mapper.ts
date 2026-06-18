import { User } from '../../domain/entities/user.entity';
import { EmailValueObject } from '../../domain/value-objects/email.vo';
import { PasswordValueObject } from '../../domain/value-objects/password.vo';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

export class UserMapper {
  static toPersistence(user: User): UserRecord {
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      password: user.password.getValue(),
      role: user.role,
    };
  }

  static toDomain(record: UserRecord): User {
    return User.create({
      id: record.id,
      name: record.name,
      email: EmailValueObject.fromPersistence(record.email),
      password: PasswordValueObject.fromPersistence(record.password),
      role: record.role,
    });
  }
}
