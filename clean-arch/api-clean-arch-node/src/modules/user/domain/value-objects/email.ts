import { InvalidEmailError } from "../errors/invalid-email-error";

export class Email {
  private constructor(private readonly email: string) {}

  static create(email: string): Email {
    const normalizedEmail = email.toLowerCase().trim();

    if (!Email.isValid(normalizedEmail)) {
      throw new InvalidEmailError(email);
    }

    return new Email(normalizedEmail);
  }

  get value(): string {
    return this.email;
  }

  equals(email: Email): boolean {
    return this.email === email.value;
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
