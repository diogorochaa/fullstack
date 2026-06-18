import * as bcrypt from 'bcrypt';
import { InvalidPasswordException } from '../exceptions/invalid-password.exception';

export class PasswordValueObject {
  private constructor(private readonly value: string) {}

  static async create(rawPassword: string) {
    if (rawPassword.length < 6) {
      throw new InvalidPasswordException();
    }

    const hash = await bcrypt.hash(rawPassword, 10);

    return PasswordValueObject.fromPersistence(hash);
  }

  static fromPersistence(hash: string) {
    return new PasswordValueObject(hash);
  }

  static async compare(rawPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hash);
  }

  getValue() {
    return this.value;
  }
}
