import { InvalidEmailException } from '../exceptions/invalid-email.exception';

export class EmailValueObject {
  private constructor(private readonly value: string) {}

  static create(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      throw new InvalidEmailException(email);
    }

    return EmailValueObject.fromPersistence(email.toLowerCase());
  }

  static fromPersistence(email: string) {
    return new EmailValueObject(email);
  }

  getValue() {
    return this.value;
  }
}
